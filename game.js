// QUANTUM RPG ENGINE v1.0
class GameEngine {
    constructor() {
        this.player = {
            name: 'Quantum Hero',
            level: 1,
            exp: 0,
            expToNext: 100,
            hp: 50,
            maxHp: 50,
            mp: 20,
            maxMp: 20,
            gold: 100,
            attack: 15,
            defense: 8,
            magic: 12,
            weapon: 'Iron Sword',
            armor: 'Leather Armor',
            inventory: {
                potion: 3,
                ether: 1,
                elixir: 0
            }
        };
        
        this.currentEnemy = null;
        this.inCombat = false;
        this.location = 'starting_village';
        this.quests = {
            current: 'Defeat the Goblin King',
            progress: 0,
            goal: 1
        };
        
        this.enemies = {
            slime: { name: 'Slime', hp: 20, maxHp: 20, attack: 5, defense: 2, exp: 10, gold: 5, sprite: '👾' },
            goblin: { name: 'Goblin', hp: 35, maxHp: 35, attack: 8, defense: 4, exp: 20, gold: 10, sprite: '👺' },
            wolf: { name: 'Wolf', hp: 45, maxHp: 45, attack: 12, defense: 3, exp: 25, gold: 15, sprite: '🐺' },
            orc: { name: 'Orc', hp: 70, maxHp: 70, attack: 15, defense: 8, exp: 40, gold: 25, sprite: '👹' },
            goblinKing: { name: 'Goblin King', hp: 120, maxHp: 120, attack: 20, defense: 12, exp: 100, gold: 100, sprite: '👑👺' }
        };
        
        this.log = [];
        this.initEventListeners();
        this.updateUI();
        this.addLog('Welcome to Dragon Quest!');
        this.addLog('Use ATTACK to fight enemies!');
    }
    
