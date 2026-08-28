import { createHomura, LocalStorageAdapter } from '@homurajs/core';
import { mountDevTools } from '@homurajs/devtools';

export interface RPGItem {
  id: string;
  name: string;
  type: 'consumable' | 'weapon' | 'armor';
  qty: number;
  effect: string;
  price: number;
}

export interface RPGState {
  player: {
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    exp: number;
    maxExp: number;
    gold: number;
  };
  equipment: {
    weapon: RPGItem | null;
    armor: RPGItem | null;
  };
  inventory: RPGItem[];
}

const initialState: RPGState = {
  player: {
    name: 'Homura',
    level: 5,
    hp: 80,
    maxHp: 100,
    mp: 45,
    maxMp: 50,
    exp: 340,
    maxExp: 500,
    gold: 1250
  },
  equipment: {
    weapon: {
      id: 'item-rune-sword',
      name: 'Rune Sword',
      type: 'weapon',
      qty: 1,
      effect: '+15 ATK',
      price: 300
    },
    armor: null
  },
  inventory: [
    { id: 'item-potion', name: 'Health Potion', type: 'consumable', qty: 3, effect: '+30 HP', price: 50 },
    { id: 'item-ether', name: 'Ether Crystal', type: 'consumable', qty: 2, effect: '+25 MP', price: 80 },
    { id: 'item-iron-sword', name: 'Iron Broadsword', type: 'weapon', qty: 1, effect: '+10 ATK', price: 150 }
  ]
};

// Create Homura State Instance
const homura = createHomura<RPGState>({
  initialState,
  maxHistory: 200,
  enableBranches: true,
  autoBranchOnDivergence: true,
  persistence: new LocalStorageAdapter('homura_rpg_demo_state')
});

// Mount DevTools in the embedded bottom container AND enable floating launcher toggle
mountDevTools(homura, {
  container: '#devtools-mount',
  position: 'embedded',
  title: 'HOMURA DEVTOOLS'
});

// UI elements
const hpVal = document.getElementById('hp-val')!;
const hpBar = document.getElementById('hp-bar')!;
const mpVal = document.getElementById('mp-val')!;
const mpBar = document.getElementById('mp-bar')!;
const expVal = document.getElementById('exp-val')!;
const expBar = document.getElementById('exp-bar')!;
const goldVal = document.getElementById('gold-val')!;
const heroLevel = document.getElementById('hero-level')!;
const equipWeaponName = document.getElementById('equip-weapon-name')!;
const equipArmorName = document.getElementById('equip-armor-name')!;
const invContainer = document.getElementById('inventory-container')!;
const invCount = document.getElementById('inv-count')!;
const hudStatus = document.getElementById('hud-status')!;
const hudBranch = document.getElementById('hud-branch')!;

