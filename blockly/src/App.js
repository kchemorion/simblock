import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { pythonGenerator } from 'blockly/python';
import './App.css';

// Initialize global SimBlockFlow object to store shared application state
window.SimBlockFlow = window.SimBlockFlow || {
  connections: [
    { 
      conn_id: 'hpc_cluster', 
      conn_type: 'ssh', 
      description: 'Connection to HPC cluster',
      host: 'hpc.example.org', 
      port: 22 
    },
    { 
      conn_id: 'aws_default', 
      conn_type: 'aws', 
      description: 'AWS account credentials',
      extra: { region: 'us-west-2' } 
    },
    { 
      conn_id: 'postgres_db', 
      conn_type: 'postgres', 
      description: 'Database for simulation results',
      host: 'db.example.org', 
      port: 5432 
    }
  ]
};

// Import components
import BlocklyWorkspace from './components/BlocklyWorkspace';
import Toolbar from './components/Toolbar';
import CodeView from './components/CodeView';
import ControlPanel from './components/ControlPanel';
import DocumentationBrowser from './components/DocumentationBrowser';
import TemplatesBrowser from './components/TemplatesBrowser';

// Import custom blocks
import './blocks/simulation_blocks';
import './blocks/data_blocks';
import './blocks/analysis_blocks';
import './blocks/workflow_blocks';
import './blocks/infrastructure_blocks';

// Import code generators
import './generators/python_airflow';

