// AIペットバトル ゲームロジック
class PetBattleGame {
    constructor() {
        this.currentScreen = 'main-menu';
        this.playerData = {
            level: 1,
            exp: 0,
            coins: 100,
            gems: 5,
            wins: 0,
            losses: 0
        };
        
        this.myPet = null;
        this.opponentPet = null;
        this.battleState = null;
        this.aiEnabled = false;
        this.aiThinkingTime = 1500;
        
        this.petDatabase = this.initializePetDatabase();
        this.discoveredPets = new Set(['fire', 'water', 'grass']);
        
        this.init();
    }

    init() {
        this.loadGameData();
        this.showScreen('main-menu');
    }

    initializePetDatabase() {
        return {
            // スターターペット
            fire: {
                name: 'ファイアー',
                sprite: '🔥',
                type: 'fire',
                baseStats: { hp: 100, attack: 50, defense: 30, speed: 40 },
                evolution: { to: 'blaze', level: 16, item: 'fire-stone' }
            },
            water: {
                name: 'アクア',
                sprite: '💧',
                type: 'water',
                baseStats: { hp: 110, attack: 40, defense: 40, speed: 35 },
                evolution: { to: 'tsunami', level: 16, item: 'water-stone' }
            },
            grass: {
                name: 'リーフ',
                sprite: '🌿',
                type: 'grass',
                baseStats: { hp: 120, attack: 35, defense: 50, speed: 30 },
                evolution: { to: 'forest', level: 16, item: 'leaf-stone' }
            },
            // 進化形
            blaze: {
                name: 'ブレイズ',
                sprite: '🌋',
                type: 'fire',
                baseStats: { hp: 150, attack: 80, defense: 50, speed: 60 },
                evolution: { to: 'inferno', level: 36 }
            },
            tsunami: {
                name: 'ツナミ',
                sprite: '🌊',
                type: 'water',
                baseStats: { hp: 170, attack: 65, defense: 65, speed: 55 },
                evolution: { to: 'ocean', level: 36 }
            },
            forest: {
                name: 'フォレスト',
                sprite: '🌳',
                type: 'grass',
                baseStats: { hp: 180, attack: 55, defense: 80, speed: 45 },
                evolution: { to: 'jungle', level: 36 }
            },
            // 最終進化
            inferno: {
                name: 'インフェルノ',
                sprite: '🔥🔥',
                type: 'fire',
                baseStats: { hp: 200, attack: 120, defense: 70, speed: 90 }
            },
            ocean: {
                name: 'オーシャン',
                sprite: '🌊🌊',
                type: 'water',
                baseStats: { hp: 220, attack: 95, defense: 95, speed: 80 }
            },
            jungle: {
                name: 'ジャングル',
                sprite: '🌳🌳',
                type: 'grass',
                baseStats: { hp: 240, attack: 80, defense: 120, speed: 65 }
            },
            // 野生ペット
            spark: {
                name: 'スパーク',
                sprite: '⚡',
                type: 'electric',
                baseStats: { hp: 90, attack: 55, defense: 25, speed: 60 }
            },
            rock: {
                name: 'ロック',
                sprite: '🪨',
                type: 'rock',
                baseStats: { hp: 130, attack: 45, defense: 70, speed: 20 }
            },
            ghost: {
                name: 'ゴースト',
                sprite: '👻',
                type: 'ghost',
                baseStats: { hp: 80, attack: 60, defense: 20, speed: 70 }
            },
            dragon: {
                name: 'ドラゴン',
                sprite: '🐉',
                type: 'dragon',
                baseStats: { hp: 150, attack: 80, defense: 60, speed: 50 }
            },
            ice: {
                name: 'アイス',
                sprite: '❄️',
                type: 'ice',
                baseStats: { hp: 100, attack: 50, defense: 40, speed: 45 }
            },
            dark: {
                name: 'ダーク',
                sprite: '🌑',
                type: 'dark',
                baseStats: { hp: 110, attack: 70, defense: 35, speed: 55 }
            },
            fairy: {
                name: 'フェアリー',
                sprite: '🧚',
                type: 'fairy',
                baseStats: { hp: 95, attack: 40, defense: 45, speed: 50 }
            }
        };
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
        this.currentScreen = screenId;
    }

