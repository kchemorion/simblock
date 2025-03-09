import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Import Blockly
import * as Blockly from 'blockly';

// Import custom blocks
import './blocks/simulation_blocks';
import './blocks/data_blocks';
import './blocks/analysis_blocks';
import './blocks/workflow_blocks';
import './blocks/infrastructure_blocks';

// Import code generators
import './generators/python_airflow';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);