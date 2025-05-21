// Photo Organizer App - Core Functionality

// DOM Elements
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');
const imagePreview = document.getElementById('imagePreview');
const resultsContainer = document.querySelector('.results-container');

// Tab Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const categoryGrid = document.getElementById('categoryGrid');
const peopleList = document.getElementById('peopleList');
const placesList = document.getElementById('placesList');
const placesMap = document.getElementById('placesMap');
const calendarView = document.getElementById('calendarView');
const timelineView = document.getElementById('timelineView');
const qualityGrid = document.getElementById('qualityGrid');

// Batch Action Buttons
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const exportBtn = document.getElementById('exportBtn');
const createAlbumBtn = document.getElementById('createAlbumBtn');

// Modal Elements
const photoModal = document.getElementById('photoModal');
const modalImage = document.getElementById('modalImage');
const photoTitle = document.getElementById('photoTitle');
const photoDate = document.getElementById('photoDate');
const photoCamera = document.getElementById('photoCamera');
const photoResolution = document.getElementById('photoResolution');
const photoSize = document.getElementById('photoSize');
const photoLocation = document.getElementById('photoLocation');
const tagsList = document.getElementById('tagsList');
const closeModalBtn = document.querySelector('.close-modal');

// Recommendation Elements
const recommendationCards = document.getElementById('recommendationCards');

// App State
const appState = {
    selectedFiles: [],
    uploadedImages: [],
    analyzedResults: {
        categories: [],
        people: [],
        places: [],
        dates: {},
        quality: {
            best: [],
            duplicates: [],
            blurry: [],
            dark: []
        }
    },
    selectedPhotos: new Set(),
    currentTab: 'categories'
};

// Event Listeners Setup
function setupEventListeners() {
    // File Drop Area
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('active');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('active');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('active');
        handleFiles(e.dataTransfer.files);
    });

    // File Input Change
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    // Select Files Button
    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Analyze Button
    analyzeBtn.addEventListener('click', startAnalysis);

    // Tabs Navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Batch Action Buttons
    downloadBtn.addEventListener('click', handleDownload);
    shareBtn.addEventListener('click', handleShare);
    exportBtn.addEventListener('click', handleExport);
    createAlbumBtn.addEventListener('click', handleCreateAlbum);

    // Close Modal
    closeModalBtn.addEventListener('click', () => {
        photoModal.style.display = 'none';
    });
    
    // Close modal when clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === photoModal) {
            photoModal.style.display = 'none';
        }
    });
}

// Handle Files
function handleFiles(files) {
    if (files.length === 0) return;
    
    // Clear previous files if any
    if (appState.selectedFiles.length > 0) {
        appState.selectedFiles = [];
        progressBar.style.width = '0%';
    }
    
    // Filter for image files only
    const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
    );
    
    appState.selectedFiles = imageFiles;
    
    // Update UI
    statusText.textContent = `${imageFiles.length} 枚選択中`;
    analyzeBtn.disabled = imageFiles.length === 0;
    
    // Show preview of first image
    if (imageFiles.length > 0) {
        const firstImage = imageFiles[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            if (imagePreview.tagName.toLowerCase() === 'img') {
                imagePreview.src = e.target.result;
            }
        };
        
        reader.readAsDataURL(firstImage);
    }
}

