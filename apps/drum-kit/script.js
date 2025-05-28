const drums = document.querySelectorAll('.drum');
const recordBtn = document.getElementById('recordBtn');
const playBtn = document.getElementById('playBtn');
const clearBtn = document.getElementById('clearBtn');
const recordingDisplay = document.getElementById('recordingDisplay');
const volumeSlider = document.getElementById('volume');
const volumeValue = document.getElementById('volumeValue');

let isRecording = false;
let recordedBeats = [];
let recordStartTime = null;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

// ドラムサウンドの周波数とパラメータ
const drumSounds = {
    kick: { frequency: 60, duration: 0.5, type: 'sine', gain: 0.9 },
    snare: { frequency: 200, duration: 0.2, type: 'noise', gain: 0.8 },
    hihat: { frequency: 800, duration: 0.1, type: 'noise', gain: 0.5 },
    openhat: { frequency: 800, duration: 0.3, type: 'noise', gain: 0.6 },
    crash: { frequency: 400, duration: 1, type: 'noise', gain: 0.7 },
    ride: { frequency: 600, duration: 0.4, type: 'triangle', gain: 0.4 },
    tom1: { frequency: 150, duration: 0.3, type: 'sine', gain: 0.8 },
    tom2: { frequency: 100, duration: 0.3, type: 'sine', gain: 0.8 },
    floor: { frequency: 80, duration: 0.4, type: 'sine', gain: 0.9 }
};

// ノイズ生成（スネアやハイハット用）
function createNoiseBuffer() {
    const bufferSize = audioContext.sampleRate * 0.5;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
}

// ドラムサウンドを再生
function playDrumSound(soundType) {
    const sound = drumSounds[soundType];
    const volume = volumeSlider.value / 100;
    
    if (sound.type === 'noise') {
        // ノイズベースのサウンド（スネア、ハイハット等）
        const noise = audioContext.createBufferSource();
        noise.buffer = createNoiseBuffer();
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = sound.frequency;
        
        const envelope = audioContext.createGain();
        envelope.gain.setValueAtTime(sound.gain * volume, audioContext.currentTime);
        envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        noise.connect(filter);
        filter.connect(envelope);
        envelope.connect(audioContext.destination);
        
        noise.start();
        noise.stop(audioContext.currentTime + sound.duration);
    } else {
        // オシレーターベースのサウンド（キック、トム等）
        const oscillator = audioContext.createOscillator();
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
        
        const envelope = audioContext.createGain();
        envelope.gain.setValueAtTime(sound.gain * volume, audioContext.currentTime);
        envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.connect(envelope);
        envelope.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + sound.duration);
    }
}

// ドラムを叩く
function playDrum(drum) {
    drum.classList.add('playing');
    const sound = drum.getAttribute('data-sound');
    playDrumSound(sound);
    
    // 録音中の場合、ビートを記録
    if (isRecording && recordStartTime) {
        const timestamp = Date.now() - recordStartTime;
        recordedBeats.push({ sound, timestamp });
        updateRecordingDisplay();
    }
    
    setTimeout(() => {
        drum.classList.remove('playing');
    }, 100);
}

// キーボードイベント
window.addEventListener('keydown', (e) => {
    const drum = document.querySelector(`.drum[data-key="${e.keyCode}"]`);
    if (drum) {
        playDrum(drum);
    }
});

// クリックイベント
drums.forEach(drum => {
    drum.addEventListener('click', () => {
        playDrum(drum);
    });
});

// 録音開始/停止
recordBtn.addEventListener('click', () => {
    if (!isRecording) {
        isRecording = true;
        recordedBeats = [];
        recordStartTime = Date.now();
        recordBtn.textContent = '■ 録音停止';
        recordBtn.classList.add('recording');
        playBtn.disabled = true;
        clearBtn.disabled = true;
        recordingDisplay.innerHTML = '<p>録音中...</p>';
    } else {
        isRecording = false;
        recordBtn.textContent = '● 録音開始';
        recordBtn.classList.remove('recording');
        playBtn.disabled = recordedBeats.length === 0;
        clearBtn.disabled = recordedBeats.length === 0;
        updateRecordingDisplay();
    }
});

// 録音再生
playBtn.addEventListener('click', () => {
    if (recordedBeats.length === 0) return;
    
    playBtn.disabled = true;
    recordBtn.disabled = true;
    
    recordedBeats.forEach(beat => {
        setTimeout(() => {
            const drum = document.querySelector(`.drum[data-sound="${beat.sound}"]`);
            if (drum) {
                playDrum(drum);
            }
        }, beat.timestamp);
    });
    
    const totalDuration = recordedBeats[recordedBeats.length - 1].timestamp;
    setTimeout(() => {
        playBtn.disabled = false;
        recordBtn.disabled = false;
    }, totalDuration + 500);
});

// 録音クリア
clearBtn.addEventListener('click', () => {
    recordedBeats = [];
    playBtn.disabled = true;
    clearBtn.disabled = true;
    recordingDisplay.innerHTML = '';
});

// 録音表示を更新
function updateRecordingDisplay() {
    if (recordedBeats.length === 0) {
        recordingDisplay.innerHTML = '';
        return;
    }
    
    const duration = (recordedBeats[recordedBeats.length - 1].timestamp / 1000).toFixed(1);
    recordingDisplay.innerHTML = `
        <p>録音完了: ${recordedBeats.length} ビート / ${duration} 秒</p>
    `;
}

// ボリュームコントロール
volumeSlider.addEventListener('input', (e) => {
    volumeValue.textContent = e.target.value + '%';
});

// タッチデバイス対応
drums.forEach(drum => {
    drum.addEventListener('touchstart', (e) => {
        e.preventDefault();
        playDrum(drum);
    });
});