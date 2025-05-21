import React, { useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout.jsx';
import { init } from './dashboard.js';

export default function App() {
  useEffect(() => {
    init();
  }, []);

  return (
    <DashboardLayout />
  );
}