// Start Analysis
function startAnalysis() {
    if (appState.selectedFiles.length === 0) return;
    
    // Simulate progress
    let progress = 0;
    const totalFiles = appState.selectedFiles.length;
    const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;
        statusText.textContent = `分析中... ${Math.min(progress, 100)}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            completeAnalysis();
        }
    }, 200);
    
    // Disable analyze button during "processing"
    analyzeBtn.disabled = true;
}

// Complete Analysis
function completeAnalysis() {
    statusText.textContent = `${appState.selectedFiles.length} 枚の写真を分析しました`;
    
    // Process images and generate mock results
    generateMockResults();
    
    // Show results container
    resultsContainer.style.display = 'block';
    
    // Populate all tabs with results
    populateCategories();
    populatePeople();
    populatePlaces();
    populateDates();
    populateQuality();
    
    // Generate recommendations
    generateRecommendations();
    
    // Enable batch action buttons
    downloadBtn.disabled = false;
    shareBtn.disabled = false;
    exportBtn.disabled = false;
    createAlbumBtn.disabled = false;
    
    // Reset analyze button
    analyzeBtn.disabled = false;
}

// Generate Mock Results
function generateMockResults() {
    // This would normally be done by AI analysis
    // For demonstration, we'll create mock data
    
    // Categories
    appState.analyzedResults.categories = [
        { name: '風景', count: Math.floor(Math.random() * 10) + 5, thumbnail: 'https://source.unsplash.com/random/300x200/?landscape' },
        { name: '建物', count: Math.floor(Math.random() * 8) + 3, thumbnail: 'https://source.unsplash.com/random/300x200/?architecture' },
        { name: '食べ物', count: Math.floor(Math.random() * 6) + 2, thumbnail: 'https://source.unsplash.com/random/300x200/?food' },
        { name: '動物', count: Math.floor(Math.random() * 5) + 1, thumbnail: 'https://source.unsplash.com/random/300x200/?animal' },
        { name: '植物', count: Math.floor(Math.random() * 7) + 4, thumbnail: 'https://source.unsplash.com/random/300x200/?plant' },
        { name: 'イベント', count: Math.floor(Math.random() * 4) + 2, thumbnail: 'https://source.unsplash.com/random/300x200/?event' }
    ];
    
    // People
    appState.analyzedResults.people = [
        { name: '太郎', count: Math.floor(Math.random() * 8) + 3, photo: 'https://source.unsplash.com/random/300x300/?man' },
        { name: '花子', count: Math.floor(Math.random() * 7) + 4, photo: 'https://source.unsplash.com/random/300x300/?woman' },
        { name: '健太', count: Math.floor(Math.random() * 5) + 2, photo: 'https://source.unsplash.com/random/300x300/?boy' },
        { name: '由美', count: Math.floor(Math.random() * 6) + 3, photo: 'https://source.unsplash.com/random/300x300/?girl' }
    ];
    
    // Places
    appState.analyzedResults.places = [
        { name: '東京', count: Math.floor(Math.random() * 10) + 5, coords: { lat: 35.6895, lng: 139.6917 } },
        { name: '京都', count: Math.floor(Math.random() * 8) + 3, coords: { lat: 35.0116, lng: 135.7681 } },
        { name: '大阪', count: Math.floor(Math.random() * 6) + 2, coords: { lat: 34.6937, lng: 135.5023 } },
        { name: '北海道', count: Math.floor(Math.random() * 5) + 1, coords: { lat: 43.0618, lng: 141.3545 } }
    ];
    
    // Dates - create random distribution for past year
    const today = new Date();
    appState.analyzedResults.dates = {};
    
    // Create entries for each month of the past year
    for (let i = 0; i < 12; i++) {
        const month = new Date(today);
        month.setMonth(today.getMonth() - i);
        const key = `${month.getFullYear()}-${month.getMonth() + 1}`;
        appState.analyzedResults.dates[key] = Math.floor(Math.random() * 20) + 1;
    }
    
    // Quality categorization
    const totalFiles = appState.selectedFiles.length;
    
    // Simulate best photos (20-30% of total)
    const bestCount = Math.floor(totalFiles * (0.2 + Math.random() * 0.1));
    for (let i = 0; i < bestCount; i++) {
        appState.analyzedResults.quality.best.push({
            id: `best-${i}`,
            thumbnail: `https://source.unsplash.com/random/300x300/?quality&sig=${i}`
        });
    }
    
    // Simulate duplicates (10-15% of total)
    const duplicateCount = Math.floor(totalFiles * (0.1 + Math.random() * 0.05));
    for (let i = 0; i < duplicateCount; i++) {
        appState.analyzedResults.quality.duplicates.push({
            id: `duplicate-${i}`,
            thumbnail: `https://source.unsplash.com/random/300x300/?similar&sig=${i}`
        });
    }
    
    // Simulate blurry photos (5-10% of total)
    const blurryCount = Math.floor(totalFiles * (0.05 + Math.random() * 0.05));
    for (let i = 0; i < blurryCount; i++) {
        appState.analyzedResults.quality.blurry.push({
            id: `blurry-${i}`,
            thumbnail: `https://source.unsplash.com/random/300x300/?blur&sig=${i}`
        });
    }
    
    // Simulate dark photos (5-10% of total)
    const darkCount = Math.floor(totalFiles * (0.05 + Math.random() * 0.05));
    for (let i = 0; i < darkCount; i++) {
        appState.analyzedResults.quality.dark.push({
            id: `dark-${i}`,
            thumbnail: `https://source.unsplash.com/random/300x300/?dark&sig=${i}`
        });
    }
}