    initEventListeners() {
        document.getElementById('btnAttack').addEventListener('click', () => this.attack());
        document.getElementById('btnMagic').addEventListener('click', () => this.toggleMagicMenu());
        document.getElementById('btnItem').addEventListener('click', () => this.useItem());
        document.getElementById('btnFlee').addEventListener('click', () => this.flee());
        document.getElementById('btnRest').addEventListener('click', () => this.rest());
        document.getElementById('btnShop').addEventListener('click', () => this.toggleShop());
        document.getElementById('closeMagic').addEventListener('click', () => this.toggleMagicMenu());
        document.getElementById('closeShop').addEventListener('click', () => this.toggleShop());
        
        // Spell listeners
        document.querySelectorAll('.spell-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const spell = e.target.dataset.spell;
                this.castSpell(spell);
            });
        });
        
        // Shop listeners
        document.querySelectorAll('.shop-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const itemName = e.target.dataset.item;
                this.buyItem(itemName);
            });
        });
        
        // Random encounter setiap 30 detik
        setInterval(() => this.randomEncounter(), 30000);
    }
    
    // LOGGING
    addLog(message) {
        this.log.push(message);
        if (this.log.length > 8) this.log.shift();
        this.updateLog();
    }
    
    updateLog() {
        const logDiv = document.getElementById('combatLog');
        logDiv.innerHTML = this.log.map(msg => `<div class="log-entry">${msg}</div>`).join('');
    }
    
    // UI UPDATE
    updateUI() {
        // Player stats
        document.getElementById('playerName').textContent = this.player.name;
        document.getElementById('playerLevel').textContent = this.player.level;
        document.getElementById('playerHp').textContent = this.player.hp;
        document.getElementById('playerMaxHp').textContent = this.player.maxHp;
        document.getElementById('playerMp').textContent = this.player.mp;
        document.getElementById('playerMaxMp').textContent = this.player.maxMp;
        document.getElementById('playerGold').textContent = this.player.gold;
        
        // HP Bars
        const playerHpPercent = (this.player.hp / this.player.maxHp) * 100;
        document.getElementById('playerHpBar').style.width = playerHpPercent + '%';
        
        if (this.currentEnemy) {
            const enemyHpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
            document.getElementById('enemyHpBar').style.width = enemyHpPercent + '%';
        }
        
        // Inventory
        this.updateInventory();
        
        // Location
        document.getElementById('locationText').textContent = this.getLocationName();
        
        // Shop gold
        document.getElementById('shopGold').textContent = this.player.gold;
    }
    
    updateInventory() {
        const invList = document.getElementById('inventoryList');
        invList.innerHTML = '';
        
        if (this.player.inventory.potion > 0) {
            invList.innerHTML += `<li>Potion x${this.player.inventory.potion}</li>`;
        }
        if (this.player.inventory.ether > 0) {
            invList.innerHTML += `<li>Ether x${this.player.inventory.ether}</li>`;
        }
        if (this.player.inventory.elixir > 0) {
            invList.innerHTML += `<li>Elixir x${this.player.inventory.elixir}</li>`;
        }
        
        document.getElementById('weapon').textContent = this.player.weapon;
        document.getElementById('armor').textContent = this.player.armor;
    }
    
    getLocationName() {
        const locations = {
            'starting_village': '🏠 Starting Village',
            'forest': '🌲 Dark Forest',
            'mountains': '⛰️ Dragon Mountains',
            'dungeon': '🏰 Goblin Dungeon'
        };
        return locations[this.location] || 'Unknown';
    }
    
    // COMBAT SYSTEM
    spawnEnemy(enemyType) {
        if (this.inCombat) return;
        
        const enemyData = this.enemies[enemyType];
        this.currentEnemy = {
            ...enemyData,
            hp: enemyData.hp * (1 + (this.player.level - 1) * 0.2) // Scale dengan level
        };
        this.currentEnemy.maxHp = this.currentEnemy.hp;
        
        document.getElementById('enemyName').textContent = this.currentEnemy.name;
        document.getElementById('enemySprite').textContent = this.currentEnemy.sprite;
        
        this.inCombat = true;
        this.addLog(`⚔️ A wild ${this.currentEnemy.name} appears!`);
        
        // Animasi
        document.getElementById('enemyChar').classList.add('glow');
    }
    
    attack() {
        if (!this.inCombat || !this.currentEnemy) {
            this.addLog('No enemy to attack!');
            return;
        }
        
        // Player attack
        const playerDamage = Math.max(1, this.player.attack - this.currentEnemy.defense + Math.floor(Math.random() * 5));
        this.currentEnemy.hp -= playerDamage;
        
        // Animasi
        document.getElementById('playerChar').classList.add('shake');
        setTimeout(() => document.getElementById('playerChar').classList.remove('shake'), 200);
        
        this.addLog(`⚔️ You deal ${playerDamage} damage!`);
        
        if (this.currentEnemy.hp <= 0) {
            this.defeatEnemy();
            return;
        }
        
        // Enemy counter attack
        setTimeout(() => this.enemyAttack(), 500);
    }
    
    enemyAttack() {
        if (!this.currentEnemy) return;
        
        const enemyDamage = Math.max(1, this.currentEnemy.attack - this.player.defense + Math.floor(Math.random() * 3));
        this.player.hp -= enemyDamage;
        
        // Animasi
        document.getElementById('enemyChar').classList.add('shake');
        setTimeout(() => document.getElementById('enemyChar').classList.remove('shake'), 200);
        
        this.addLog(`💥 ${this.currentEnemy.name} deals ${enemyDamage} damage!`);
        
        if (this.player.hp <= 0) {
            this.gameOver();
            return;
        }
        
        this.updateUI();
    }
    
    defeatEnemy() {
        this.addLog(`✨ You defeated the ${this.currentEnemy.name}!`);
        
        // Reward
        const expGain = this.currentEnemy.exp;
        const goldGain = this.currentEnemy.gold;
        
        this.player.exp += expGain;
        this.player.gold += goldGain;
        
        this.addLog(`+${expGain} EXP, +${goldGain} GOLD`);
        
        // Check level up
        this.checkLevelUp();
        
        // Quest progress
        if (this.currentEnemy.name === 'Goblin King') {
            this.completeQuest();
        }
        
        this.inCombat = false;
        this.currentEnemy = null;
        document.getElementById('enemyName').textContent = '???';
        document.getElementById('enemySprite').textContent = '👾';
        document.getElementById('enemyChar').classList.remove('glow');
        
        this.updateUI();
        
        // Random drop
        if (Math.random() < 0.3) {
            this.player.inventory.potion++;
            this.addLog('🍷 You found a Potion!');
        }
    }
    
    castSpell(spell) {
        if (!this.inCombat || !this.currentEnemy) {
            this.addLog('No enemy to target!');
            this.toggleMagicMenu();
            return;
        }
        
        const spells = {
            fire: { cost: 5, damage: 20, name: '🔥 Fire' },
            ice: { cost: 5, damage: 18, name: '❄️ Ice' },
            heal: { cost: 8, heal: 25, name: '💚 Heal' },
            thunder: { cost: 10, damage: 30, name: '⚡ Thunder' }
        };
        
        const spellData = spells[spell];
        
        if (this.player.mp < spellData.cost) {
            this.addLog('Not enough MP!');
            this.toggleMagicMenu();
            return;
        }
        
        this.player.mp -= spellData.cost;
        
        if (spellData.damage) {
            // Damage spell
            const damage = spellData.damage + Math.floor(Math.random() * 10);
            this.currentEnemy.hp -= damage;
            this.addLog(`✨ ${spellData.name} deals ${damage} damage!`);
            
            if (this.currentEnemy.hp <= 0) {
                this.defeatEnemy();
                this.toggleMagicMenu();
                return;
            }
        } else if (spellData.heal) {
            // Heal spell
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + spellData.heal);
            this.addLog(`💚 You heal for ${spellData.heal} HP!`);
        }
        
        this.updateUI();
        this.toggleMagicMenu();
        
        // Enemy counter attack
        setTimeout(() => this.enemyAttack(), 500);
    }
    
    useItem() {
        if (!this.inCombat) {
            this.addLog('Not in combat!');
            return;
        }
        
        if (this.player.inventory.potion <= 0) {
            this.addLog('No potions left!');
            return;
        }
        
        this.player.inventory.potion--;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
        this.addLog('🧪 You used a Potion! (+30 HP)');
        
        this.updateUI();
        
        // Enemy still attacks
        setTimeout(() => this.enemyAttack(), 500);
    }
    
    flee() {
        if (!this.inCombat) {
            this.addLog('Not in combat!');
            return;
        }
        
        if (Math.random() < 0.5) {
            this.addLog('🏃 You fled successfully!');
            this.inCombat = false;
            this.currentEnemy = null;
            document.getElementById('enemyName').textContent = '???';
            document.getElementById('enemySprite').textContent = '👾';
        } else {
            this.addLog('❌ Could not flee!');
            setTimeout(() => this.enemyAttack(), 500);
        }
    }
    
    rest() {
        if (this.inCombat) {
            this.addLog('Cannot rest in combat!');
            return;
        }
        
        const healAmount = 10;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + 5);
        
        this.addLog(`🛌 You rest. +${healAmount} HP, +5 MP`);
        this.updateUI();
    }
    
    // RANDOM ENCOUNTER
    randomEncounter() {
        if (this.inCombat) return;
        
        const encounterRate = 0.3; // 30% chance
        if (Math.random() < encounterRate) {
            const enemyTypes = ['slime', 'goblin', 'wolf'];
            if (this.player.level >= 3) enemyTypes.push('orc');
            
            const randomEnemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            this.spawnEnemy(randomEnemy);
        }
    }
    
    // LEVEL SYSTEM
    checkLevelUp() {
        while (this.player.exp >= this.player.expToNext) {
            this.player.level++;
            this.player.exp -= this.player.expToNext;
            this.player.expToNext = Math.floor(this.player.expToNext * 1.5);
            
            // Stat increases
            this.player.maxHp += 10;
            this.player.hp = this.player.maxHp;
            this.player.maxMp += 5;
            this.player.mp = this.player.maxMp;
            this.player.attack += 3;
            this.player.defense += 2;
            this.player.magic += 2;
            
            this.addLog(`🎉 LEVEL UP! You are now level ${this.player.level}!`);
        }
    }
    
    // QUEST SYSTEM
    completeQuest() {
        this.addLog('🎊 QUEST COMPLETE! You defeated the Goblin King!');
        this.addLog('Reward: 500 Gold, Elixir');
        
        this.player.gold += 500;
        this.player.inventory.elixir = (this.player.inventory.elixir || 0) + 1;
        
        // New quest
        this.quests.current = 'Slay the Dragon';
        this.quests.goal = 1;
        document.getElementById('questText').textContent = this.quests.current;
        
        this.updateUI();
    }
    
    // GAME OVER
    gameOver() {
        this.addLog('💀 GAME OVER! You have been defeated...');
        this.addLog('Restarting...');
        
        // Reset player
        this.player = {
            ...this.player,
            hp: this.player.maxHp,
            mp: this.player.maxMp
        };
        
        this.inCombat = false;
        this.currentEnemy = null;
        this.updateUI();
    }
    
    // SHOP SYSTEM
    toggleShop() {
        const shopMenu = document.getElementById('shopMenu');
        shopMenu.style.display = shopMenu.style.display === 'none' ? 'block' : 'none';
    }
    
    toggleMagicMenu() {
        const magicMenu = document.getElementById('magicMenu');
        magicMenu.style.display = magicMenu.style.display === 'none' ? 'block' : 'none';
    }
    
    buyItem(item) {
        const prices = {
            potion: 50,
            ether: 80,
            sword: 200,
            armor: 300
        };
        
        if (this.player.gold < prices[item]) {
            this.addLog('Not enough gold!');
            return;
        }
        
        this.player.gold -= prices[item];
        
        switch(item) {
            case 'potion':
                this.player.inventory.potion++;
                this.addLog('Bought Potion!');
                break;
            case 'ether':
                this.player.inventory.ether++;
                this.addLog('Bought Ether!');
                break;
            case 'sword':
                this.player.weapon = 'Steel Sword';
                this.player.attack += 10;
                this.addLog('Bought Steel Sword! (+10 ATK)');
                break;
            case 'armor':
                this.player.armor = 'Chain Mail';
                this.player.defense += 8;
                this.addLog('Bought Chain Mail! (+8 DEF)');
                break;
        }
        
        this.updateUI();
        document.getElementById('shopGold').textContent = this.player.gold;
    }
}

// START THE GAME
window.onload = () => {
    const game = new GameEngine();
};