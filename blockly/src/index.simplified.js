import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.simplified';

// Import Blockly
import * as Blockly from 'blockly';

// Import custom blocks
import './blocks/simulation_blocks';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);