import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { pythonGenerator } from 'blockly/python';
import './App.css';

// Import components
import BlocklyWorkspace from './components/BlocklyWorkspace';
import Toolbar from './components/Toolbar';
import CodeView from './components/CodeView';

// Import custom blocks
import './blocks/simulation_blocks';
import './blocks/data_blocks';
import './blocks/analysis_blocks';

// Import code generators
import './generators/python_airflow';

function App() {
  const [workspace, setWorkspace] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState(null);
  
  // Generate Airflow DAG code from workspace
  const generateCode = () => {
    if (!workspace) return;
    
    try {
      // Get the Python code from Blockly
      const code = pythonGenerator.workspaceToCode(workspace);
      
      // Wrap in Airflow DAG template
      const dagCode = `
from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

# Define default arguments for the DAG
default_args = {
    'owner': 'simblock',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# Define the DAG
with DAG(
    'simblock_workflow',
    default_args=default_args,
    description='An Airflow DAG generated from SimBlock',
    schedule_interval=None,
    start_date=datetime(2023, 1, 1),
    catchup=False,
) as dag:
    # Tasks are defined below
${code}
      `;
      
      setGeneratedCode(dagCode);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Clear the workspace
  const newWorkflow = () => {
    if (workspace) {
      workspace.clear();
    }
    setGeneratedCode('');
    setError(null);
  };
  
  // Export the workflow as XML
  const exportWorkflow = () => {
    if (!workspace) return;
    
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    
    // Create a download link
    const blob = new Blob([xmlText], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.xml';
    a.click();
  };
  
  // Import a workflow from XML
  const importWorkflow = (event) => {
    if (!workspace || !event.target.files.length) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const xml = Blockly.utils.xml.textToDom(e.target.result);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);
      } catch (err) {
        setError('Failed to import workflow: ' + err.message);
      }
    };
    
    reader.readAsText(file);
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>SimBlock - Scientific Workflow Designer</h1>
        <Toolbar 
          onNew={newWorkflow} 
          onGenerate={generateCode} 
          onExport={exportWorkflow} 
          onImport={importWorkflow} 
        />
      </header>
      
      <main className="app-main">
        <div className="workspace-container">
          <BlocklyWorkspace setWorkspace={setWorkspace} />
        </div>
        <div className="code-container">
          <CodeView code={generatedCode} error={error} />
        </div>
      </main>
      
      <footer className="app-footer">
        <p>SimBlock - Pattern-Based Scientific Workflow Design</p>
      </footer>
    </div>
  );
}

export default App;