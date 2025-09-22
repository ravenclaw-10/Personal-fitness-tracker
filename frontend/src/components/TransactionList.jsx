import React from 'react';
import { FixedSizeList as List } from 'react-window';

export default function TransactionList({ items }) {
  const Row = ({ index, style }) => {
    const it = items[index];
    return (
      <div style={{ ...style, padding: '8px 12px', borderBottom: '1px solid #eee' }}>
        <div><strong>{it.type}</strong> — {it.description || '-'} — ₹{it.amount}</div>
        <div style={{ fontSize: 12, color: '#666' }}>{it.occurred_at} • category: {it.category_id}</div>
      </div>
    );
  };

  return (
    <List height={600} itemCount={items.length} itemSize={72} width={'100%'}>
      {Row}
    </List>
  );
}