    showMainMenu() {
        this.showScreen('main-menu');
    }

    showPetSelection() {
        this.showScreen('pet-selection');
    }

    showHome() {
        this.updateHomeDisplay();
        this.showScreen('home-screen');
    }

    selectStarter(type) {
        const petData = this.petDatabase[type];
        this.myPet = {
            id: type,
            name: petData.name,
            sprite: petData.sprite,
            type: petData.type,
            level: 1,
            exp: 0,
            stats: { ...petData.baseStats },
            currentHp: petData.baseStats.hp,
            skills: ['attack', 'special', 'defend']
        };
        
        this.saveGameData();
        this.showNotification(`${petData.name}を仲間にした！`);
        this.showHome();
    }

    updateHomeDisplay() {
        if (!this.myPet) return;
        
        document.getElementById('player-level').textContent = this.playerData.level;
        document.getElementById('player-exp').textContent = this.playerData.exp;
        document.getElementById('exp-to-next').textContent = this.getExpToNextLevel();
        document.getElementById('coins').textContent = this.playerData.coins;
        document.getElementById('gems').textContent = this.playerData.gems;
        
        document.getElementById('my-pet-sprite').textContent = this.myPet.sprite;
        document.getElementById('pet-name').textContent = this.myPet.name;
        document.getElementById('pet-level').textContent = this.myPet.level;
        document.getElementById('pet-hp').textContent = this.myPet.stats.hp;
        document.getElementById('pet-attack').textContent = this.myPet.stats.attack;
        document.getElementById('pet-defense').textContent = this.myPet.stats.defense;
        document.getElementById('pet-speed').textContent = this.myPet.stats.speed;
        
        const expPercentage = (this.myPet.exp / this.getPetExpToNextLevel()) * 100;
        document.getElementById('pet-exp-bar').style.width = `${expPercentage}%`;
    }

    startBattle() {
        if (!this.myPet) return;
        
        // ランダムな対戦相手を選択
        const opponentTypes = Object.keys(this.petDatabase);
        const randomType = opponentTypes[Math.floor(Math.random() * opponentTypes.length)];
        const opponentData = this.petDatabase[randomType];
        
        // 対戦相手のレベルを調整
        const opponentLevel = Math.max(1, this.myPet.level + Math.floor(Math.random() * 5) - 2);
        
        this.opponentPet = {
            id: randomType,
            name: opponentData.name,
            sprite: opponentData.sprite,
            type: opponentData.type,
            level: opponentLevel,
            stats: this.calculateStats(opponentData.baseStats, opponentLevel),
            currentHp: 0
        };
        this.opponentPet.currentHp = this.opponentPet.stats.hp;
        
        this.battleState = {
            playerHp: this.myPet.stats.hp,
            opponentHp: this.opponentPet.stats.hp,
            turn: 'player',
            battleLog: []
        };
        
        this.myPet.currentHp = this.myPet.stats.hp;
        
        this.updateBattleDisplay();
        this.showScreen('battle-screen');
        this.addBattleLog(`野生の${this.opponentPet.name}が現れた！`);
        
        // 新しいペットを発見
        if (!this.discoveredPets.has(randomType)) {
            this.discoveredPets.add(randomType);
            this.showNotification(`新しいペットを発見！図鑑に追加されました`);
        }
    }

    calculateStats(baseStats, level) {
        const multiplier = 1 + (level - 1) * 0.1;
        return {
            hp: Math.floor(baseStats.hp * multiplier),
            attack: Math.floor(baseStats.attack * multiplier),
            defense: Math.floor(baseStats.defense * multiplier),
            speed: Math.floor(baseStats.speed * multiplier)
        };
    }

