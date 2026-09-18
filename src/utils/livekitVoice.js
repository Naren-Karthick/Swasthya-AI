/**
 * LiveKit WebRTC Voice Engine for Swasthya AI
 * Manages real-time audio rooms, microphone publishing, remote audio subscription,
 * audio level analysis, and LiveKit data channel events.
 */

import { Room, RoomEvent, Track } from 'livekit-client';
import { getLiveKitToken } from './livekitToken.js';

export class LiveKitVoiceSession {
  constructor(options = {}) {
    this.options = options;
    this.room = null;
    this.localAudioTrack = null;
    this.analyser = null;
    this.audioContext = null;
    this.mediaStreamSource = null;
    this.animFrameId = null;
    this.isConnected = false;
    this.isMuted = false;
    this.remoteAudioElements = new Map();

    // Callbacks
    this.onStateChange = options.onStateChange || (() => {});
    this.onAudioLevel = options.onAudioLevel || (() => {});
    this.onRemoteAudioStarted = options.onRemoteAudioStarted || (() => {});
    this.onRemoteAudioEnded = options.onRemoteAudioEnded || (() => {});
    this.onDataMessage = options.onDataMessage || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * Initializes and connects to the LiveKit WebRTC room
   * 
   * @param {object} params
   * @param {string} [params.roomName]
   * @param {string} [params.identity]
   * @param {string} [params.name]
   */
  async connect({ roomName = 'swasthya-consultation', identity, name = 'Patient' } = {}) {
    try {
      this.onStateChange('CONNECTING');

      // 1. Obtain Room Access Token
      const { token, url } = await getLiveKitToken({ roomName, identity, name });

      // 2. Instantiate LiveKit Room with audio optimizations
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 48000
        }
      });

      this.room = room;

      // 3. Register Room Event Listeners
      this._setupRoomListeners(room);

      // 4. Connect to LiveKit Cloud via WebRTC
      await room.connect(url, token);
      this.isConnected = true;
      this.onStateChange('CONNECTED', { room: room.name, sid: room.sid });

