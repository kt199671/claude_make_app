class VirtualGarden {
    constructor() {
        this.coins = 100;
        this.experience = 0;
        this.garden = [];
        this.collection = new Set();
        this.gardenSize = 16;
        
        this.plantTypes = {
            sunflower: { emoji: '🌻', name: 'ひまわり', cost: 20, xp: 15, growTime: 10000, harvestValue: 35 },
            rose: { emoji: '🌹', name: 'バラ', cost: 30, xp: 25, growTime: 15000, harvestValue: 50 },
            cherry: { emoji: '🌸', name: '桜', cost: 50, xp: 40, growTime: 20000, harvestValue: 80 },
            tulip: { emoji: '🌷', name: 'チューリップ', cost: 25, xp: 20, growTime: 12000, harvestValue: 40 }
        };

        this.init();
    }

    init() {
        this.createGarden();
        this.setupEventListeners();
        this.updateUI();
        this.loadProgress();
        this.startAutoSave();
    }

    createGarden() {
        const gardenElement = document.getElementById('garden');
        gardenElement.innerHTML = '';
        
        for (let i = 0; i < this.gardenSize; i++) {
            const slot = document.createElement('div');
            slot.className = 'garden-slot';
            slot.dataset.index = i;
            slot.innerHTML = '<div class="empty-slot">🌱</div>';
            
            slot.addEventListener('click', () => this.handleSlotClick(i));
            gardenElement.appendChild(slot);
            
            this.garden[i] = null;
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.seed-item').forEach(item => {
            item.addEventListener('click', () => {
                const plantType = item.dataset.plant;
                const cost = parseInt(item.dataset.cost);
                this.selectSeed(plantType, cost);
            });
        });

        document.getElementById('water-all').addEventListener('click', () => this.waterAll());
        document.getElementById('harvest-all').addEventListener('click', () => this.harvestAll());
        document.getElementById('fertilize-all').addEventListener('click', () => this.fertilizeAll());
    }

    selectSeed(plantType, cost) {
        if (this.coins < cost) {
            this.showNotification('コインが足りません！', 'error');
            return;
        }

        this.selectedSeed = { type: plantType, cost };
        this.showNotification(`${this.plantTypes[plantType].name}の種を選択しました。空いているスロットをクリックして植えてください。`, 'info');
        
        document.querySelectorAll('.seed-item').forEach(item => item.classList.remove('selected'));
        document.querySelector(`[data-plant="${plantType}"]`).classList.add('selected');
    }

    handleSlotClick(index) {
        if (!this.selectedSeed) {
            if (this.garden[index]) {
                this.interactWithPlant(index);
            } else {
                this.showNotification('まず種を選んでください！', 'info');
            }
            return;
        }

        if (this.garden[index]) {
            this.showNotification('ここにはすでに植物があります！', 'error');
            return;
        }

        this.plantSeed(index);
    }

    plantSeed(index) {
        if (this.coins < this.selectedSeed.cost) return;

        this.coins -= this.selectedSeed.cost;
        
        const plant = {
            type: this.selectedSeed.type,
            plantedAt: Date.now(),
            stage: 'seedling',
            waterLevel: 50,
            health: 100,
            hasGrown: false
        };

        this.garden[index] = plant;
        this.updateSlot(index);
        this.updateUI();
        
        this.showNotification(`${this.plantTypes[this.selectedSeed.type].name}を植えました！`, 'success');
        this.selectedSeed = null;
        
        document.querySelectorAll('.seed-item').forEach(item => item.classList.remove('selected'));
        
        setTimeout(() => this.growPlant(index), this.plantTypes[plant.type].growTime);
    }

    growPlant(index) {
        const plant = this.garden[index];
        if (!plant || plant.hasGrown) return;

        plant.stage = 'grown';
        plant.hasGrown = true;
        this.updateSlot(index);
        
        this.showNotification(`${this.plantTypes[plant.type].name}が成長しました！🌟`, 'success');
    }

    interactWithPlant(index) {
        const plant = this.garden[index];
        if (!plant) return;

        if (plant.stage === 'grown') {
            this.harvestPlant(index);
        } else {
            this.waterPlant(index);
        }
    }

    waterPlant(index) {
        const plant = this.garden[index];
        if (!plant) return;

        plant.waterLevel = Math.min(100, plant.waterLevel + 25);
        plant.health = Math.min(100, plant.health + 10);
        
        this.updateSlot(index);
        this.showNotification('水をあげました！💧', 'success');
    }

    harvestPlant(index) {
        const plant = this.garden[index];
        if (!plant || plant.stage !== 'grown') return;

        const plantInfo = this.plantTypes[plant.type];
        this.coins += plantInfo.harvestValue;
        this.experience += plantInfo.xp;
        
        this.collection.add(plant.type);
        
        this.garden[index] = null;
        this.updateSlot(index);
        this.updateUI();
        this.updateCollection();
        
        this.showNotification(`${plantInfo.name}を収穫しました！+${plantInfo.harvestValue}🪙 +${plantInfo.xp}XP`, 'success');
    }

    waterAll() {
        let watered = 0;
        this.garden.forEach((plant, index) => {
            if (plant && plant.stage === 'seedling') {
                this.waterPlant(index);
                watered++;
            }
        });
        
        if (watered > 0) {
            this.showNotification(`${watered}個の植物に水をあげました！`, 'success');
        } else {
            this.showNotification('水をあげる植物がありません。', 'info');
        }
    }

    harvestAll() {
        let harvested = 0;
        this.garden.forEach((plant, index) => {
            if (plant && plant.stage === 'grown') {
                this.harvestPlant(index);
                harvested++;
            }
        });
        
        if (harvested > 0) {
            this.showNotification(`${harvested}個の植物を収穫しました！`, 'success');
        } else {
            this.showNotification('収穫できる植物がありません。', 'info');
        }
    }

    fertilizeAll() {
        if (this.coins < 10) {
            this.showNotification('肥料代が足りません！（10🪙必要）', 'error');
            return;
        }

        let fertilized = 0;
        this.garden.forEach((plant, index) => {
            if (plant) {
                plant.health = 100;
                plant.waterLevel = Math.min(100, plant.waterLevel + 50);
                this.updateSlot(index);
                fertilized++;
            }
        });

        if (fertilized > 0) {
            this.coins -= 10;
            this.updateUI();
            this.showNotification(`${fertilized}個の植物に肥料をあげました！`, 'success');
        } else {
            this.showNotification('肥料をあげる植物がありません。', 'info');
        }
    }

    updateSlot(index) {
        const slot = document.querySelector(`[data-index="${index}"]`);
        const plant = this.garden[index];
        
        if (!plant) {
            slot.innerHTML = '<div class="empty-slot">🌱</div>';
            slot.className = 'garden-slot';
            return;
        }

        const plantInfo = this.plantTypes[plant.type];
        const healthClass = plant.health > 70 ? 'healthy' : plant.health > 30 ? 'ok' : 'poor';
        
        slot.className = `garden-slot ${plant.stage} ${healthClass}`;
        
        if (plant.stage === 'seedling') {
            slot.innerHTML = `
                <div class="plant">
                    <div class="seedling">🌱</div>
                    <div class="water-level" style="width: ${plant.waterLevel}%"></div>
                </div>
            `;
        } else {
            slot.innerHTML = `
                <div class="plant grown">
                    <div class="grown-plant">${plantInfo.emoji}</div>
                    <div class="harvest-indicator">✨</div>
                </div>
            `;
        }
    }

    updateUI() {
        document.getElementById('coins').textContent = this.coins;
        document.getElementById('experience').textContent = this.experience;
    }

    updateCollection() {
        const collectionElement = document.getElementById('collection');
        collectionElement.innerHTML = '';
        
        Object.keys(this.plantTypes).forEach(plantType => {
            const item = document.createElement('div');
            item.className = `collection-item ${this.collection.has(plantType) ? 'collected' : 'locked'}`;
            
            if (this.collection.has(plantType)) {
                item.innerHTML = `
                    <div class="plant-emoji">${this.plantTypes[plantType].emoji}</div>
                    <div class="plant-name">${this.plantTypes[plantType].name}</div>
                `;
            } else {
                item.innerHTML = `
                    <div class="plant-emoji">❓</div>
                    <div class="plant-name">???</div>
                `;
            }
            
            collectionElement.appendChild(item);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    saveProgress() {
        const saveData = {
            coins: this.coins,
            experience: this.experience,
            garden: this.garden,
            collection: Array.from(this.collection)
        };
        localStorage.setItem('virtualGarden', JSON.stringify(saveData));
    }

    loadProgress() {
        const saveData = localStorage.getItem('virtualGarden');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.coins = data.coins || 100;
            this.experience = data.experience || 0;
            this.garden = data.garden || [];
            this.collection = new Set(data.collection || []);
            
            this.garden.forEach((plant, index) => {
                if (plant) {
                    this.updateSlot(index);
                    if (plant.stage === 'seedling' && !plant.hasGrown) {
                        const elapsed = Date.now() - plant.plantedAt;
                        const growTime = this.plantTypes[plant.type].growTime;
                        if (elapsed >= growTime) {
                            this.growPlant(index);
                        } else {
                            setTimeout(() => this.growPlant(index), growTime - elapsed);
                        }
                    }
                }
            });
            
            this.updateUI();
            this.updateCollection();
        }
    }

    startAutoSave() {
        setInterval(() => this.saveProgress(), 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VirtualGarden();
});