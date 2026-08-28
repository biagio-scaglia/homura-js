import { createHomura } from '@homurajs/core';
import { useHomura, HomuraDevTools } from '@homurajs/react';

interface CartState {
  cart: { id: string; name: string; price: number; qty: number }[];
  budget: number;
}

const homura = createHomura<CartState>({
  initialState: {
    cart: [{ id: '1', name: 'Legendary Sword', price: 250, qty: 1 }],
    budget: 1000
  }
});

export function App() {
  const { state, update, undo, redo, canUndo, canRedo, currentEntry, snapshot } = useHomura(homura);

  const addItem = (name: string, price: number) => {
    update(d => {
      if (d.budget >= price) {
        d.budget -= price;
        const existing = d.cart.find(i => i.name === name);
        if (existing) {
          existing.qty++;
        } else {
          d.cart.push({ id: String(Date.now()), name, price, qty: 1 });
        }
      }
    }, { label: `Bought ${name} (-${price}G)` });
  };

  const removeItem = (id: string) => {
    update(d => {
      const item = d.cart.find(i => i.id === id);
      if (item) {
        d.budget += item.price;
        item.qty--;
        if (item.qty <= 0) {
          d.cart = d.cart.filter(i => i.id !== id);
        }
      }
    }, { label: `Sold Item` });
  };

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '24px', background: '#161b22', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h1 style={{ color: '#ff4757', margin: '0 0 16px 0' }}>HomuraJS + React 18</h1>
      <p style={{ color: '#94a3b8', fontSize: '13px' }}>Current State History: <b>{currentEntry.label}</b></p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
        <span style={{ fontSize: '18px', fontWeight: 700 }}>Budget: <span style={{ color: '#ffd32a' }}>{state.budget} G</span></span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button disabled={!canUndo} onClick={() => undo()} style={{ padding: '6px 12px', cursor: canUndo ? 'pointer' : 'not-allowed', borderRadius: '4px', background: '#ff4757', color: '#fff', border: 'none', fontWeight: 600 }}>Undo</button>
          <button disabled={!canRedo} onClick={() => redo()} style={{ padding: '6px 12px', cursor: canRedo ? 'pointer' : 'not-allowed', borderRadius: '4px', background: '#30363d', color: '#fff', border: 'none', fontWeight: 600 }}>Redo</button>
          <button onClick={() => snapshot('React Snapshot')} style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', background: '#a855f7', color: '#fff', border: 'none', fontWeight: 600 }}>Snapshot</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => addItem('Health Potion', 50)} style={{ padding: '8px 12px', background: '#21262d', color: '#fff', border: '1px solid #30363d', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Potion (50G)</button>
        <button onClick={() => addItem('Dragon Shield', 200)} style={{ padding: '8px 12px', background: '#21262d', color: '#fff', border: '1px solid #30363d', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Shield (200G)</button>
        <button onClick={() => addItem('Magic Ring', 120)} style={{ padding: '8px 12px', background: '#21262d', color: '#fff', border: '1px solid #30363d', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Ring (120G)</button>
      </div>

      <h3>Cart ({state.cart.length} items)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {state.cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#21262d', borderRadius: '6px' }}>
            <span><b>{item.name}</b> x{item.qty} ({item.price * item.qty}G)</span>
            <button onClick={() => removeItem(item.id)} style={{ padding: '4px 8px', background: '#ff4757', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sell</button>
          </div>
        ))}
      </div>

      <HomuraDevTools homura={homura} position="floating" defaultOpen={true} />
    </div>
  );
}
