import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import CategoryPie from '../charts/CategoryPie';
import { AuthContext } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/api/analytics').then(r => { if (mounted) setAnalytics(r.data); }).catch(()=>{});
    return () => { mounted = false; };
  }, []);

  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <div>Welcome, {user?.name || user?.email} — role: {user?.role}</div>
      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        <div style={{ width: 400 }}>
          <h3>Category (expense) distribution</h3>
          <CategoryPie data={analytics.categories || []} />
        </div>
        <div>
          <h3>Monthly trends (last 12 months)</h3>
          <pre style={{ width: 400, height: 200, overflow: 'auto' }}>{JSON.stringify(analytics.monthly, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