// Switch Tab
function switchTab(tabName) {
    // Update active tab button
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Show selected tab content, hide others
    tabContents.forEach(content => {
        if (content.id === `${tabName}Tab`) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
    
    // Update current tab in state
    appState.currentTab = tabName;
}

// Populate Categories Tab
function populateCategories() {
    categoryGrid.innerHTML = '';
    
    appState.analyzedResults.categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <img src="${category.thumbnail}" alt="${category.name}" class="category-thumbnail">
            <div class="category-info">
                <div class="category-name">${category.name}</div>
                <div class="category-count">${category.count}枚</div>
            </div>
        `;
        
        categoryItem.addEventListener('click', () => {
            showCategoryPhotos(category.name);
        });
        
        categoryGrid.appendChild(categoryItem);
    });
}

// Populate People Tab
function populatePeople() {
    peopleList.innerHTML = '';
    
    appState.analyzedResults.people.forEach(person => {
        const personItem = document.createElement('div');
        personItem.className = 'person-item';
        personItem.innerHTML = `
            <img src="${person.photo}" alt="${person.name}" class="person-photo">
            <div class="person-name">${person.name}</div>
            <div class="category-count">${person.count}枚</div>
        `;
        
        personItem.addEventListener('click', () => {
            showPersonPhotos(person.name);
        });
        
        peopleList.appendChild(personItem);
    });
}

// Populate Places Tab
function populatePlaces() {
    placesList.innerHTML = '';
    
    // In a real app, we would initialize a map here with the places marked
    placesMap.innerHTML = '<div style="padding: 120px 0; text-align: center; color: #666;">地図データを読み込み中...</div>';
    
    appState.analyzedResults.places.forEach(place => {
        const placeItem = document.createElement('div');
        placeItem.className = 'place-item';
        placeItem.innerHTML = `
            <div class="place-icon">📍</div>
            <div class="place-info">
                <div class="place-name">${place.name}</div>
                <div class="place-count">${place.count}枚</div>
            </div>
        `;
        
        placeItem.addEventListener('click', () => {
            showPlacePhotos(place.name);
        });
        
        placesList.appendChild(placeItem);
    });
}

// Populate Dates Tab
function populateDates() {
    calendarView.innerHTML = '';
    timelineView.innerHTML = '';
    
    // Simple calendar view
    const calendarContainer = document.createElement('div');
    calendarContainer.style.display = 'flex';
    calendarContainer.style.gap = '15px';
    calendarContainer.style.overflowX = 'auto';
    calendarContainer.style.paddingBottom = '15px';
    
    // Sort dates chronologically
    const sortedDates = Object.entries(appState.analyzedResults.dates)
        .sort((a, b) => {
            const [yearA, monthA] = a[0].split('-').map(Number);
            const [yearB, monthB] = b[0].split('-').map(Number);
            
            if (yearA !== yearB) return yearB - yearA;
            return monthB - monthA;
        });
    
    sortedDates.forEach(([dateKey, count]) => {
        const [year, month] = dateKey.split('-').map(Number);
        const monthNames = [
            '1月', '2月', '3月', '4月', '5月', '6月',
            '7月', '8月', '9月', '10月', '11月', '12月'
        ];
        
        const monthCard = document.createElement('div');
        monthCard.style.minWidth = '150px';
        monthCard.style.padding = '15px';
        monthCard.style.backgroundColor = '#f5f5f5';
        monthCard.style.borderRadius = '8px';
        monthCard.style.textAlign = 'center';
        monthCard.style.cursor = 'pointer';
        
        monthCard.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">${year}年 ${monthNames[month-1]}</div>
            <div style="font-size: 24px; color: #3498db;">${count}</div>
            <div style="font-size: 12px; color: #7f8c8d;">枚</div>
        `;
        
        monthCard.addEventListener('click', () => {
            showDatePhotos(year, month);
        });
        
        calendarContainer.appendChild(monthCard);
    });
    
    calendarView.appendChild(calendarContainer);
    
    // Simple timeline view
    const timelineContainer = document.createElement('div');
    timelineContainer.style.height = '100px';
    timelineContainer.style.position = 'relative';
    timelineContainer.style.backgroundColor = '#f5f5f5';
    timelineContainer.style.borderRadius = '8px';
    timelineContainer.style.marginTop = '20px';
    
    // Find max count for scaling
    const maxCount = Math.max(...Object.values(appState.analyzedResults.dates));
    
    // Create timeline bars
    sortedDates.forEach(([dateKey, count], index) => {
        const [year, month] = dateKey.split('-').map(Number);
        
        const barHeight = Math.max((count / maxCount) * 70, 10); // At least 10px height
        
        const bar = document.createElement('div');
        bar.style.position = 'absolute';
        bar.style.bottom = '15px';
        bar.style.left = `${index * (100 / sortedDates.length)}%`;
        bar.style.width = `${90 / sortedDates.length}%`;
        bar.style.height = `${barHeight}px`;
        bar.style.backgroundColor = '#3498db';
        bar.style.borderRadius = '4px 4px 0 0';
        bar.style.cursor = 'pointer';
        
        bar.title = `${year}年 ${month}月: ${count}枚`;
        
        bar.addEventListener('click', () => {
            showDatePhotos(year, month);
        });
        
        timelineContainer.appendChild(bar);
    });
    
    timelineView.appendChild(timelineContainer);
}