      return room;
    } catch (err) {
      console.warn('LiveKit room connection error:', err);
      this.isConnected = false;
      this.onStateChange('ERROR', { error: err.message });
      this.onError(err);
      throw err;
    }
  }

  /**
   * Setup internal LiveKit room event listeners
   */
  _setupRoomListeners(room) {
    room.on(RoomEvent.Disconnected, () => {
      this.isConnected = false;
      this.onStateChange('DISCONNECTED');
    });

    room.on(RoomEvent.Reconnecting, () => {
      this.onStateChange('RECONNECTING');
    });

    room.on(RoomEvent.Reconnected, () => {
      this.isConnected = true;
      this.onStateChange('CONNECTED');
    });

    // Remote audio track subscribed (e.g. AI voice agent or consulting doctor)
    room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
      if (track.kind === Track.Kind.Audio) {
        const element = track.attach();
        element.id = `livekit-audio-${participant.identity}`;
        document.body.appendChild(element);
        this.remoteAudioElements.set(participant.identity, element);
        this.onRemoteAudioStarted({ participant: participant.identity, track });
      }
    });

    // Remote audio track unsubscribed
    room.on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
      if (track.kind === Track.Kind.Audio) {
        track.detach().forEach(el => el.remove());
        this.remoteAudioElements.delete(participant.identity);
        this.onRemoteAudioEnded({ participant: participant.identity });
      }
    });

    // Active speakers detection
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const isUserSpeaking = speakers.some(s => s.isLocal);
      const isRemoteSpeaking = speakers.some(s => !s.isLocal);
      this.onStateChange('SPEAKERS_UPDATE', { isUserSpeaking, isRemoteSpeaking, speakers });
    });

    // Data channel messages (for real-time notes and transcription sync)
    room.on(RoomEvent.DataReceived, (payload, participant, _kind, topic) => {
      try {
        const decoded = new TextDecoder().decode(payload);
        const json = JSON.parse(decoded);
        this.onDataMessage({ data: json, participant: participant?.identity, topic });
      } catch {
        this.onDataMessage({ raw: payload, participant: participant?.identity, topic });
      }
    });
  }

  /**
   * Starts local microphone streaming into the LiveKit WebRTC room
   */
  async startMicrophone() {
    if (!this.room) {
      throw new Error('LiveKit room is not connected.');
    }

    try {
      // Enable microphone on local participant with high-quality noise cancellation
      await this.room.localParticipant.setMicrophoneEnabled(true, {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      });

      this.isMuted = false;

      // Extract local audio track for visualizer
      const audioPublication = Array.from(this.room.localParticipant.audioTrackPublications.values())[0];
      if (audioPublication && audioPublication.track) {
        this.localAudioTrack = audioPublication.track;
        this._startAudioVisualizer(this.localAudioTrack.mediaStreamTrack);
      }

      this.onStateChange('MICROPHONE_ACTIVE');
      return true;
    } catch (err) {
      console.warn('LiveKit microphone start error:', err);
      this.onError(err);
      throw err;
    }
  }

  /**
   * Mute or pause microphone publishing
   */
  async muteMicrophone() {
    if (!this.room) return;
    try {
      await this.room.localParticipant.setMicrophoneEnabled(false);
      this.isMuted = true;
      this._stopAudioVisualizer();
      this.onStateChange('MICROPHONE_MUTED');
    } catch (err) {
      console.warn('LiveKit mute error:', err);
    }
  }

  /**
   * Unmute microphone publishing
   */
  async unmuteMicrophone() {
    return this.startMicrophone();
  }

  /**
   * Broadcast structured data (e.g. live symptoms or chat) to all room participants
   */
  async broadcastData(data, topic = 'swasthya-triage') {
    if (!this.room || !this.room.localParticipant) return;
    try {
      const encoded = new TextEncoder().encode(JSON.stringify(data));
      await this.room.localParticipant.publishData(encoded, { reliable: true, topic });
    } catch (err) {
      console.warn('LiveKit broadcastData error:', err);
    }
  }

  /**
   * Internal Web Audio analyser to drive visualizer animations
   */
  _startAudioVisualizer(mediaStreamTrack) {
    if (typeof window === 'undefined') return;
    try {
      this._stopAudioVisualizer();

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      this.audioContext = audioCtx;

      const mediaStream = new MediaStream([mediaStreamTrack]);
      const source = audioCtx.createMediaStreamSource(mediaStream);
      this.mediaStreamSource = source;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      this.analyser = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize 1.0 - 2.2 scale for CSS transforms
        const scaled = Math.min(2.2, Math.max(1, 1 + (avg / 35)));
        this.onAudioLevel(scaled);
        this.animFrameId = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn('Visualizer startup note:', e);
    }
  }

  _stopAudioVisualizer() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStreamSource) {
      try { this.mediaStreamSource.disconnect(); } catch {}
      this.mediaStreamSource = null;
    }
    if (this.analyser) {
      try { this.analyser.disconnect(); } catch {}
      this.analyser = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
    this.onAudioLevel(1);
  }

  /**
   * Disconnects from the room and releases all tracks and hardware devices
   */
  disconnect() {
    this._stopAudioVisualizer();

    // Remove remote audio elements
    this.remoteAudioElements.forEach(el => {
      try {
        el.pause();
        el.srcObject = null;
        el.remove();
      } catch {}
    });
    this.remoteAudioElements.clear();

    // Disconnect room
    if (this.room) {
      try {
        this.room.disconnect();
      } catch (err) {
        console.warn('LiveKit disconnect notice:', err);
      }
      this.room = null;
    }

    this.isConnected = false;
    this.localAudioTrack = null;
    this.onStateChange('DISCONNECTED');
  }
}