function renderUI(): void {
  const state = homura.getState();
  const currentEntry = homura.getCurrentEntry();
  const currentBranch = homura.getCurrentBranch();

  // Player Stats
  hpVal.textContent = `${state.player.hp} / ${state.player.maxHp}`;
  hpBar.style.width = `${Math.max(0, (state.player.hp / state.player.maxHp) * 100)}%`;

  mpVal.textContent = `${state.player.mp} / ${state.player.maxMp}`;
  mpBar.style.width = `${Math.max(0, (state.player.mp / state.player.maxMp) * 100)}%`;

  expVal.textContent = `${state.player.exp} / ${state.player.maxExp}`;
  expBar.style.width = `${Math.max(0, (state.player.exp / state.player.maxExp) * 100)}%`;

  goldVal.textContent = `${state.player.gold} G`;
  heroLevel.textContent = `Lv. ${state.player.level}`;

  // Equipment
  if (state.equipment.weapon) {
    equipWeaponName.textContent = `${state.equipment.weapon.name} (${state.equipment.weapon.effect})`;
    document.getElementById('slot-weapon')?.classList.add('equipped');
    document.getElementById('btn-unequip-weapon')!.style.display = 'inline-flex';
  } else {
    equipWeaponName.textContent = '(Empty)';
    document.getElementById('slot-weapon')?.classList.remove('equipped');
    document.getElementById('btn-unequip-weapon')!.style.display = 'none';
  }

  if (state.equipment.armor) {
    equipArmorName.textContent = `${state.equipment.armor.name} (${state.equipment.armor.effect})`;
    document.getElementById('slot-armor')?.classList.add('equipped');
    document.getElementById('btn-unequip-armor')!.style.display = 'inline-flex';
  } else {
    equipArmorName.textContent = '(Empty)';
    document.getElementById('slot-armor')?.classList.remove('equipped');
    document.getElementById('btn-unequip-armor')!.style.display = 'none';
  }

  // Inventory
  invContainer.innerHTML = '';
  invCount.textContent = `${state.inventory.length} item types`;

  state.inventory.forEach(item => {
    const card = document.createElement('div');
    card.className = 'inv-item-card';

    let actionBtnText = 'Use';
    if (item.type === 'weapon' || item.type === 'armor') {
      actionBtnText = 'Equip';
    }

    card.innerHTML = `
      <div class="inv-item-name">${item.name}</div>
      <div class="inv-item-qty">x${item.qty} • ${item.effect}</div>
      <div style="display: flex; gap: 4px; margin-top: 6px;">
        <button class="btn btn-use" style="padding: 3px 8px; font-size: 10px; flex: 1;">${actionBtnText}</button>
        <button class="btn btn-sell" style="padding: 3px 6px; font-size: 10px; color: var(--gold);" title="Sell item for ${Math.floor(item.price / 2)}G">Sell</button>
      </div>
    `;

    card.querySelector('.btn-use')?.addEventListener('click', () => {
      if (item.type === 'consumable') {
        if (item.name.includes('Health') || item.name.includes('Potion')) {
          homura.update(d => {
            d.player.hp = Math.min(d.player.maxHp, d.player.hp + 30);
            const invItem = d.inventory.find(i => i.id === item.id);
            if (invItem) {
              invItem.qty--;
              if (invItem.qty <= 0) {
                d.inventory = d.inventory.filter(i => i.id !== item.id);
              }
            }
          }, { label: `Used ${item.name}` });
        } else if (item.name.includes('Ether')) {
          homura.update(d => {
            d.player.mp = Math.min(d.player.maxMp, d.player.mp + 25);
            const invItem = d.inventory.find(i => i.id === item.id);
            if (invItem) {
              invItem.qty--;
              if (invItem.qty <= 0) {
                d.inventory = d.inventory.filter(i => i.id !== item.id);
              }
            }
          }, { label: `Used ${item.name}` });
        }
      } else if (item.type === 'weapon') {
        homura.update(d => {
          const prevWeapon = d.equipment.weapon;
          d.equipment.weapon = item;
          d.inventory = d.inventory.filter(i => i.id !== item.id);
          if (prevWeapon) {
            d.inventory.push(prevWeapon);
          }
        }, { label: `Equipped ${item.name}` });
      } else if (item.type === 'armor') {
        homura.update(d => {
          const prevArmor = d.equipment.armor;
          d.equipment.armor = item;
          d.inventory = d.inventory.filter(i => i.id !== item.id);
          if (prevArmor) {
            d.inventory.push(prevArmor);
          }
        }, { label: `Equipped ${item.name}` });
      }
    });

    card.querySelector('.btn-sell')?.addEventListener('click', () => {
      const sellPrice = Math.floor(item.price / 2);
      homura.update(d => {
        d.player.gold += sellPrice;
        const invItem = d.inventory.find(i => i.id === item.id);
        if (invItem) {
          invItem.qty--;
          if (invItem.qty <= 0) {
            d.inventory = d.inventory.filter(i => i.id !== item.id);
          }
        }
      }, { label: `Sold ${item.name} (+${sellPrice}G)` });
    });

    invContainer.appendChild(card);
  });

  // HUD
  hudStatus.textContent = `Current: "${currentEntry.label}"`;
  hudBranch.textContent = currentBranch.name;
}

// Subscribe to state changes
homura.on('state:change', renderUI);
homura.on('branch:switch', renderUI);

// Initial render
renderUI();

// Hook HUD Controls
document.getElementById('hud-undo')?.addEventListener('click', () => homura.undo());
document.getElementById('hud-redo')?.addEventListener('click', () => homura.redo());
document.getElementById('hud-rewind-5')?.addEventListener('click', () => homura.rewind(5));
document.getElementById('hud-ff-5')?.addEventListener('click', () => homura.fastForward(5));
document.getElementById('hud-snapshot')?.addEventListener('click', () => {
  const name = prompt('Enter snapshot name:', `Milestone #${homura.getSnapshots().length + 1}`);
  if (name) homura.snapshot(name);
});