// Populate Quality Tab
function populateQuality() {
    // Default to showing best photos
    showQualityPhotos('best');
    
    // Add filter button event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            
            // Show photos for the selected filter
            showQualityPhotos(filter);
        });
    });
    
    // Activate first filter button by default
    document.querySelector('.filter-btn[data-filter="best"]').classList.add('active');
}

// Show Quality Photos Based on Filter
function showQualityPhotos(filter) {
    qualityGrid.innerHTML = '';
    
    if (!appState.analyzedResults.quality[filter] || appState.analyzedResults.quality[filter].length === 0) {
        qualityGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px 0; color: #666;">該当する写真がありません</div>';
        return;
    }
    
    appState.analyzedResults.quality[filter].forEach(photo => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${photo.thumbnail}" alt="" class="photo-thumbnail">
            <div class="photo-overlay">詳細を表示</div>
            <div class="photo-select" data-id="${photo.id}"></div>
        `;
        
        // Photo click event to show modal
        photoItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('photo-select')) {
                showPhotoDetails(photo);
            }
        });
        
        // Photo select checkbox
        const selectCheckbox = photoItem.querySelector('.photo-select');
        selectCheckbox.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePhotoSelection(photo.id, selectCheckbox);
        });
        
        qualityGrid.appendChild(photoItem);
    });
}

// Generate Recommendations
function generateRecommendations() {
    recommendationCards.innerHTML = '';
    
    // Create 3 sample recommendation cards
    const recommendations = [
        {
            title: 'ベストショット集',
            desc: 'あなたの最高の写真を集めたアルバムを作成しました。',
            image: 'https://source.unsplash.com/random/300x200/?best',
            action: 'アルバムを見る'
        },
        {
            title: '日本旅行 2025',
            desc: '3月〜4月の日本旅行中の写真から自動生成されたアルバム。',
            image: 'https://source.unsplash.com/random/300x200/?japan',
            action: 'アルバムを見る'
        },
        {
            title: '重複写真クリーンアップ',
            desc: '10枚の重複写真が見つかりました。クリーンアップしませんか？',
            image: 'https://source.unsplash.com/random/300x200/?clean',
            action: '整理する'
        }
    ];
    
    recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.innerHTML = `
            <img src="${rec.image}" alt="${rec.title}" class="recommendation-image">
            <div class="recommendation-content">
                <h3 class="recommendation-title">${rec.title}</h3>
                <p class="recommendation-desc">${rec.desc}</p>
                <button class="recommendation-btn">${rec.action}</button>
            </div>
        `;
        
        recommendationCards.appendChild(card);
    });
}

// Show Photo Details in Modal
function showPhotoDetails(photo) {
    // Set modal content
    modalImage.src = photo.thumbnail;
    photoTitle.textContent = `Photo ${photo.id}`;  // In real app, would use filename or title
    
    // Generate random metadata for demonstration
    const now = new Date();
    const randomMonth = Math.floor(Math.random() * 12);
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    
    const photoDate = new Date(now.getFullYear(), randomMonth, randomDay, randomHour, randomMinute);
    
    // Display metadata
    document.getElementById('photoDate').textContent = photoDate.toLocaleString('ja-JP');
    document.getElementById('photoCamera').textContent = ['iPhone 13 Pro', 'Canon EOS R5', 'Sony A7 IV', 'Nikon Z6 II'][Math.floor(Math.random() * 4)];
    document.getElementById('photoResolution').textContent = ['4032 x 3024', '5472 x 3648', '6000 x 4000', '8256 x 5504'][Math.floor(Math.random() * 4)];
    document.getElementById('photoSize').textContent = `${(Math.random() * 10 + 2).toFixed(2)} MB`;
    document.getElementById('photoLocation').textContent = ['東京, 日本', '京都, 日本', '大阪, 日本', ''][Math.floor(Math.random() * 4)];
    
    // Generate tags
    const possibleTags = ['風景', '建物', '自然', '人物', '食べ物', '旅行', '動物', '植物', '海', '山', '都会', '空', '夜景'];
    const numTags = Math.floor(Math.random() * 5) + 2;  // 2-6 tags
    const selectedTags = [];
    
    for (let i = 0; i < numTags; i++) {
        const randomIndex = Math.floor(Math.random() * possibleTags.length);
        const tag = possibleTags[randomIndex];
        
        if (!selectedTags.includes(tag)) {
            selectedTags.push(tag);
        }
    }
    
    tagsList.innerHTML = '';
    selectedTags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.textContent = tag;
        tagsList.appendChild(tagEl);
    });
    
    // Show modal
    photoModal.style.display = 'block';
}

// Toggle Photo Selection
function togglePhotoSelection(photoId, checkbox) {
    if (appState.selectedPhotos.has(photoId)) {
        appState.selectedPhotos.delete(photoId);
        checkbox.classList.remove('selected');
    } else {
        appState.selectedPhotos.add(photoId);
        checkbox.classList.add('selected');
    }
    
    updateBatchActionState();
}

// Update Batch Action Button States
function updateBatchActionState() {
    const hasSelected = appState.selectedPhotos.size > 0;
    
    downloadBtn.disabled = !hasSelected;
    shareBtn.disabled = !hasSelected;
    exportBtn.disabled = !hasSelected;
    createAlbumBtn.disabled = !hasSelected;
}

// Category Photos Handler
function showCategoryPhotos(categoryName) {
    alert(`カテゴリ "${categoryName}" の写真を表示します。実際のアプリではここに写真一覧が表示されます。`);
}

// Person Photos Handler
function showPersonPhotos(personName) {
    alert(`人物 "${personName}" の写真を表示します。実際のアプリではここに写真一覧が表示されます。`);
}

// Place Photos Handler
function showPlacePhotos(placeName) {
    alert(`場所 "${placeName}" の写真を表示します。実際のアプリではここに写真一覧が表示されます。`);
}

// Date Photos Handler
function showDatePhotos(year, month) {
    alert(`${year}年 ${month}月の写真を表示します。実際のアプリではここに写真一覧が表示されます。`);
}

// Batch Action Handlers
function handleDownload() {
    alert(`${appState.selectedPhotos.size}枚の写真をダウンロードします。`);
}

function handleShare() {
    alert(`${appState.selectedPhotos.size}枚の写真を共有します。`);
}

function handleExport() {
    alert(`${appState.selectedPhotos.size}枚の写真をエクスポートします。`);
}

function handleCreateAlbum() {
    const albumName = prompt('アルバム名を入力してください:');
    if (albumName) {
        alert(`"${albumName}" というアルバムを ${appState.selectedPhotos.size}枚の写真で作成します。`);
    }
}

// Initialize App
function initApp() {
    setupEventListeners();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);