import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPie({ data }) {
  const labels = (data || []).map(d => d.category || 'Uncategorized');
  const values = (data || []).map(d => Number(d.total || 0));
  const chartData = { labels, datasets: [{ data: values }] };
  return <Pie data={chartData} />;
}
