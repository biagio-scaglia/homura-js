import { createHomura, bindState, mountDevTools } from '@homurajs/vanilla';

interface State {
  count: number;
  user: { name: string };
}

const homura = createHomura<State>({
  initialState: {
    count: 0,
    user: { name: 'Mario' }
  }
});

// Bind state directly to DOM
bindState(homura, [
  { selector: s => s.count, target: '#count-display' },
  { selector: s => s.user.name, target: '#user-display' }
]);

// Mount floating DevTools
mountDevTools(homura, {
  position: 'floating',
  defaultOpen: true
});

// Event listeners
document.getElementById('btn-inc')?.addEventListener('click', () => {
  homura.update(d => {
    d.count += 1;
  }, { label: 'Increment' });
});

document.getElementById('btn-dec')?.addEventListener('click', () => {
  homura.update(d => {
    d.count -= 1;
  }, { label: 'Decrement' });
});

const names = ['Mario', 'Luigi', 'Peach', 'Bowser', 'Yoshi'];
let nameIdx = 0;
document.getElementById('btn-user')?.addEventListener('click', () => {
  nameIdx = (nameIdx + 1) % names.length;
  homura.update(d => {
    d.user.name = names[nameIdx]!;
  }, { label: `User -> ${names[nameIdx]}` });
});

document.getElementById('btn-undo')?.addEventListener('click', () => homura.undo());
document.getElementById('btn-redo')?.addEventListener('click', () => homura.redo());