    updateBattleDisplay() {
        // プレイヤー側
        document.getElementById('player-sprite').textContent = this.myPet.sprite;
        document.getElementById('player-pet-name').textContent = this.myPet.name;
        document.getElementById('player-hp').textContent = Math.max(0, this.myPet.currentHp);
        document.getElementById('player-max-hp').textContent = this.myPet.stats.hp;
        const playerHpPercent = (this.myPet.currentHp / this.myPet.stats.hp) * 100;
        document.getElementById('player-hp-bar').style.width = `${playerHpPercent}%`;
        
        // 対戦相手側
        document.getElementById('opponent-sprite').textContent = this.opponentPet.sprite;
        document.getElementById('opponent-name').textContent = this.opponentPet.name;
        document.getElementById('opponent-hp').textContent = Math.max(0, this.opponentPet.currentHp);
        document.getElementById('opponent-max-hp').textContent = this.opponentPet.stats.hp;
        const opponentHpPercent = (this.opponentPet.currentHp / this.opponentPet.stats.hp) * 100;
        document.getElementById('opponent-hp-bar').style.width = `${opponentHpPercent}%`;
    }

    useSkill(skillType) {
        if (this.battleState.turn !== 'player' || this.battleState.isProcessing) return;
        
        this.battleState.isProcessing = true;
        let damage = 0;
        let message = '';
        
        switch(skillType) {
            case 'attack':
                damage = this.calculateDamage(this.myPet, this.opponentPet);
                this.opponentPet.currentHp -= damage;
                message = `${this.myPet.name}の攻撃！${damage}のダメージ！`;
                this.createAttackEffect('opponent');
                break;
            case 'special':
                damage = this.calculateDamage(this.myPet, this.opponentPet, 1.5);
                this.opponentPet.currentHp -= damage;
                message = `${this.myPet.name}の必殺技！${damage}のダメージ！`;
                this.createSpecialEffect('opponent');
                break;
            case 'defend':
                this.myPet.defending = true;
                message = `${this.myPet.name}は防御の構えを取った！`;
                this.createDefendEffect('player');
                break;
        }
        
        this.addBattleLog(message);
        this.updateBattleDisplay();
        
        if (this.opponentPet.currentHp <= 0) {
            this.endBattle(true);
        } else {
            this.battleState.turn = 'opponent';
            setTimeout(() => {
                this.opponentTurn();
            }, 1000);
        }
        
        this.battleState.isProcessing = false;
    }

    calculateDamage(attacker, defender, multiplier = 1) {
        const baseDamage = attacker.stats.attack - defender.stats.defense / 2;
        const randomFactor = 0.85 + Math.random() * 0.3;
        const typeMultiplier = this.getTypeEffectiveness(attacker.type, defender.type);
        return Math.max(1, Math.floor(baseDamage * randomFactor * typeMultiplier * multiplier));
    }

    getTypeEffectiveness(attackerType, defenderType) {
        const effectiveness = {
            fire: { grass: 2, water: 0.5, fire: 0.5, ice: 2 },
            water: { fire: 2, grass: 0.5, water: 0.5, rock: 2 },
            grass: { water: 2, fire: 0.5, grass: 0.5, rock: 2 },
            electric: { water: 2, grass: 0.5, electric: 0.5 },
            rock: { fire: 2, electric: 2, rock: 0.5 },
            ghost: { ghost: 2, dark: 0.5 },
            dragon: { dragon: 2 },
            ice: { grass: 2, fire: 0.5, water: 0.5, ice: 0.5 },
            dark: { ghost: 2, fairy: 0.5 },
            fairy: { dark: 2, dragon: 2 }
        };
        
        if (effectiveness[attackerType] && effectiveness[attackerType][defenderType]) {
            return effectiveness[attackerType][defenderType];
        }
        return 1;
    }

    opponentTurn() {
        if (this.aiEnabled) {
            // AI による賢い行動選択
            setTimeout(() => {
                const action = this.getAIAction();
                this.executeOpponentAction(action);
            }, this.aiThinkingTime);
        } else {
            // ランダムな行動
            const actions = ['attack', 'special', 'defend'];
            const action = actions[Math.floor(Math.random() * actions.length)];
            this.executeOpponentAction(action);
        }
    }

