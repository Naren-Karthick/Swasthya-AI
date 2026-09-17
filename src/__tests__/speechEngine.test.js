/**
 * Audio Engine & Speech Narration Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { 
  LANGUAGE_LOCALES, 
  AUDIO_LABELS, 
  stopSpeech, 
  speakAssessmentText 
} from '../utils/speechEngine.js';
import { languages } from '../localization.js';

describe('Swasthya AI — Audio & Voice Narration Engine Tests', () => {

  it('should have locale mapping for all 8 supported languages', () => {
    languages.forEach((lang) => {
      assert.ok(
        LANGUAGE_LOCALES[lang.code], 
        `Missing locale mapping for language ${lang.code} (${lang.name})`
      );
      assert.match(
        LANGUAGE_LOCALES[lang.code], 
        /-IN$/, 
        `Locale for ${lang.code} should target Indian regional accent (got ${LANGUAGE_LOCALES[lang.code]})`
      );
    });
  });

  it('should have localized UI audio labels for all 8 supported languages', () => {
    languages.forEach((lang) => {
      const labels = AUDIO_LABELS[lang.code];
      assert.ok(labels, `Missing audio labels for ${lang.code}`);
      assert.ok(labels.listen, `Missing listen label for ${lang.code}`);
      assert.ok(labels.stop, `Missing stop label for ${lang.code}`);
      assert.ok(labels.preparing, `Missing preparing label for ${lang.code}`);
      assert.ok(labels.speaking, `Missing speaking label for ${lang.code}`);
    });
  });

  it('stopSpeech should execute without throwing even without browser DOM', () => {
    assert.doesNotThrow(() => {
      stopSpeech();
    });
  });

  it('speakAssessmentText should handle empty text gracefully and trigger onEnd', async () => {
    let ended = false;
    const result = await speakAssessmentText('', {
      onEnd: () => {
        ended = true;
      }
    });

    assert.equal(result, false);
    assert.equal(ended, true);
  });

});
