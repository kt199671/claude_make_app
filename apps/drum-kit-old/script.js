class DrumKit {
    constructor() {
        this.drums = document.querySelectorAll('.drum');
        this.recordBtn = document.getElementById('record-btn');
        this.playBtn = document.getElementById('play-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.canvas = document.getElementById('visualizer-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.isRecording = false;
        this.recordedBeats = [];
        this.recordStartTime = null;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        this.sounds = {
            kick: { frequency: 60, type: 'sine', duration: 0.5, gain: 0.7 },
            snare: { frequency: 200, type: 'noise', duration: 0.2, gain: 0.5 },
            hihat: { frequency: 800, type: 'noise', duration: 0.1, gain: 0.3 },
            tom1: { frequency: 150, type: 'sine', duration: 0.3, gain: 0.6 },
            tom2: { frequency: 100, type: 'sine', duration: 0.3, gain: 0.6 },
            crash: { frequency: 500, type: 'noise', duration: 1, gain: 0.4 },
            ride: { frequency: 300, type: 'sawtooth', duration: 0.8, gain: 0.3 },
            openhat: { frequency: 1000, type: 'noise', duration: 0.3, gain: 0.3 }
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.addEventListeners();
    }
    
    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 200;
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    addEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        this.drums.forEach(drum => {
            drum.addEventListener('click', () => this.playDrum(drum));
            drum.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playDrum(drum);
            });
        });
        
        this.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.playBtn.addEventListener('click', () => this.playRecording());
        this.clearBtn.addEventListener('click', () => this.clearRecording());
    }
    
    handleKeyPress(e) {
        const drum = document.querySelector(`.drum[data-key="${e.keyCode}"]`);
        if (drum) {
            this.playDrum(drum);
        }
    }
    
    playDrum(drum) {
        const sound = drum.dataset.sound;
        
        drum.classList.add('playing');
        setTimeout(() => drum.classList.remove('playing'), 100);
        
        this.playSound(sound);
        this.visualize(sound);
        
        if (this.isRecording) {
            const timestamp = Date.now() - this.recordStartTime;
            this.recordedBeats.push({ sound, timestamp });
        }
    }
    
    playSound(soundName) {
        const sound = this.sounds[soundName];
        const currentTime = this.audioContext.currentTime;
        
        if (sound.type === 'noise') {
            this.playNoise(sound, currentTime);
        } else {
            this.playTone(sound, currentTime);
        }
    }
    
    playTone(sound, startTime) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.frequency, startTime);
        
        gainNode.gain.setValueAtTime(sound.gain, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + sound.duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + sound.duration);
    }
    
    playNoise(sound, startTime) {
        const bufferSize = this.audioContext.sampleRate * sound.duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        whiteNoise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.value = sound.frequency;
        
        gainNode.gain.setValueAtTime(sound.gain, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + sound.duration);
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        whiteNoise.start(startTime);
        whiteNoise.stop(startTime + sound.duration);
    }
    
    visualize(sound) {
        const soundConfig = this.sounds[sound];
        const color = this.getColorForSound(sound);
        
        this.ctx.fillStyle = 'rgba(26, 26, 26, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barWidth = this.canvas.width / 8;
        const barHeight = (soundConfig.gain * 150) + Math.random() * 50;
        const x = Object.keys(this.sounds).indexOf(sound) * barWidth;
        const y = this.canvas.height - barHeight;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, barWidth - 10, barHeight);
        
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = color;
        this.ctx.fillRect(x, y, barWidth - 10, barHeight);
        this.ctx.shadowBlur = 0;
    }
    
    getColorForSound(sound) {
        const colors = {
            kick: '#ff6b6b',
            snare: '#4ecdc4',
            hihat: '#45b7d1',
            tom1: '#f7b731',
            tom2: '#fd9644',
            crash: '#a55eea',
            ride: '#26de81',
            openhat: '#2bcbba'
        };
        return colors[sound] || '#ffffff';
    }
    
    toggleRecording() {
        if (this.isRecording) {
            this.isRecording = false;
            this.recordBtn.textContent = '録音開始';
            this.recordBtn.classList.remove('recording');
            this.playBtn.disabled = false;
            this.clearBtn.disabled = false;
        } else {
            this.isRecording = true;
            this.recordedBeats = [];
            this.recordStartTime = Date.now();
            this.recordBtn.textContent = '録音停止';
            this.recordBtn.classList.add('recording');
            this.playBtn.disabled = true;
            this.clearBtn.disabled = true;
        }
    }
    
    playRecording() {
        if (this.recordedBeats.length === 0) return;
        
        this.playBtn.disabled = true;
        
        this.recordedBeats.forEach(beat => {
            setTimeout(() => {
                const drum = document.querySelector(`.drum[data-sound="${beat.sound}"]`);
                if (drum) {
                    this.playDrum(drum);
                }
            }, beat.timestamp);
        });
        
        const lastBeatTime = this.recordedBeats[this.recordedBeats.length - 1].timestamp;
        setTimeout(() => {
            this.playBtn.disabled = false;
        }, lastBeatTime + 500);
    }
    
    clearRecording() {
        this.recordedBeats = [];
        this.playBtn.disabled = true;
        this.clearBtn.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DrumKit();
});