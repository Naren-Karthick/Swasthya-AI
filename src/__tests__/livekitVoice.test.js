/**
 * LiveKit WebRTC Voice Engine & Token Verification Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TokenVerifier } from 'livekit-server-sdk';
import { getLiveKitConfig, getLiveKitToken } from '../utils/livekitToken.js';
import { LiveKitVoiceSession } from '../utils/livekitVoice.js';

describe('Swasthya AI — LiveKit WebRTC Voice Engine Tests', () => {

  it('should return valid LiveKit Cloud configuration matching user credentials', () => {
    const config = getLiveKitConfig();
    assert.ok(config.url, 'LiveKit URL should be defined');
    assert.match(config.url, /^wss:\/\/.*livekit\.cloud/, 'LiveKit URL should be a valid LiveKit Cloud WebSocket endpoint');
    assert.ok(config.apiKey, 'API key should be configured');
    assert.ok(config.apiSecret, 'API secret should be configured');
  });

  it('should generate valid HMAC-SHA256 LiveKit AccessToken verifiable by TokenVerifier', async () => {
    const config = getLiveKitConfig();
    const roomName = 'swasthya-test-room';
    const identity = 'patient-unit-test';

    const { token, url, room } = await getLiveKitToken({
      roomName,
      identity,
      name: 'Test Patient'
    });

    assert.ok(token, 'Token string must not be empty');
    assert.equal(url, config.url);
    assert.equal(room, roomName);

    // Verify cryptographic signature and payload using official LiveKit SDK
    const verifier = new TokenVerifier(config.apiKey, config.apiSecret);
    const verified = await verifier.verify(token);

    assert.equal(verified.sub, identity, 'Token identity must match');
    assert.equal(verified.iss, config.apiKey, 'Issuer must match API key');
    assert.equal(verified.video.room, roomName, 'Granted room must match');
    assert.equal(verified.video.roomJoin, true, 'roomJoin grant must be true');
    assert.equal(verified.video.canPublish, true, 'canPublish grant must be true');
    assert.equal(verified.video.canSubscribe, true, 'canSubscribe grant must be true');
  });

  it('LiveKitVoiceSession instantiates with clean initial state and handles callbacks', () => {
    let stateUpdates = [];
    const session = new LiveKitVoiceSession({
      onStateChange: (st) => stateUpdates.push(st)
    });

    assert.equal(session.isConnected, false);
    assert.equal(session.isMuted, false);
    assert.equal(typeof session.connect, 'function');
    assert.equal(typeof session.startMicrophone, 'function');
    assert.equal(typeof session.muteMicrophone, 'function');
    assert.equal(typeof session.disconnect, 'function');

    // Safe disconnect when not connected
    assert.doesNotThrow(() => {
      session.disconnect();
    });
    assert.ok(stateUpdates.includes('DISCONNECTED'));
  });

});