    getAIAction() {
        // AI戦略ロジック
        const myHpPercent = this.myPet.currentHp / this.myPet.stats.hp;
        const oppHpPercent = this.opponentPet.currentHp / this.opponentPet.stats.hp;
        
        // HPが少ない時は防御を優先
        if (oppHpPercent < 0.3 && Math.random() < 0.5) {
            return 'defend';
        }
        
        // 相手のHPが少ない時は必殺技
        if (myHpPercent < 0.3 && Math.random() < 0.7) {
            return 'special';
        }
        
        // タイプ相性を考慮
        const typeAdvantage = this.getTypeEffectiveness(this.opponentPet.type, this.myPet.type);
        if (typeAdvantage > 1) {
            return Math.random() < 0.6 ? 'special' : 'attack';
        }
        
        // 通常は攻撃
        return 'attack';
    }

    executeOpponentAction(action) {
        let damage = 0;
        let message = '';
        
        switch(action) {
            case 'attack':
                damage = this.calculateDamage(this.opponentPet, this.myPet);
                if (this.myPet.defending) {
                    damage = Math.floor(damage * 0.5);
                    this.myPet.defending = false;
                }
                this.myPet.currentHp -= damage;
                message = `${this.opponentPet.name}の攻撃！${damage}のダメージ！`;
                this.createAttackEffect('player');
                break;
            case 'special':
                damage = this.calculateDamage(this.opponentPet, this.myPet, 1.5);
                if (this.myPet.defending) {
                    damage = Math.floor(damage * 0.5);
                    this.myPet.defending = false;
                }
                this.myPet.currentHp -= damage;
                message = `${this.opponentPet.name}の必殺技！${damage}のダメージ！`;
                this.createSpecialEffect('player');
                break;
            case 'defend':
                this.opponentPet.defending = true;
                message = `${this.opponentPet.name}は防御の構えを取った！`;
                this.createDefendEffect('opponent');
                break;
        }
        
        this.addBattleLog(message);
        this.updateBattleDisplay();
        
        if (this.myPet.currentHp <= 0) {
            this.endBattle(false);
        } else {
            this.battleState.turn = 'player';
        }
    }

    endBattle(victory) {
        if (victory) {
            const expGained = this.opponentPet.level * 50;
            const coinsGained = this.opponentPet.level * 20;
            
            this.myPet.exp += expGained;
            this.playerData.exp += Math.floor(expGained / 2);
            this.playerData.coins += coinsGained;
            this.playerData.wins++;
            
            this.addBattleLog(`勝利！${expGained}EXPと${coinsGained}コインを獲得！`);
            
            // レベルアップチェック
            this.checkLevelUp();
            
            setTimeout(() => {
                this.showHome();
                this.showNotification('バトルに勝利しました！');
            }, 2000);
        } else {
            this.playerData.losses++;
            this.addBattleLog('敗北...');
            
            setTimeout(() => {
                this.showHome();
                this.showNotification('バトルに敗北しました...');
            }, 2000);
        }
        
        this.saveGameData();
    }

    checkLevelUp() {
        const expNeeded = this.getPetExpToNextLevel();
        while (this.myPet.exp >= expNeeded) {
            this.myPet.exp -= expNeeded;
            this.myPet.level++;
            this.myPet.stats = this.calculateStats(this.petDatabase[this.myPet.id].baseStats, this.myPet.level);
            this.showNotification(`${this.myPet.name}がレベル${this.myPet.level}にアップ！`);
        }
        
        const playerExpNeeded = this.getExpToNextLevel();
        while (this.playerData.exp >= playerExpNeeded) {
            this.playerData.exp -= playerExpNeeded;
            this.playerData.level++;
            this.playerData.gems += 1;
            this.showNotification(`プレイヤーレベルが${this.playerData.level}にアップ！ジェム+1`);
        }
    }

    getPetExpToNextLevel() {
        return this.myPet.level * 100;
    }

    getExpToNextLevel() {
        return this.playerData.level * 100;
    }

    trainPet() {
        if (this.playerData.coins >= 50) {
            this.playerData.coins -= 50;
            const statBoost = Math.floor(Math.random() * 3) + 1;
            const stats = ['attack', 'defense', 'speed'];
            const boostedStat = stats[Math.floor(Math.random() * stats.length)];
            
            this.myPet.stats[boostedStat] += statBoost;
            this.showNotification(`${boostedStat}が+${statBoost}上昇！`);
            this.updateHomeDisplay();
            this.saveGameData();
        } else {
            this.showNotification('コインが不足しています！');
        }
    }