function App() {
  const [workspace, setWorkspace] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('code');
  const [blockCount, setBlockCount] = useState(0);
  const [workflowName, setWorkflowName] = useState('simblockflow_workflow');
  const [lastSaved, setLastSaved] = useState(null);
  
  // Monitor workspace changes
  useEffect(() => {
    if (!workspace) return;
    
    const updateBlockCount = () => {
      const count = workspace.getAllBlocks(false).length;
      setBlockCount(count);
    };
    
    workspace.addChangeListener(updateBlockCount);
    
    // Auto-save functionality
    const autoSaveInterval = setInterval(() => {
      if (workspace.getAllBlocks(false).length > 0) {
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const xmlText = Blockly.Xml.domToText(xml);
        localStorage.setItem('simblockflow_autosave', xmlText);
        setLastSaved(new Date());
        // Show autosave message in console
        console.log('Workflow auto-saved at', new Date().toLocaleTimeString());
      }
    }, 30000); // Save every 30 seconds
    
    return () => {
      workspace.removeChangeListener(updateBlockCount);
      clearInterval(autoSaveInterval);
    };
  }, [workspace]);
  
  // Load auto-saved workflow on startup
  useEffect(() => {
    if (!workspace) return;
    
    const savedWorkflow = localStorage.getItem('simblockflow_autosave');
    if (savedWorkflow) {
      try {
        const xml = Blockly.utils.xml.textToDom(savedWorkflow);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);
        console.log('Restored your last session');
      } catch (err) {
        console.error('Failed to load auto-saved workflow:', err);
      }
    }
  }, [workspace]);

  // Generate Airflow DAG code from workspace
  const generateCode = () => {
    if (!workspace) return;
    
    try {
      // Get the Python code from Blockly
      const code = pythonGenerator.workspaceToCode(workspace);
      
      console.log('Code generated successfully!');
      
      // Wrap in Airflow DAG template with all required imports
      const dagCode = `
###############################################################################
# SimBlockFlow Generated DAG
# Generated on: ${new Date().toISOString()}
###############################################################################

from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from airflow.utils.task_group import TaskGroup
from airflow.providers.ssh.operators.ssh import SSHOperator
from airflow.providers.amazon.aws.operators.emr import EmrAddStepsOperator
from airflow.providers.google.cloud.operators.dataproc import DataprocSubmitJobOperator
from airflow.providers.microsoft.azure.operators.azure_batch import AzureBatchOperator
from airflow.sensors.external_task import ExternalTaskSensor
from airflow.providers.http.sensors.http import HttpSensor
from airflow.providers.filesystem.sensors.file import FileSensor
from airflow.models.baseoperator import chain, cross_downstream
from airflow.exceptions import AirflowSkipException, AirflowFailException

import os
import sys
import json
import yaml
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# Define default arguments for the DAG
default_args = {
    'owner': 'simblock',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'execution_timeout': timedelta(hours=24),
}

# Define the DAG
with DAG(
    'simblock_workflow',
    default_args=default_args,
    description='An Airflow DAG generated from SimBlock',
    schedule_interval=None,
    start_date=datetime(2023, 1, 1),
    catchup=False,
    tags=['simblock', 'generated'],
    max_active_runs=1,
    concurrency=10,
) as dag:
    # Initialize common hooks and variables
    try:
        from airflow.hooks.base_hook import BaseHook
        # Set up connection hooks for different services
        # Uncomment and configure as needed
        
        # hpc_ssh_hook = BaseHook.get_connection('hpc_cluster')
        # aws_conn = BaseHook.get_connection('aws_default')
        # gcp_conn = BaseHook.get_connection('google_cloud_default')
        # azure_conn = BaseHook.get_connection('azure_batch_default')
    except Exception as e:
        print(f"Warning: Could not initialize connection hooks: {e}")
        pass

    # DAG documentation
    dag.doc_md = """
    # SimBlock Generated Workflow
    
    This DAG was automatically generated using SimBlock - a pattern-based 
    scientific workflow design tool.
    
    ## Workflow Structure
    
    This workflow implements a scientific computation pipeline with the 
    following main components:
    
    1. Data preparation and transfer
    2. Simulation execution
    3. Result analysis and visualization
    
    ## Execution Instructions
    
    Ensure that all required input data and configuration files are 
    available before triggering this DAG.
    """
    
    # Start and end markers
    start_task = BashOperator(
        task_id='start_workflow',
        bash_command='echo "Starting workflow execution at $(date)"',
        dag=dag,
    )
    
    end_task = BashOperator(
        task_id='end_workflow',
        bash_command='echo "Workflow completed at $(date)"',
        dag=dag,
    )
    
    # Generated tasks
${code}
    
    # Set up overall workflow structure
    start_task >> end_task
      `;
      
      setGeneratedCode(dagCode);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Handle workflow name change
  const handleWorkflowNameChange = (e) => {
    const newName = e.target.value.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    setWorkflowName(newName || 'simblockflow_workflow');
  };

  // Clear the workspace with confirmation
  const newWorkflow = () => {
    if (workspace) {
      if (workspace.getAllBlocks(false).length > 0) {
        if (window.confirm('Are you sure you want to create a new workflow? Unsaved changes will be lost.')) {
          workspace.clear();
          setGeneratedCode('');
          setError(null);
          setWorkflowName('simblockflow_workflow');
          console.log('Created new workflow');
        }
      } else {
        workspace.clear();
        setGeneratedCode('');
        setError(null);
      }
    }
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
    a.download = `${workflowName}.xml`;
    a.click();
    
    console.log('Workflow exported successfully!');
  };
  
  // Import a workflow from XML
  const importWorkflow = (event) => {
    if (!workspace || !event.target.files.length) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    // Extract workflow name from filename
    const filename = file.name;
    const workflowNameFromFile = filename.replace('.xml', '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    if (workflowNameFromFile) {
      setWorkflowName(workflowNameFromFile);
    }
    
    reader.onload = (e) => {
      try {
        const xml = Blockly.utils.xml.textToDom(e.target.result);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);
        console.log('Workflow imported successfully!');
      } catch (err) {
        setError('Failed to import workflow: ' + err.message);
        console.error('Failed to import workflow', err.message);
      }
    };
    
    reader.readAsText(file);
  };
  
  // Deploy DAG to Airflow
  const deployDag = async () => {
    if (!generatedCode) {
      alert('No code to deploy. Generate code first.');
      return;
    }
    
    console.log('Deploying workflow to Airflow...');
    
    try {
      const response = await fetch('http://localhost:5000/api/deploy-dag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dag_code: generatedCode,
          dag_name: `${workflowName}.py`
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('DAG deployed successfully!');
        alert('DAG deployed successfully!');
        
        // Activate the control panel tab to monitor execution
        setActiveTab('control');
      } else {
        console.error(`Failed to deploy: ${data.error}`);
        alert(`Failed to deploy: ${data.error}`);
        setError('Failed to deploy DAG: ' + data.error);
      }
    } catch (err) {
      console.error('Error connecting to Airflow API', err);
      alert('Error connecting to Airflow API: ' + err.message);
      setError('Error connecting to Airflow API: ' + err.message);
    }
  };

  return (
    <div className="app">
      
      <header className="app-header">
        <div className="app-branding">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4h24v24H4z" fill="#2c3e50"/>
              <path d="M8 8h4v4H8zM16 8h4v4h-4zM8 16h4v4H8zM16 16h4v4h-4zM16 24h4v4h-4zM24 16h4v4h-4z" fill="#ecf0f1"/>
              <path d="M12 8h2v16h-2zM20 8h2v20h-2zM8 12h16v2H8zM8 20h20v2H8z" fill="#3498db"/>
            </svg>
          </div>
          <h1>SimBlockFlow</h1>
          <span className="app-subtitle">Pattern-Based Simulation Workflow Designer</span>
        </div>
        
        <div className="workflow-name-container">
          <input 
            type="text" 
            value={workflowName}
            onChange={handleWorkflowNameChange}
            className="workflow-name-input"
            title="Workflow name (will be used for filenames)"
          />
          {blockCount > 0 && (
            <span className="block-count" title="Number of blocks in workflow">
              {blockCount} {blockCount === 1 ? 'block' : 'blocks'}
            </span>
          )}
          {lastSaved && (
            <span className="last-saved" title="Last auto-saved time">
              Auto-saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        
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
        <div className="right-panel">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
            <button 
              className={`tab ${activeTab === 'control' ? 'active' : ''}`}
              onClick={() => setActiveTab('control')}
            >
              Control Panel
            </button>
            <button 
              className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
            <button 
              className={`tab ${activeTab === 'docs' ? 'active' : ''}`}
              onClick={() => setActiveTab('docs')}
            >
              Documentation
            </button>
          </div>
          
          <div className={`tab-content ${activeTab === 'code' ? 'active' : ''}`}>
            <CodeView 
              code={generatedCode} 
              error={error} 
              onDeploy={deployDag}
            />
          </div>
          
          <div className={`tab-content ${activeTab === 'control' ? 'active' : ''}`}>
            <ControlPanel dagCode={generatedCode} />
          </div>
          
          <div className={`tab-content ${activeTab === 'templates' ? 'active' : ''}`}>
            <TemplatesBrowser workspace={workspace} />
          </div>
          
          <div className={`tab-content ${activeTab === 'docs' ? 'active' : ''}`}>
            <DocumentationBrowser />
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <strong>SimBlockFlow</strong> - Pattern-Based Simulation Workflow Designer
          </div>
          <div className="footer-links">
            <a href="#documentation">Documentation</a>
            <a href="#tutorials">Tutorials</a>
            <a href="#github">GitHub</a>
            <a href="#community">Community</a>
          </div>
          <div className="footer-version">
            Version 1.0.0 • © 2025
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;