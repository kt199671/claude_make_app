class MusicProducerStudio {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.isRecording = false;
        this.bpm = 120;
        this.currentStep = 0;
        this.stepInterval = null;
        this.sequences = {
            kick: new Array(16).fill(false),
            snare: new Array(16).fill(false),
            hihat: new Array(16).fill(false),
            openhat: new Array(16).fill(false)
        };
        this.volumes = {
            drums: 0.8,
            bass: 0.7,
            lead: 0.6,
            master: 0.85
        };
        this.loopBuffer = null;
        this.recordedNotes = [];
        this.compositions = JSON.parse(localStorage.getItem('musicCompositions') || '[]');
        
        this.init();
    }

    async init() {
        this.initAudioContext();
        this.createSequencerGrid();
        this.createKeyboard();
        this.attachEventListeners();
        this.loadCompositions();
        this.updateVolumeDisplays();
    }

    initAudioContext() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    createSequencerGrid() {
        const grid = document.getElementById('sequencerGrid');
        const tracks = ['kick', 'snare', 'hihat', 'openhat'];
        const trackLabels = ['🦵 Kick', '👏 Snare', '🎩 Hi-Hat', '🔓 Open Hat'];
        
        tracks.forEach((track, trackIndex) => {
            const trackRow = document.createElement('div');
            trackRow.className = 'track-row';
            
            const label = document.createElement('div');
            label.className = 'track-label';
            label.textContent = trackLabels[trackIndex];
            trackRow.appendChild(label);
            
            for (let step = 0; step < 16; step++) {
                const stepButton = document.createElement('button');
                stepButton.className = 'step-button';
                stepButton.dataset.track = track;
                stepButton.dataset.step = step;
                stepButton.addEventListener('click', () => this.toggleStep(track, step));
                trackRow.appendChild(stepButton);
            }
            
            grid.appendChild(trackRow);
        });
    }

    createKeyboard() {
        const keyboard = document.getElementById('keyboard');
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octaves = [3, 4, 5];
        
        octaves.forEach(octave => {
            notes.forEach(note => {
                const key = document.createElement('button');
                key.className = `key ${note.includes('#') ? 'black-key' : 'white-key'}`;
                key.dataset.note = `${note}${octave}`;
                key.textContent = note.includes('#') ? '' : note;
                key.addEventListener('mousedown', () => this.playNote(note, octave));
                key.addEventListener('mouseup', () => this.stopNote());
                keyboard.appendChild(key);
            });
        });
    }

    attachEventListeners() {
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlayback());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveComposition());
        
        document.getElementById('bpmSlider').addEventListener('input', (e) => {
            this.bpm = parseInt(e.target.value);
            document.getElementById('bpmValue').textContent = this.bpm;
            if (this.isPlaying) {
                this.updateTempo();
            }
        });

        document.getElementById('recordBtn').addEventListener('click', () => this.toggleRecording());
        document.getElementById('playLoopBtn').addEventListener('click', () => this.playLoop());
        document.getElementById('clearLoopBtn').addEventListener('click', () => this.clearLoop());

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.loadPreset(btn.dataset.preset));
        });

        document.querySelectorAll('.volume-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const track = e.target.dataset.track;
                const value = parseInt(e.target.value) / 100;
                this.volumes[track] = value;
                e.target.nextElementSibling.textContent = `${e.target.value}%`;
            });
        });
    }

    toggleStep(track, step) {
        this.sequences[track][step] = !this.sequences[track][step];
        const button = document.querySelector(`[data-track="${track}"][data-step="${step}"]`);
        button.classList.toggle('active', this.sequences[track][step]);
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isPlaying = true;
        document.getElementById('playBtn').textContent = '⏸️ Pause';
        
        const stepTime = 60000 / (this.bpm * 4); // 16th notes
        this.stepInterval = setInterval(() => {
            this.playStep();
            this.updateStepVisual();
            this.currentStep = (this.currentStep + 1) % 16;
        }, stepTime);
    }

    pause() {
        this.isPlaying = false;
        document.getElementById('playBtn').textContent = '▶️ Play';
        clearInterval(this.stepInterval);
        this.clearStepVisual();
    }

    stop() {
        this.pause();
        this.currentStep = 0;
    }

    playStep() {
        Object.entries(this.sequences).forEach(([track, sequence]) => {
            if (sequence[this.currentStep]) {
                this.playDrumSound(track);
            }
        });
    }

    playDrumSound(drumType) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        const volume = this.volumes.drums * this.volumes.master;
        
        switch (drumType) {
            case 'kick':
                oscillator.frequency.setValueAtTime(60, now);
                oscillator.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
                filterNode.frequency.setValueAtTime(100, now);
                gainNode.gain.setValueAtTime(volume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                break;
            case 'snare':
                oscillator.frequency.setValueAtTime(200, now);
                filterNode.frequency.setValueAtTime(1000, now);
                gainNode.gain.setValueAtTime(volume * 0.7, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                break;
            case 'hihat':
                oscillator.frequency.setValueAtTime(10000, now);
                filterNode.frequency.setValueAtTime(15000, now);
                gainNode.gain.setValueAtTime(volume * 0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                break;
            case 'openhat':
                oscillator.frequency.setValueAtTime(8000, now);
                filterNode.frequency.setValueAtTime(12000, now);
                gainNode.gain.setValueAtTime(volume * 0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                break;
        }
        
        oscillator.start(now);
        oscillator.stop(now + 0.5);
    }

    playNote(note, octave) {
        const frequencies = {
            'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
            'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
            'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
        };
        
        const frequency = frequencies[note] * Math.pow(2, octave - 4);
        const soundType = document.getElementById('soundSelect').value;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        switch (soundType) {
            case 'piano':
                oscillator.type = 'triangle';
                break;
            case 'synth':
                oscillator.type = 'sawtooth';
                break;
            case 'bass':
                oscillator.type = 'sine';
                break;
            case 'lead':
                oscillator.type = 'square';
                break;
        }
        
        const volume = this.volumes.lead * this.volumes.master;
        gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
        
        oscillator.start();
        
        // Store for potential stopping
        this.currentNote = { oscillator, gainNode };
        
        if (this.isRecording) {
            this.recordedNotes.push({
                note,
                octave,
                time: Date.now(),
                soundType
            });
        }
    }

    stopNote() {
        if (this.currentNote) {
            this.currentNote.gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            this.currentNote.oscillator.stop(this.audioContext.currentTime + 0.1);
            this.currentNote = null;
        }
    }

    updateStepVisual() {
        document.querySelectorAll('.step-button').forEach(btn => {
            btn.classList.remove('current');
        });
        
        document.querySelectorAll(`[data-step="${this.currentStep}"]`).forEach(btn => {
            btn.classList.add('current');
        });
    }

    clearStepVisual() {
        document.querySelectorAll('.step-button').forEach(btn => {
            btn.classList.remove('current');
        });
    }

    updateTempo() {
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.play();
        }
    }

    toggleRecording() {
        this.isRecording = !this.isRecording;
        const btn = document.getElementById('recordBtn');
        
        if (this.isRecording) {
            btn.textContent = '⏹️ Stop Recording';
            btn.style.backgroundColor = '#ff4444';
            this.recordedNotes = [];
        } else {
            btn.textContent = '🔴 Record';
            btn.style.backgroundColor = '';
        }
    }

    playLoop() {
        if (this.recordedNotes.length === 0) return;
        
        const startTime = this.recordedNotes[0].time;
        this.recordedNotes.forEach(noteData => {
            const delay = noteData.time - startTime;
            setTimeout(() => {
                this.playNote(noteData.note, noteData.octave);
            }, delay);
        });
    }

    clearLoop() {
        this.recordedNotes = [];
        const canvas = document.getElementById('loopCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    loadPreset(presetName) {
        const presets = {
            rock: {
                kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
                snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
                hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
                openhat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true]
            },
            pop: {
                kick: [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false],
                snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
                hihat: [true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true],
                openhat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
            },
            techno: {
                kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
                snare: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
                hihat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
                openhat: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true]
            },
            jazz: {
                kick: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
                snare: [false, false, true, false, false, true, false, false, true, false, false, true, false, false, true, false],
                hihat: [true, false, false, true, true, false, false, true, true, false, false, true, true, false, false, true],
                openhat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true]
            },
            latin: {
                kick: [true, false, false, true, false, true, false, false, true, false, false, true, false, true, false, false],
                snare: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
                hihat: [true, true, false, true, true, false, true, true, true, true, false, true, true, false, true, true],
                openhat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
            }
        };
        
        if (presets[presetName]) {
            this.sequences = { ...presets[presetName] };
            this.updateSequencerDisplay();
        }
    }

    updateSequencerDisplay() {
        Object.entries(this.sequences).forEach(([track, sequence]) => {
            sequence.forEach((active, step) => {
                const button = document.querySelector(`[data-track="${track}"][data-step="${step}"]`);
                button.classList.toggle('active', active);
            });
        });
    }

    clearAll() {
        Object.keys(this.sequences).forEach(track => {
            this.sequences[track] = new Array(16).fill(false);
        });
        this.updateSequencerDisplay();
        this.clearLoop();
        this.stop();
    }

    saveComposition() {
        const name = prompt('作品名を入力してください:');
        if (!name) return;
        
        const composition = {
            id: Date.now(),
            name,
            sequences: { ...this.sequences },
            bpm: this.bpm,
            recordedNotes: [...this.recordedNotes],
            date: new Date().toLocaleDateString('ja-JP')
        };
        
        this.compositions.unshift(composition);
        localStorage.setItem('musicCompositions', JSON.stringify(this.compositions));
        this.loadCompositions();
    }

    loadCompositions() {
        const list = document.getElementById('compositionsList');
        list.innerHTML = '';
        
        if (this.compositions.length === 0) {
            list.innerHTML = '<p class="no-compositions">保存された作品はありません</p>';
            return;
        }
        
        this.compositions.forEach(comp => {
            const item = document.createElement('div');
            item.className = 'composition-item';
            item.innerHTML = `
                <div class="composition-info">
                    <h4>${comp.name}</h4>
                    <p>BPM: ${comp.bpm} | 作成日: ${comp.date}</p>
                </div>
                <div class="composition-actions">
                    <button onclick="studio.loadComposition(${comp.id})" class="load-btn">読み込み</button>
                    <button onclick="studio.deleteComposition(${comp.id})" class="delete-btn">削除</button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    loadComposition(id) {
        const composition = this.compositions.find(comp => comp.id === id);
        if (!composition) return;
        
        this.sequences = { ...composition.sequences };
        this.bpm = composition.bpm;
        this.recordedNotes = [...composition.recordedNotes];
        
        document.getElementById('bpmSlider').value = this.bpm;
        document.getElementById('bpmValue').textContent = this.bpm;
        
        this.updateSequencerDisplay();
    }

    deleteComposition(id) {
        if (confirm('この作品を削除しますか？')) {
            this.compositions = this.compositions.filter(comp => comp.id !== id);
            localStorage.setItem('musicCompositions', JSON.stringify(this.compositions));
            this.loadCompositions();
        }
    }

    updateVolumeDisplays() {
        document.querySelectorAll('.volume-slider').forEach(slider => {
            const track = slider.dataset.track;
            const value = Math.round(this.volumes[track] * 100);
            slider.value = value;
            slider.nextElementSibling.textContent = `${value}%`;
        });
    }
}

// Initialize the music studio
let studio;
document.addEventListener('DOMContentLoaded', () => {
    studio = new MusicProducerStudio();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        studio.togglePlayback();
    }
});