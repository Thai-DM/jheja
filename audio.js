/**
 * Audio Engine using Web Audio API
 * Generates an ethereal, romantic ambient lullaby melody & high quality sound FX
 * Zero external audio dependencies, 100% reliable, zero CORS issues, instant loading.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.musicTimer = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentStep = 0;

    // Ethereal chord progression in Eb Major (Romantic, warm, dreamy)
    // Notes in Hz:
    this.melodyChords = [
      // Ebmaj9: Eb3, G3, Bb3, D4, F4
      [155.56, 196.00, 233.08, 293.66, 349.23, 466.16],
      // Cm9: C3, G3, Bb3, Eb4, D4
      [130.81, 196.00, 233.08, 311.13, 293.66, 392.00],
      // Abmaj7: Ab2, C3, Eb3, G3, C4
      [103.83, 130.81, 155.56, 196.00, 261.63, 311.13],
      // Bb7sus4 -> Bb: Bb2, F3, Bb3, Eb4, D4
      [116.54, 174.61, 233.08, 311.13, 293.66, 440.00]
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  toggleMusic() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  startMusic() {
    if (this.isPlaying) return;
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;
    this.currentStep = 0;
    this.scheduleNextArpeggio();
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  scheduleNextArpeggio() {
    if (!this.isPlaying || !this.ctx) return;

    const chordIndex = Math.floor(this.currentStep / 8) % this.melodyChords.length;
    const chord = this.melodyChords[chordIndex];

    // Pick note for this beat
    const noteIndex = this.currentStep % chord.length;
    const freq = chord[noteIndex];

    // Play dreamy music box tone
    this.playTone(freq, 0.9, 0.18, 'sine');

    // Occasionally add a high sparkle note (celesta chime)
    if (this.currentStep % 4 === 0) {
      const highFreq = freq * 2;
      setTimeout(() => {
        if (this.isPlaying) {
          this.playTone(highFreq, 1.2, 0.08, 'triangle');
        }
      }, 150);
    }

    this.currentStep++;
    // Tempo: ~340ms per arpeggio note (relaxed, soothing flow)
    this.musicTimer = setTimeout(() => this.scheduleNextArpeggio(), 340);
  }

  playTone(freq, duration = 1.0, volume = 0.2, type = 'sine') {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // ==========================================
  // SOUND EFFECTS (SFX)
  // ==========================================

  playStarChime() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const notes = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playSfxTone(freq, 1.4, 0.35, 'triangle');
      }, i * 90);
    });
  }

  playFlowerChime(index = 0) {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const baseFrequencies = [523.25, 587.33, 659.25, 783.99, 880.00]; // C5, D5, E5, G5, A5
    const freq = baseFrequencies[index % baseFrequencies.length];
    
    this.playSfxTone(freq, 0.8, 0.3, 'sine');
    setTimeout(() => {
      this.playSfxTone(freq * 1.5, 0.6, 0.15, 'triangle');
    }, 70);
  }

  playBoxOpen() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Swoosh sweep + magical shimmer
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.7);

    // Shimmer sparkle arpeggio
    const sparkles = [880, 1046.50, 1318.51, 1567.98, 2093];
    sparkles.forEach((freq, idx) => {
      setTimeout(() => {
        this.playSfxTone(freq, 0.9, 0.25, 'triangle');
      }, 250 + idx * 80);
    });
  }

  playPaperUnfold() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Gentle warm acoustic harmonic
    this.playSfxTone(392.00, 1.0, 0.25, 'sine');
    setTimeout(() => this.playSfxTone(523.25, 1.2, 0.22, 'sine'), 100);
    setTimeout(() => this.playSfxTone(659.25, 1.4, 0.2, 'sine'), 220);
  }

  playMagicBurst() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Cosmic harp crescendo
    const cascade = [392, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    cascade.forEach((freq, i) => {
      setTimeout(() => {
        this.playSfxTone(freq, 1.5, 0.35, 'triangle');
      }, i * 65);
    });
  }

  playSfxTone(freq, duration = 0.8, volume = 0.25, type = 'sine') {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + duration);
  }
}

// Global Sound Engine Singleton
window.soundEngine = new SoundEngine();
