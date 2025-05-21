import React, { useEffect } from 'react';
import htmlContent from './htmlContent.js';
import { init } from './dashboard.js';

export default function App() {
  useEffect(() => {
    init();
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
