import React, { useEffect, useState, useContext, useMemo } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import TransactionList from '../components/TransactionList';

export default function Transactions() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchPage(1); }, []);

  async function fetchPage(p) {
    try {
      const r = await api.get('/api/transactions', { params: { page: p, limit: 50 }});
      setItems(r.data.data);
      setPage(p);
    } catch (e) { console.error(e); }
  }

  const total = useMemo(() => items.reduce((s, it) => s + Number(it.amount || 0), 0), [items]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Transactions</h2>
      <div>Role: {user?.role}</div>
      <div style={{ marginTop: 10 }}>Total visible amount: {total}</div>
      <div style={{ height: 600, marginTop: 10 }}>
        <TransactionList items={items} />
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={()=>fetchPage(Math.max(1, page-1))}>Prev</button>
        <button onClick={()=>fetchPage(page+1)}>Next</button>
      </div>
    </div>
  );
}
