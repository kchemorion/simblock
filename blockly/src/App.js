import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { pythonGenerator } from 'blockly/python';
import './App.css';

// Import components
import BlocklyWorkspace from './components/BlocklyWorkspace';
import Toolbar from './components/Toolbar';
import CodeView from './components/CodeView';
import ControlPanel from './components/ControlPanel';
import DocumentationBrowser from './components/DocumentationBrowser';

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
  
  // Generate Airflow DAG code from workspace
  const generateCode = () => {
    if (!workspace) return;
    
    try {
      // Get the Python code from Blockly
      const code = pythonGenerator.workspaceToCode(workspace);
      
      // Wrap in Airflow DAG template with all required imports
      const dagCode = `
###############################################################################
# SimBlock Generated DAG
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
  
  // Deploy DAG to Airflow
  const deployDag = async () => {
    if (!generatedCode) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/deploy-dag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dag_code: generatedCode,
          dag_name: 'simblock_workflow.py'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('DAG deployed successfully to Airflow!');
        // Activate the control panel tab to monitor execution
        setActiveTab('control');
      } else {
        setError('Failed to deploy DAG: ' + data.error);
      }
    } catch (err) {
      setError('Error connecting to Airflow API: ' + err.message);
    }
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
          
          <div className={`tab-content ${activeTab === 'docs' ? 'active' : ''}`}>
            <DocumentationBrowser />
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>SimBlock - Pattern-Based Scientific Workflow Design</p>
      </footer>
    </div>
  );
}

export default App;