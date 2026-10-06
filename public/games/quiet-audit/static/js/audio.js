/**
 * Cozy Audio Synthesizer for Quiet Audit using Web Audio API.
 * Synthesizes soft retro blips, chimes, and clicks without external audio files.
 */
class CozyAudioManager {
    constructor() {
        this.ctx = null;
        this.isMuted = localStorage.getItem('quiet_audit_muted') === 'true';
        this.initOnFirstInteraction = this.initOnFirstInteraction.bind(this);
        window.addEventListener('click', this.initOnFirstInteraction, { once: true });
        window.addEventListener('keydown', this.initOnFirstInteraction, { once: true });
    }

    initContext() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    initOnFirstInteraction() {
        this.initContext();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('quiet_audit_muted', this.isMuted);
        return this.isMuted;
    }

    // Cozy dialogue typewriter chirp (Animal Crossing-style soft blip)
    playBlip(freq = 480) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Gentle pitch randomized jitter for speech effect
        const randomPitch = freq + (Math.random() * 50 - 25);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(randomPitch, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(randomPitch * 1.15, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }

    // Soft button click / tap
    playClick() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
    }

    // Positive / Successful choice chime (gentle harp arpeggio)
    playSuccess() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const start = this.ctx.currentTime + (idx * 0.07);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.06, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.28);
        });
    }

    // Warning / Sev-1 Incident Alert (Warm, retro caution)
    playAlert() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const tones = [370, 311]; // F#4, D#4
        tones.forEach((freq, idx) => {
            const start = this.ctx.currentTime + (idx * 0.12);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, start);

            // Low-pass filter to keep it warm, not harsh
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(700, start);

            gain.gain.setValueAtTime(0.05, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.18);
        });
    }

    // Scenario completion fanfare
    playFanfare() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const chord = [
            { f: 523.25, t: 0 },
            { f: 659.25, t: 0.1 },
            { f: 783.99, t: 0.2 },
            { f: 1046.50, t: 0.3 },
            { f: 1318.51, t: 0.45 }
        ];

        chord.forEach(n => {
            const start = this.ctx.currentTime + n.t;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, start);

            gain.gain.setValueAtTime(0.07, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.45);
        });
    }

    // Feline cozy purr sound synthesis
    playPurr() {

        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        // Dual modulated low frequency rumble
        const carrier = this.ctx.createOscillator();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const masterGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        carrier.type = 'sawtooth';
        carrier.frequency.setValueAtTime(45, this.ctx.currentTime); // 45 Hz deep cat purr

        mod.type = 'sine';
        mod.frequency.setValueAtTime(24, this.ctx.currentTime); // 24 Hz throat flutter

        modGain.gain.setValueAtTime(15, this.ctx.currentTime);
        mod.connect(modGain);
        modGain.connect(carrier.frequency);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, this.ctx.currentTime);

        masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.2);
        masterGain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);

        carrier.connect(filter);
        filter.connect(masterGain);
        masterGain.connect(this.ctx.destination);

        carrier.start();
        mod.start();
        carrier.stop(this.ctx.currentTime + 0.8);
        mod.stop(this.ctx.currentTime + 0.8);
    }

    // Cozy water droplet / bubble sound
    playWaterDrop() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    // Cozy warm sunset chime (soft major chord)
    playWarmChime() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [329.63, 415.30, 493.88]; // E4, G#4, B4 warm chord
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(0.001, now + idx * 0.07);
            gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.07 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.45);
        });
    }

    // Gentle morning breeze chime (crisp high chord)
    playMorningBreeze() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [440.00, 554.37, 659.25]; // A4, C#5, E5 crisp morning chord
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            gain.gain.setValueAtTime(0.001, now + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0.035, now + idx * 0.06 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.4);
        });
    }
}

window.audioManager = new CozyAudioManager();

