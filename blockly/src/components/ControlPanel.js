import React, { useState } from 'react';

// Component for execution control and monitoring
function ControlPanel({ dagCode }) {
  const [status, setStatus] = useState('Not deployed');
  const [executionLog, setExecutionLog] = useState('');
  const [isDeployed, setIsDeployed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  // Function to deploy the DAG to Airflow
  const deployDag = () => {
    setStatus('Deploying DAG to Airflow...');
    setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Deploying DAG to Airflow server...');
    
    // Simulate API call to deploy
    setTimeout(() => {
      setStatus('Deployed');
      setIsDeployed(true);
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] DAG deployed successfully. Ready to run.');
    }, 1500);
  };
  
  // Function to run the DAG
  const runDag = () => {
    setStatus('Running');
    setIsRunning(true);
    setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Triggering DAG execution...');
    
    // Simulate DAG execution
    setTimeout(() => {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] DAG execution started.');
      
      // Simulate task execution
      const tasks = ['start_workflow', 'data_validation', 'simulation_task', 'result_interpretation', 'end_workflow'];
      let taskIndex = 0;
      
      const taskInterval = setInterval(() => {
        if (taskIndex < tasks.length) {
          setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Task ' + tasks[taskIndex] + ' is running...');
          
          setTimeout(() => {
            setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Task ' + tasks[taskIndex] + ' completed successfully.');
          }, 1000);
          
          taskIndex++;
        } else {
          clearInterval(taskInterval);
          setStatus('Completed');
          setIsRunning(false);
          setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] All tasks completed. DAG execution finished.');
        }
      }, 2000);
    }, 1500);
  };
  
  // Function to stop DAG execution
  const stopDag = () => {
    setStatus('Stopping');
    setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Stopping DAG execution...');
    
    // Simulate stopping execution
    setTimeout(() => {
      setStatus('Stopped');
      setIsRunning(false);
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] DAG execution stopped.');
    }, 1500);
  };
  
  // Function to open Airflow UI
  const openAirflowUi = () => {
    window.open('http://localhost:8080', '_blank');
  };
  
  return (
    <div className="control-container">
      <div className="status-box">
        <strong>Status:</strong> {status}
      </div>
      
      <div className="control-buttons">
        <button 
          onClick={deployDag} 
          disabled={!dagCode || isRunning}
        >
          Deploy to Airflow
        </button>
        
        <button 
          onClick={runDag} 
          disabled={!isDeployed || isRunning}
        >
          Run Workflow
        </button>
        
        <button 
          onClick={stopDag} 
          disabled={!isRunning}
        >
          Stop Execution
        </button>
        
        <button onClick={openAirflowUi}>
          Open Airflow UI
        </button>
      </div>
      
      <h3>Execution Log</h3>
      <div className="execution-log">
        {executionLog || 'No execution log yet. Deploy and run your workflow to see execution details.'}
      </div>
    </div>
  );
}

export default ControlPanel;