    feedPet() {
        if (this.playerData.coins >= 30) {
            this.playerData.coins -= 30;
            this.myPet.stats.hp += 5;
            this.myPet.currentHp = this.myPet.stats.hp;
            this.showNotification('HPが+5上昇！体力も全回復！');
            this.updateHomeDisplay();
            this.saveGameData();
        } else {
            this.showNotification('コインが不足しています！');
        }
    }

    showEvolution() {
        const petData = this.petDatabase[this.myPet.id];
        if (!petData.evolution) {
            this.showNotification('このペットはこれ以上進化しません！');
            return;
        }
        
        const evolution = petData.evolution;
        const evoPetData = this.petDatabase[evolution.to];
        
        document.getElementById('evo-from-sprite').textContent = this.myPet.sprite;
        document.getElementById('evo-from-name').textContent = this.myPet.name;
        document.getElementById('evo-to-sprite').textContent = evoPetData.sprite;
        document.getElementById('evo-to-name').textContent = evoPetData.name;
        
        const requirements = [`レベル${evolution.level}以上`];
        if (evolution.item) {
            requirements.push(`${evolution.item} x1`);
        }
        
        const reqList = document.getElementById('evo-requirements');
        reqList.innerHTML = requirements.map(req => `<li>${req}</li>`).join('');
        
        this.showScreen('evolution-screen');
    }

    evolvePet() {
        const petData = this.petDatabase[this.myPet.id];
        const evolution = petData.evolution;
        
        if (this.myPet.level >= evolution.level) {
            const evoPetData = this.petDatabase[evolution.to];
            
            this.myPet.id = evolution.to;
            this.myPet.name = evoPetData.name;
            this.myPet.sprite = evoPetData.sprite;
            this.myPet.type = evoPetData.type;
            this.myPet.stats = this.calculateStats(evoPetData.baseStats, this.myPet.level);
            
            this.createEvolutionEffect();
            this.showNotification(`${petData.name}が${evoPetData.name}に進化した！`);
            
            setTimeout(() => {
                this.showHome();
            }, 2000);
            
            this.saveGameData();
        } else {
            this.showNotification('進化条件を満たしていません！');
        }
    }

    toggleAIBattle() {
        this.aiEnabled = !this.aiEnabled;
        document.getElementById('ai-status').textContent = this.aiEnabled ? 'ON' : 'OFF';
        
        if (this.aiEnabled && this.battleState && this.battleState.turn === 'player') {
            setTimeout(() => {
                const action = this.getPlayerAIAction();
                this.useSkill(action);
            }, this.aiThinkingTime);
        }
    }

    getPlayerAIAction() {
        // プレイヤー側のAI戦略
        const myHpPercent = this.myPet.currentHp / this.myPet.stats.hp;
        const oppHpPercent = this.opponentPet.currentHp / this.opponentPet.stats.hp;
        
        if (myHpPercent < 0.3 && Math.random() < 0.5) {
            return 'defend';
        }
        
        if (oppHpPercent < 0.3 && Math.random() < 0.7) {
            return 'special';
        }
        
        return Math.random() < 0.7 ? 'attack' : 'special';
    }

    showCollection() {
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = '';
        
        Object.entries(this.petDatabase).forEach(([id, pet]) => {
            const discovered = this.discoveredPets.has(id);
            const petCard = document.createElement('div');
            petCard.className = `collection-pet ${discovered ? 'discovered' : 'undiscovered'}`;
            petCard.innerHTML = `
                <div class="collection-sprite">${discovered ? pet.sprite : '❓'}</div>
                <div class="collection-name">${discovered ? pet.name : '???'}</div>
            `;
            grid.appendChild(petCard);
        });
        
        document.getElementById('discovered-count').textContent = this.discoveredPets.size;
        document.getElementById('total-pets').textContent = Object.keys(this.petDatabase).length;
        document.getElementById('completion-rate').textContent = Math.floor((this.discoveredPets.size / Object.keys(this.petDatabase).length) * 100);
        
        this.showScreen('collection-screen');
    }

    showRanking() {
        this.showRankingTab('power');
        this.showScreen('ranking-screen');
    }