// Unequip buttons
document.getElementById('btn-unequip-weapon')?.addEventListener('click', () => {
  homura.update(d => {
    if (d.equipment.weapon) {
      const w = d.equipment.weapon;
      d.equipment.weapon = null;
      d.inventory.push(w);
    }
  }, { label: 'Unequipped Weapon' });
});

document.getElementById('btn-unequip-armor')?.addEventListener('click', () => {
  homura.update(d => {
    if (d.equipment.armor) {
      const a = d.equipment.armor;
      d.equipment.armor = null;
      d.inventory.push(a);
    }
  }, { label: 'Unequipped Armor' });
});

// Battle Actions
document.getElementById('action-damage')?.addEventListener('click', () => {
  homura.update(d => {
    d.player.hp = Math.max(0, d.player.hp - 25);
  }, { label: 'Hero took 25 damage' });
});

document.getElementById('action-heal')?.addEventListener('click', () => {
  homura.update(d => {
    d.player.hp = Math.min(d.player.maxHp, d.player.hp + 30);
  }, { label: 'Used healing magic (+30 HP)' });
});

document.getElementById('action-spell')?.addEventListener('click', () => {
  homura.update(d => {
    if (d.player.mp >= 15) {
      d.player.mp -= 15;
      d.player.exp += 80;
      if (d.player.exp >= d.player.maxExp) {
        d.player.level += 1;
        d.player.exp -= d.player.maxExp;
        d.player.maxHp += 20;
        d.player.hp = d.player.maxHp;
        d.player.maxMp += 10;
        d.player.mp = d.player.maxMp;
      }
    }
  }, { label: 'Cast Time-Stop Spell (-15 MP, +80 EXP)' });
});

document.getElementById('action-loot')?.addEventListener('click', () => {
  homura.update(d => {
    d.player.gold += 250;
  }, { label: 'Opened Dungeon Chest (+250G)' });
});

// Shop actions
document.getElementById('shop-buy-potion')?.addEventListener('click', () => {
  homura.update(d => {
    if (d.player.gold >= 50) {
      d.player.gold -= 50;
      const existing = d.inventory.find(i => i.id === 'item-potion');
      if (existing) {
        existing.qty++;
      } else {
        d.inventory.push({ id: 'item-potion', name: 'Health Potion', type: 'consumable', qty: 1, effect: '+30 HP', price: 50 });
      }
    }
  }, { label: 'Purchased Health Potion (-50G)' });
});

document.getElementById('shop-buy-ether')?.addEventListener('click', () => {
  homura.update(d => {
    if (d.player.gold >= 80) {
      d.player.gold -= 80;
      const existing = d.inventory.find(i => i.id === 'item-ether');
      if (existing) {
        existing.qty++;
      } else {
        d.inventory.push({ id: 'item-ether', name: 'Ether Crystal', type: 'consumable', qty: 1, effect: '+25 MP', price: 80 });
      }
    }
  }, { label: 'Purchased Ether Crystal (-80G)' });
});

document.getElementById('shop-buy-excalibur')?.addEventListener('click', () => {
  homura.update(d => {
    if (d.player.gold >= 500) {
      d.player.gold -= 500;
      d.inventory.push({
        id: `item-excalibur-${Date.now()}`,
        name: 'Excalibur Holy Blade',
        type: 'weapon',
        qty: 1,
        effect: '+50 ATK, Holy',
        price: 500
      });
    }
  }, { label: 'Purchased Holy Blade Excalibur (-500G)' });
});

document.getElementById('shop-buy-shield')?.addEventListener('click', () => {
  homura.update(d => {
    if (d.player.gold >= 350) {
      d.player.gold -= 350;
      d.inventory.push({
        id: `item-dragon-armor-${Date.now()}`,
        name: 'Dragon Scale Armor',
        type: 'armor',
        qty: 1,
        effect: '+30 DEF, Fire Res',
        price: 350
      });
    }
  }, { label: 'Purchased Dragon Scale Armor (-350G)' });
});
