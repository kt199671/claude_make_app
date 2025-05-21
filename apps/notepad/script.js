// DOM要素
const notesList = document.getElementById('notes-list');
const noteEditor = document.getElementById('note-editor');
const noteContent = document.getElementById('note-content');
const emptyState = document.getElementById('empty-state');
const noteTitle = document.getElementById('note-title');
const noteBody = document.getElementById('note-body');
const newNoteBtn = document.getElementById('new-note-btn');
const searchInput = document.getElementById('search-input');
const saveStatus = document.getElementById('save-status');
const deleteBtn = document.getElementById('delete-btn');
const boldBtn = document.getElementById('bold-btn');
const italicBtn = document.getElementById('italic-btn');
const underlineBtn = document.getElementById('underline-btn');
const deleteConfirm = document.getElementById('delete-confirm');
const overlay = document.getElementById('overlay');
const cancelDelete = document.getElementById('cancel-delete');
const confirmDelete = document.getElementById('confirm-delete');

// ノートのデータ構造
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentNoteId = null;
let saveTimeout = null;

// 初期化関数
function init() {
    renderNotesList();
    updateUI();
    
    // 最後に選択したノートを読み込む
    const lastNoteId = localStorage.getItem('lastNoteId');
    if (lastNoteId && notes.some(note => note.id === lastNoteId)) {
        loadNote(lastNoteId);
    } else if (notes.length > 0) {
        loadNote(notes[0].id); // 最初のノートを読み込む
    }
}

// ノート一覧を表示
function renderNotesList(searchTerm = '') {
    let filteredNotes = notes;
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(term) || 
            note.body.toLowerCase().includes(term)
        );
    }
    
    notesList.innerHTML = '';
    
    filteredNotes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note-item');
        if (note.id === currentNoteId) {
            noteItem.classList.add('active');
        }
        
        const date = new Date(note.updatedAt);
        const formattedDate = formatDate(date);
        
        // プレビューテキストを整形（HTMLタグを除去）
        const preview = note.body.replace(/<[^>]*>/g, '').substring(0, 50);
        
        noteItem.innerHTML = `
            <div class="note-title">${note.title || '無題のメモ'}</div>
            <div class="note-preview">${preview}</div>
            <div class="note-meta">
                <span>${formattedDate}</span>
                <span>${countWords(note.body)}単語</span>
            </div>
        `;
        
        noteItem.addEventListener('click', () => {
            loadNote(note.id);
        });
        
        notesList.appendChild(noteItem);
    });
}

// 日付を整形
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    
    // 今日の場合は時間だけ表示
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }
    
    // 今年の場合は年を省略
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    }
    
    // それ以外は完全な日付
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
}

// 単語数をカウント
function countWords(text) {
    // HTMLタグを削除
    const plainText = text.replace(/<[^>]*>/g, '');
    
    // 空白で区切られた単語をカウント
    return plainText.split(/\s+/).filter(word => word.length > 0).length;
}

// ノートを読み込む
function loadNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    currentNoteId = id;
    localStorage.setItem('lastNoteId', id);
    
    noteTitle.value = note.title;
    noteBody.value = note.body;
    
    updateUI();
    renderNotesList(searchInput.value);
}

// UIを更新
function updateUI() {
    if (notes.length === 0) {
        noteContent.style.display = 'none';
        emptyState.style.display = 'flex';
    } else {
        noteContent.style.display = 'flex';
        emptyState.style.display = 'none';
    }
}

// 新規ノートを作成
function createNewNote() {
    const newNote = {
        id: Date.now().toString(),
        title: '新しいメモ',
        body: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.unshift(newNote);
    saveNotesToLocalStorage();
    loadNote(newNote.id);
}

// 現在のノートを保存
function saveCurrentNote() {
    if (!currentNoteId) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    note.title = noteTitle.value;
    note.body = noteBody.value;
    note.updatedAt = new Date().toISOString();
    
    saveNotesToLocalStorage();
    renderNotesList(searchInput.value);
    showSavedStatus();
}

// 自動保存のスケジュール
function scheduleAutoSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    
    saveStatus.textContent = '編集中...';
    
    saveTimeout = setTimeout(() => {
        saveCurrentNote();
    }, 1000);
}

// 保存完了表示
function showSavedStatus() {
    saveStatus.textContent = '保存しました';
    
    setTimeout(() => {
        saveStatus.textContent = '';
    }, 2000);
}

// 現在のノートを削除
function deleteCurrentNote() {
    if (!currentNoteId) return;
    
    notes = notes.filter(note => note.id !== currentNoteId);
    saveNotesToLocalStorage();
    
    if (notes.length > 0) {
        loadNote(notes[0].id);
    } else {
        currentNoteId = null;
        noteTitle.value = '';
        noteBody.value = '';
        updateUI();
    }
    
    closeDeleteConfirm();
}

// 削除確認ダイアログを表示
function showDeleteConfirm() {
    overlay.style.display = 'block';
    deleteConfirm.style.display = 'block';
}

// 削除確認ダイアログを閉じる
function closeDeleteConfirm() {
    overlay.style.display = 'none';
    deleteConfirm.style.display = 'none';
}

// テキスト編集機能
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    noteBody.focus();
}

// ローカルストレージに保存
function saveNotesToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// イベントリスナー
newNoteBtn.addEventListener('click', createNewNote);

noteTitle.addEventListener('input', scheduleAutoSave);
noteBody.addEventListener('input', scheduleAutoSave);

searchInput.addEventListener('input', (e) => {
    renderNotesList(e.target.value);
});

boldBtn.addEventListener('click', () => formatText('bold'));
italicBtn.addEventListener('click', () => formatText('italic'));
underlineBtn.addEventListener('click', () => formatText('underline'));
deleteBtn.addEventListener('click', showDeleteConfirm);

cancelDelete.addEventListener('click', closeDeleteConfirm);
confirmDelete.addEventListener('click', deleteCurrentNote);

// ページがフォーカスを失う前に保存を実行
window.addEventListener('beforeunload', () => {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveCurrentNote();
    }
});

// 初期化
init();