    showRankingTab(type) {
        document.querySelectorAll('.ranking-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = '';
        
        // ダミーランキングデータ
        const rankings = this.generateRankings(type);
        
        rankings.forEach((player, index) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'ranking-item';
            rankItem.innerHTML = `
                <span class="rank-number">${index + 1}</span>
                <span class="rank-name">${player.name}</span>
                <span class="rank-score">${player.score}</span>
            `;
            rankingList.appendChild(rankItem);
        });
    }

    generateRankings(type) {
        const names = ['マスター', 'チャンピオン', 'エース', 'プロ', 'ベテラン', 'ルーキー', 'ビギナー'];
        const rankings = [];
        
        for (let i = 0; i < 10; i++) {
            let score;
            switch(type) {
                case 'power':
                    score = Math.floor(Math.random() * 10000) + 5000;
                    break;
                case 'wins':
                    score = Math.floor(Math.random() * 1000) + 100;
                    break;
                case 'collection':
                    score = Math.floor(Math.random() * 50) + 10;
                    break;
            }
            
            rankings.push({
                name: names[Math.floor(Math.random() * names.length)] + (i + 1),
                score: score
            });
        }
        
        rankings.sort((a, b) => b.score - a.score);
        
        // 自分を追加
        if (this.myPet) {
            let myScore;
            switch(type) {
                case 'power':
                    myScore = Object.values(this.myPet.stats).reduce((a, b) => a + b, 0);
                    break;
                case 'wins':
                    myScore = this.playerData.wins;
                    break;
                case 'collection':
                    myScore = this.discoveredPets.size;
                    break;
            }
            
            rankings.push({
                name: 'あなた',
                score: myScore
            });
        }
        
        return rankings;
    }

    addBattleLog(message) {
        const log = document.getElementById('battle-log');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    createAttackEffect(target) {
        const effect = document.createElement('div');
        effect.className = 'attack-effect';
        effect.textContent = '💥';
        
        const targetElement = target === 'player' ? 
            document.querySelector('.battle-pet-sprite.player') : 
            document.querySelector('.battle-pet-sprite.opponent');
        
        targetElement.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 500);
    }

    createSpecialEffect(target) {
        const effect = document.createElement('div');
        effect.className = 'special-effect';
        effect.textContent = '⚡💥⚡';
        
        const targetElement = target === 'player' ? 
            document.querySelector('.battle-pet-sprite.player') : 
            document.querySelector('.battle-pet-sprite.opponent');
        
        targetElement.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 800);
    }

    createDefendEffect(target) {
        const effect = document.createElement('div');
        effect.className = 'defend-effect';
        effect.textContent = '🛡️';
        
        const targetElement = target === 'player' ? 
            document.querySelector('.battle-pet-sprite.player') : 
            document.querySelector('.battle-pet-sprite.opponent');
        
        targetElement.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 1000);
    }

    createEvolutionEffect() {
        const effectsLayer = document.getElementById('effects-layer');
        effectsLayer.innerHTML = '<div class="evolution-effect">✨🌟✨</div>';
        effectsLayer.style.display = 'block';
        
        setTimeout(() => {
            effectsLayer.style.display = 'none';
            effectsLayer.innerHTML = '';
        }, 2000);
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    useItem() {
        if (this.playerData.gems >= 1) {
            this.playerData.gems -= 1;
            this.myPet.currentHp = Math.min(this.myPet.stats.hp, this.myPet.currentHp + 50);
            this.addBattleLog('回復アイテムを使用！HPが50回復！');
            this.updateBattleDisplay();
            this.saveGameData();
        } else {
            this.addBattleLog('ジェムが不足しています！');
        }
    }

    saveGameData() {
        const saveData = {
            playerData: this.playerData,
            myPet: this.myPet,
            discoveredPets: Array.from(this.discoveredPets)
        };
        localStorage.setItem('aiPetBattleSave', JSON.stringify(saveData));
    }

    loadGameData() {
        const savedData = localStorage.getItem('aiPetBattleSave');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.playerData = data.playerData || this.playerData;
            this.myPet = data.myPet || null;
            this.discoveredPets = new Set(data.discoveredPets || ['fire', 'water', 'grass']);
        }
    }
}

// ゲーム初期化
const game = new PetBattleGame();