import React, { useState, useEffect } from 'react';

// Component for execution control, connection management, and monitoring
function ControlPanel({ dagCode }) {
  const [activeTab, setActiveTab] = useState('execution');
  const [status, setStatus] = useState('Not deployed');
  const [executionLog, setExecutionLog] = useState('');
  const [isDeployed, setIsDeployed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [connections, setConnections] = useState([]);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [newConnection, setNewConnection] = useState({
    connId: '',
    connType: 'ssh',
    host: '',
    port: '',
    login: '',
    password: '',
    extra: ''
  });
  const [gitHubSettings, setGitHubSettings] = useState({
    username: '',
    repoName: '',
    token: '',
    branch: 'main',
    commitMessage: ''
  });
  const [workflowHubSettings, setWorkflowHubSettings] = useState({
    name: '',
    description: '',
    authors: '',
    license: 'MIT',
    keywords: '',
    languageType: 'python',
    includeDiagram: true,
  });
  const [monitoringData, setMonitoringData] = useState({
    resources: [],
    executionHistory: [],
    currentRun: null
  });
  
  // Fetch available connections and monitoring data on component mount
  useEffect(() => {
    fetchConnections();
    fetchMonitoringData();
  }, []);
  
  // Function to fetch connections from Airflow
  const fetchConnections = async () => {
    try {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Fetching connection information...');
      
      // Simulate API call to get connections
      setTimeout(() => {
        const mockConnections = [
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
        ];
        
        setConnections(mockConnections);
        setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Successfully retrieved connection information.');
      }, 1000);
    } catch (error) {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Error fetching connections: ' + error.message);
    }
  };

  // Function to fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      // Simulate API call to get monitoring data
      setTimeout(() => {
        const mockMonitoringData = {
          resources: [
            { name: 'CPU', usage: '45%', trend: 'stable' },
            { name: 'Memory', usage: '62%', trend: 'increasing' },
            { name: 'Disk', usage: '78%', trend: 'stable' }
          ],
          executionHistory: [
            { id: 'run-1234', date: '2025-03-08', status: 'completed', duration: '15m 23s' },
            { id: 'run-1233', date: '2025-03-07', status: 'failed', duration: '4m 12s' },
            { id: 'run-1232', date: '2025-03-05', status: 'completed', duration: '12m 45s' }
          ],
          currentRun: {
            id: 'run-1235',
            startTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            tasks: {
              total: 5,
              completed: 2,
              running: 1,
              pending: 2,
              failed: 0
            }
          }
        };
        
        setMonitoringData(mockMonitoringData);
      }, 1000);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  };
  
  // Function to test a connection
  const testConnection = (connId) => {
    setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Testing connection: ' + connId);
    
    // Find the connection
    const connection = connections.find(conn => conn.conn_id === connId);
    
    if (!connection) {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] ERROR: Connection not found: ' + connId);
      return;
    }
    
    // Test different types of connections differently
    if (connection.conn_type === 'ssh') {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Opening SSH connection to ' + connection.host + ':' + connection.port);
    } else if (connection.conn_type === 'aws') {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Testing AWS credentials for region ' + (connection.extra?.region || 'unknown'));
    } else if (connection.conn_type === 'postgres') {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Connecting to PostgreSQL database at ' + connection.host + ':' + connection.port);
    } else {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Testing ' + connection.conn_type + ' connection');
    }
    
    // Simulate connection test with a random chance of failure
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% chance of success
      
      if (success) {
        setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Connection test successful for ' + connId);
      } else {
        setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] ERROR: Connection test failed for ' + connId + '. Check your credentials and try again.');
      }
    }, 1500);
  };
  
  // Function to add a new connection
  const addConnection = () => {
    setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Adding new connection: ' + newConnection.connId);
    
    // Validate connection data
    if (!newConnection.connId || !newConnection.connType) {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] ERROR: Connection ID and type are required.');
      return;
    }
    
    // Simulate adding the connection
    setTimeout(() => {
      const conn = {
        conn_id: newConnection.connId,
        conn_type: newConnection.connType,
        description: newConnection.description || '',
        host: newConnection.host || '',
        port: newConnection.port || '',
        login: newConnection.login || '',
        password: newConnection.password ? '********' : '',
        extra: newConnection.extra || '',
      };
      
      // Add to local state
      const updatedConnections = [...connections, conn];
      setConnections(updatedConnections);
      
      // Update global SimBlockFlow object
      if (window.SimBlockFlow) {
        window.SimBlockFlow.connections = updatedConnections;
      }
      
      setNewConnection({
        connId: '',
        connType: 'ssh',
        host: '',
        port: '',
        login: '',
        password: '',
        extra: '',
        description: ''
      });
      setShowConnectionForm(false);
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Connection added successfully: ' + newConnection.connId);
    }, 1500);
  };
  
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
  
  // Function to handle connection form input change
  const handleConnectionInputChange = (e) => {
    const { name, value } = e.target;
    setNewConnection({ ...newConnection, [name]: value });
  };
  
  // Function to handle GitHub settings input change
  const handleGitHubInputChange = (e) => {
    const { name, value } = e.target;
    setGitHubSettings({ ...gitHubSettings, [name]: value });
  };
  
  // Function to handle WorkflowHub settings input change
  const handleWorkflowHubInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setWorkflowHubSettings({ ...workflowHubSettings, [name]: newValue });
  };
  
  // Function to push to GitHub
  const pushToGitHub = () => {
    // Validate GitHub settings
    if (!gitHubSettings.username || !gitHubSettings.repoName || !gitHubSettings.token) {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] ERROR: GitHub username, repository name, and token are required.');
      return;
    }
    
    setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Pushing workflow to GitHub repository...');
    
    // Simulate GitHub push
    setTimeout(() => {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Successfully pushed workflow to GitHub repository: ' + 
        gitHubSettings.username + '/' + gitHubSettings.repoName);
    }, 2000);
  };
  
  // Function to export to WorkflowHub.eu
  const exportToWorkflowHub = () => {
    // Validate WorkflowHub settings
    if (!workflowHubSettings.name || !workflowHubSettings.description || !workflowHubSettings.authors) {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] ERROR: Workflow name, description, and authors are required for WorkflowHub export.');
      return;
    }
    
    setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Preparing workflow for WorkflowHub.eu export...');
    setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Creating RO-Crate metadata according to WorkflowHub.eu guidelines...');
    
    // Simulate WorkflowHub export
    setTimeout(() => {
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Successfully created workflow.crate.zip for WorkflowHub.eu');
      setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] You can now manually upload this file to WorkflowHub.eu');
    }, 3000);
  };
  
  return (
    <div className="control-container">
      <div className="control-panel-tabs">
        <button 
          className={`panel-tab ${activeTab === 'execution' ? 'active' : ''}`}
          onClick={() => setActiveTab('execution')}
        >
          Execution
        </button>
        <button 
          className={`panel-tab ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          Connections
        </button>
        <button 
          className={`panel-tab ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          Monitoring
        </button>
        <button 
          className={`panel-tab ${activeTab === 'github' ? 'active' : ''}`}
          onClick={() => setActiveTab('github')}
        >
          GitHub
        </button>
        <button 
          className={`panel-tab ${activeTab === 'workflowhub' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflowhub')}
        >
          WorkflowHub
        </button>
      </div>
      
      {/* Execution Tab */}
      {activeTab === 'execution' && (
        <div className="execution-section">
          <div className="status-box">
            <strong>Status:</strong> {status}
          </div>
          
          <div className="control-buttons">
            <button 
              onClick={deployDag} 
              disabled={!dagCode || isRunning}
              className="control-btn deploy"
            >
              Deploy to Airflow
            </button>
            
            <button 
              onClick={runDag} 
              disabled={!isDeployed || isRunning}
              className="control-btn run"
            >
              Run Workflow
            </button>
            
            <button 
              onClick={stopDag} 
              disabled={!isRunning}
              className="control-btn stop"
            >
              Stop Execution
            </button>
            
            <button 
              onClick={openAirflowUi}
              className="control-btn airflow"
            >
              Open Airflow UI
            </button>
          </div>
          
          <h3>Execution Log</h3>
          <div className="execution-log">
            {executionLog || 'No execution log yet. Deploy and run your workflow to see execution details.'}
          </div>
        </div>
      )}
      
      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="connections-section">
          <div className="section-header">
            <h3>Resource Connections</h3>
            <button 
              className="add-connection-btn"
              onClick={() => setShowConnectionForm(!showConnectionForm)}
            >
              {showConnectionForm ? 'Cancel' : '+ Add Connection'}
            </button>
          </div>
          
          {showConnectionForm && (
            <div className="connection-form">
              <h4>Add New Connection</h4>
              
              <div className="form-group">
                <label>Connection ID:</label>
                <input 
                  type="text"
                  name="connId"
                  value={newConnection.connId}
                  onChange={handleConnectionInputChange}
                  placeholder="e.g., my_hpc_cluster"
                />
              </div>
              
              <div className="form-group">
                <label>Type:</label>
                <select 
                  name="connType"
                  value={newConnection.connType}
                  onChange={handleConnectionInputChange}
                >
                  <option value="ssh">SSH</option>
                  <option value="postgres">PostgreSQL</option>
                  <option value="aws">AWS</option>
                  <option value="gcp">Google Cloud</option>
                  <option value="azure">Azure</option>
                  <option value="ftp">FTP</option>
                  <option value="http">HTTP</option>
                  <option value="s3">S3</option>
                  <option value="github">GitHub</option>
                  <option value="workflowhub">WorkflowHub</option>
                  <option value="openfoam">OpenFOAM</option>
                  <option value="gromacs">GROMACS</option>
                  <option value="lammps">LAMMPS</option>
                  <option value="namd">NAMD</option>
                  <option value="tensorflow">TensorFlow</option>
                  <option value="pytorch">PyTorch</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <input 
                  type="text"
                  name="description"
                  value={newConnection.description}
                  onChange={handleConnectionInputChange}
                  placeholder="Optional description"
                />
              </div>
              
              <div className="form-group">
                <label>Host:</label>
                <input 
                  type="text"
                  name="host"
                  value={newConnection.host}
                  onChange={handleConnectionInputChange}
                  placeholder="hostname or IP address"
                />
              </div>
              
              <div className="form-group">
                <label>Port:</label>
                <input 
                  type="text"
                  name="port"
                  value={newConnection.port}
                  onChange={handleConnectionInputChange}
                  placeholder="e.g., 22 for SSH"
                />
              </div>
              
              <div className="form-group">
                <label>Login:</label>
                <input 
                  type="text"
                  name="login"
                  value={newConnection.login}
                  onChange={handleConnectionInputChange}
                  placeholder="Username"
                />
              </div>
              
              <div className="form-group">
                <label>Password:</label>
                <input 
                  type="password"
                  name="password"
                  value={newConnection.password}
                  onChange={handleConnectionInputChange}
                  placeholder="Password or key passphrase"
                />
              </div>
              
              <div className="form-group">
                <label>Extra (JSON):</label>
                <textarea 
                  name="extra"
                  value={newConnection.extra}
                  onChange={handleConnectionInputChange}
                  placeholder='{"key_file": "/path/to/key.pem", "no_host_key_check": true}'
                />
              </div>
              
              <div className="form-actions">
                <button onClick={addConnection}>Save Connection</button>
                <button onClick={() => setShowConnectionForm(false)}>Cancel</button>
              </div>
            </div>
          )}
          
          <div className="connections-list">
            {connections.length === 0 ? (
              <p>No connections configured. Add a connection to enable resource access.</p>
            ) : (
              <table className="connections-table">
                <thead>
                  <tr>
                    <th>Connection ID</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Host</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map(conn => (
                    <tr key={conn.conn_id}>
                      <td>{conn.conn_id}</td>
                      <td>{conn.conn_type}</td>
                      <td>{conn.description || '-'}</td>
                      <td>{conn.host || '-'}</td>
                      <td>
                        <button 
                          className="connection-btn test"
                          onClick={() => testConnection(conn.conn_id)}
                        >
                          Test
                        </button>
                        <button 
                          className="connection-btn edit"
                          onClick={() => {
                            // Find connection and prefill the form
                            const connection = connections.find(c => c.conn_id === conn.conn_id);
                            if (connection) {
                              setNewConnection({
                                connId: connection.conn_id,
                                connType: connection.conn_type,
                                description: connection.description || '',
                                host: connection.host || '',
                                port: connection.port || '',
                                login: connection.login || '',
                                password: '',
                                extra: typeof connection.extra === 'object' ? JSON.stringify(connection.extra) : (connection.extra || '')
                              });
                              setShowConnectionForm(true);
                              setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Editing connection: ' + connection.conn_id);
                            }
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="connection-btn delete"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the connection "${conn.conn_id}"?`)) {
                              const updatedConnections = connections.filter(c => c.conn_id !== conn.conn_id);
                              setConnections(updatedConnections);
                              
                              // Update global SimBlockFlow object
                              if (window.SimBlockFlow) {
                                window.SimBlockFlow.connections = updatedConnections;
                              }
                              
                              setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Connection deleted: ' + conn.conn_id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      
      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="monitoring-section">
          <h3>System Resources</h3>
          <div className="resource-metrics">
            {monitoringData.resources.map(resource => (
              <div className="resource-metric" key={resource.name}>
                <div className="metric-name">{resource.name}</div>
                <div className="metric-value">{resource.usage}</div>
                <div className={`metric-trend ${resource.trend}`}>
                  {resource.trend === 'increasing' && '↑'}
                  {resource.trend === 'decreasing' && '↓'}
                  {resource.trend === 'stable' && '→'}
                </div>
              </div>
            ))}
          </div>
          
          <h3>Current Execution</h3>
          {monitoringData.currentRun ? (
            <div className="current-execution">
              <div className="execution-header">
                <span>Run ID: {monitoringData.currentRun.id}</span>
                <span>Started: {new Date(monitoringData.currentRun.startTime).toLocaleString()}</span>
              </div>
              <div className="task-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-complete" 
                    style={{width: `${(monitoringData.currentRun.tasks.completed / monitoringData.currentRun.tasks.total) * 100}%`}}
                  ></div>
                  <div 
                    className="progress-running" 
                    style={{width: `${(monitoringData.currentRun.tasks.running / monitoringData.currentRun.tasks.total) * 100}%`}}
                  ></div>
                </div>
                <div className="progress-stats">
                  <div className="stat">
                    <span className="stat-label">Completed:</span>
                    <span className="stat-value">{monitoringData.currentRun.tasks.completed}/{monitoringData.currentRun.tasks.total}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Running:</span>
                    <span className="stat-value">{monitoringData.currentRun.tasks.running}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Pending:</span>
                    <span className="stat-value">{monitoringData.currentRun.tasks.pending}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Failed:</span>
                    <span className="stat-value">{monitoringData.currentRun.tasks.failed}</span>
                  </div>
                </div>
              </div>
              
              {/* Show simulated active tasks */}
              <div className="active-tasks">
                <h4>Active Tasks</h4>
                <table className="active-tasks-table">
                  <thead>
                    <tr>
                      <th>Task ID</th>
                      <th>Status</th>
                      <th>Duration</th>
                      <th>Connection</th>
                      <th>Resources</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>data_validation</td>
                      <td><span className="task-status completed">✓ Completed</span></td>
                      <td>5m 12s</td>
                      <td>none (local)</td>
                      <td>512MB, 1 CPU</td>
                    </tr>
                    <tr>
                      <td>simulation_task</td>
                      <td><span className="task-status running">⟳ Running</span></td>
                      <td>8m 45s</td>
                      <td>hpc_cluster</td>
                      <td>32GB, 8 CPUs</td>
                    </tr>
                    <tr>
                      <td>result_interpretation</td>
                      <td><span className="task-status pending">⏱ Pending</span></td>
                      <td>-</td>
                      <td>none (local)</td>
                      <td>4GB, 2 CPUs</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="task-logs">
                  <h4>Task Logs - simulation_task</h4>
                  <pre className="task-log-content">
                    [10:42:15] Task simulation_task started on hpc_cluster
                    [10:42:18] Loading simulation parameters from config.yaml
                    [10:42:22] Initializing simulation environment
                    [10:43:05] Running timestep 1/100
                    [10:45:12] Running timestep 25/100
                    [10:47:32] Running timestep 50/100
                    [10:50:01] Running timestep 75/100
                    [10:51:00] Running timestep 80/100...
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-execution">
              <p>No active workflow execution</p>
              <button 
                className="start-demo-btn" 
                onClick={() => {
                  // Generate fake monitoring data
                  const newMonitoringData = {
                    ...monitoringData,
                    currentRun: {
                      id: 'run-' + Math.floor(Math.random() * 10000),
                      startTime: new Date().toISOString(),
                      tasks: {
                        total: 5,
                        completed: 1,
                        running: 1,
                        pending: 3,
                        failed: 0
                      }
                    }
                  };
                  setMonitoringData(newMonitoringData);
                  setExecutionLog(prevLog => prevLog + '\n[' + new Date().toLocaleTimeString() + '] Started demo execution run: ' + newMonitoringData.currentRun.id);
                }}
              >
                Start Demo Execution
              </button>
            </div>
          )}
          
          <h3>Execution History</h3>
          <table className="history-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {monitoringData.executionHistory.map(run => (
                <tr key={run.id} className={`run-${run.status}`}>
                  <td>{run.id}</td>
                  <td>{run.date}</td>
                  <td>{run.status}</td>
                  <td>{run.duration}</td>
                  <td>
                    <button className="history-btn view">View Details</button>
                    <button className="history-btn rerun">Rerun</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* GitHub Tab */}
      {activeTab === 'github' && (
        <div className="sharing-section">
          <div className="github-section">
            <h3>GitHub Integration</h3>
            <p>Push your workflow to a GitHub repository to version control and share your work.</p>
            
            <div className="form-group">
              <label>GitHub Username:</label>
              <input 
                type="text"
                name="username"
                value={gitHubSettings.username}
                onChange={handleGitHubInputChange}
                placeholder="Enter your GitHub username"
              />
            </div>
            
            <div className="form-group">
              <label>Repository Name:</label>
              <input 
                type="text"
                name="repoName"
                value={gitHubSettings.repoName}
                onChange={handleGitHubInputChange}
                placeholder="Enter repository name"
              />
            </div>
            
            <div className="form-group">
              <label>GitHub Token:</label>
              <input 
                type="password"
                name="token"
                value={gitHubSettings.token}
                onChange={handleGitHubInputChange}
                placeholder="Enter GitHub access token"
              />
            </div>
            
            <div className="form-group">
              <label>Branch:</label>
              <input 
                type="text"
                name="branch"
                value={gitHubSettings.branch}
                onChange={handleGitHubInputChange}
                placeholder="Enter branch name (default: main)"
              />
            </div>
            
            <div className="form-group">
              <label>Commit Message:</label>
              <textarea 
                name="commitMessage"
                value={gitHubSettings.commitMessage}
                onChange={handleGitHubInputChange}
                placeholder="Enter commit message"
              />
            </div>
            
            <button 
              className="github-btn"
              onClick={pushToGitHub}
              disabled={!gitHubSettings.username || !gitHubSettings.repoName || !gitHubSettings.token}
            >
              Push to GitHub
            </button>
          </div>
        </div>
      )}
      
      {/* WorkflowHub Tab */}
      {activeTab === 'workflowhub' && (
        <div className="sharing-section">
          <div className="workflowhub-section">
            <h3>WorkflowHub.eu Export</h3>
            <p>Export your workflow as an RO-Crate package compatible with WorkflowHub.eu standards.</p>
            
            <div className="form-group">
              <label>Workflow Name:</label>
              <input 
                type="text"
                name="name"
                value={workflowHubSettings.name}
                onChange={handleWorkflowHubInputChange}
                placeholder="Enter workflow name"
              />
            </div>
            
            <div className="form-group">
              <label>Description:</label>
              <textarea 
                name="description"
                value={workflowHubSettings.description}
                onChange={handleWorkflowHubInputChange}
                placeholder="Enter workflow description"
              />
            </div>
            
            <div className="form-group">
              <label>Authors (comma separated):</label>
              <input 
                type="text"
                name="authors"
                value={workflowHubSettings.authors}
                onChange={handleWorkflowHubInputChange}
                placeholder="e.g., Jane Doe <jane@example.com>, John Smith <john@example.com>"
              />
            </div>
            
            <div className="form-group">
              <label>License:</label>
              <select 
                name="license"
                value={workflowHubSettings.license}
                onChange={handleWorkflowHubInputChange}
              >
                <option value="MIT">MIT</option>
                <option value="Apache-2.0">Apache 2.0</option>
                <option value="GPL-3.0">GPL 3.0</option>
                <option value="BSD-3-Clause">BSD 3-Clause</option>
                <option value="CC-BY-4.0">Creative Commons BY 4.0</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Keywords (comma separated):</label>
              <input 
                type="text"
                name="keywords"
                value={workflowHubSettings.keywords}
                onChange={handleWorkflowHubInputChange}
                placeholder="e.g., simulation, computational fluid dynamics, bioinformatics"
              />
            </div>
            
            <div className="form-group">
              <label>Programming Language/Workflow Type:</label>
              <select 
                name="languageType"
                value={workflowHubSettings.languageType}
                onChange={handleWorkflowHubInputChange}
              >
                <option value="python">Python</option>
                <option value="cwl">Common Workflow Language (CWL)</option>
                <option value="nextflow">Nextflow</option>
                <option value="snakemake">Snakemake</option>
                <option value="airflow">Apache Airflow</option>
              </select>
            </div>
            
            <div className="form-group checkbox">
              <input 
                type="checkbox"
                id="includeDiagram"
                name="includeDiagram"
                checked={workflowHubSettings.includeDiagram}
                onChange={handleWorkflowHubInputChange}
              />
              <label htmlFor="includeDiagram">Include workflow diagram</label>
            </div>
            
            <div className="ro-crate-info">
              <h4>About WorkflowHub RO-Crate Format</h4>
              <ul>
                <li>Files will be packaged as <code>.crate.zip</code> with <code>ro-crate-metadata.json</code> at the root</li>
                <li>Metadata will conform to RO-Crate 1.1 standard</li>
                <li>The workflow will be specified as the main entity of type "ComputationalWorkflow"</li>
                <li>Your workflow diagram will be included as an "ImageObject" (if selected)</li>
              </ul>
            </div>
            
            <button 
              className="workflowhub-btn"
              onClick={exportToWorkflowHub}
              disabled={!workflowHubSettings.name || !workflowHubSettings.description || !workflowHubSettings.authors}
            >
              Export for WorkflowHub.eu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlPanel;