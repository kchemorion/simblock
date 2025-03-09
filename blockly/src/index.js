import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Import Blockly library
import * as Blockly from 'blockly';

// Import custom blocks - Note: We're using guard patterns to protect against issues
try {
  console.log('Loading simulation blocks...');
  require('./blocks/simulation_blocks.minimal.js');
  
  console.log('Loading data blocks...');
  require('./blocks/data_blocks');
  
  console.log('Loading analysis blocks...');
  require('./blocks/analysis_blocks');
  
  console.log('Loading workflow blocks...');
  require('./blocks/workflow_blocks');
  
  console.log('Loading infrastructure blocks...');
  require('./blocks/infrastructure_blocks');
  
  console.log('Loading generators...');
  require('./generators/python_airflow');
  
  console.log('All blocks loaded successfully');
} catch (error) {
  console.error('Error loading blocks:', error);
}

// Create the React root and render the App
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
  
  // Try to display a helpful error message on the page
  const errorDiv = document.createElement('div');
  errorDiv.style.padding = '20px';
  errorDiv.style.backgroundColor = '#ffebee';
  errorDiv.style.color = '#b71c1c';
  errorDiv.style.fontFamily = 'sans-serif';
  errorDiv.innerHTML = `<h1>Something went wrong</h1><p>${error.message}</p><p>Check the console for more details.</p>`;
  document.body.appendChild(errorDiv);
}