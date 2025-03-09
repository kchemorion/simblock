import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * Component for browsing and displaying pattern documentation
 */
function DocumentationBrowser() {
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [patternContent, setPatternContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Categories for organizing patterns
  const categories = [
    { id: 'simulation', name: 'Simulation Patterns' },
    { id: 'data', name: 'Data Patterns' },
    { id: 'infrastructure', name: 'Infrastructure Patterns' },
    { id: 'workflow', name: 'Workflow Patterns' },
    { id: 'analysis', name: 'Analysis Patterns' }
  ];
  
  // Fetch patterns from API
  useEffect(() => {
    async function fetchPatterns() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/patterns');
        const data = await response.json();
        
        if (data.success) {
          setPatterns(data.patterns);
        } else {
          setError(data.error || 'Failed to fetch patterns');
        }
      } catch (err) {
        setError('Error connecting to API: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPatterns();
  }, []);
  
  // Fetch pattern documentation when a pattern is selected
  useEffect(() => {
    if (!selectedPattern) return;
    
    async function fetchPatternDoc() {
      try {
        setLoading(true);
        
        let markdown = '';
        
        // If we have a doc_path, fetch from the API
        if (selectedPattern.doc_path) {
          const response = await fetch(`http://localhost:5000/api/pattern-doc/${selectedPattern.doc_path}`);
          const data = await response.json();
          
          if (data.success) {
            markdown = data.content;
          } else {
            throw new Error(data.error || 'Failed to fetch pattern documentation');
          }
        } else {
          // Fallback to hardcoded documentation
          switch(selectedPattern.category.toLowerCase()) {
            case 'simulation':
              markdown = `# ${selectedPattern.name}
              
## Overview
This pattern represents the execution of a simulation model with specified parameters.

## Parameters
- **Simulation Name**: Identifier for the simulation run
- **Configuration File**: YAML file containing simulation parameters
- **Output Directory**: Where to store simulation results
- **Timeout**: Maximum execution time in seconds

## Example Usage
\`\`\`
Run Simulation "climate_model" with config "params.yaml"
\`\`\`

## Related Patterns
- Parameter Sweep
- Monte Carlo Simulation
- Ensemble Simulation`;
              break;
              
            case 'data':
              markdown = `# ${selectedPattern.name}
              
## Overview
This pattern handles data movement between different storage locations.

## Parameters
- **Source**: Path or URI to source data
- **Destination**: Path or URI where data should be copied

## Example Usage
\`\`\`
Transfer data from "/input/raw_data" to "/processed/data"
\`\`\`

## Related Patterns
- ETL Process
- Data Validation`;
              break;
              
            case 'analysis':
              markdown = `# ${selectedPattern.name}
              
## Overview
This pattern processes simulation results to derive insights and visualizations.

## Parameters
- **Input Path**: Directory containing simulation results
- **Method**: Analysis method (statistics, plots, etc.)
- **Output Format**: Format for result files (CSV, PNG, etc.)

## Example Usage
\`\`\`
Interpret results using "summary stats"
\`\`\`

## Related Patterns
- Data Validation
- Uncertainty Quantification`;
              break;
              
            case 'workflow':
              markdown = `# ${selectedPattern.name}
              
## Overview
This pattern controls workflow execution behavior and error handling.

## Parameters
- **Task ID**: The task to apply error handling to
- **Error Type**: The type of error to handle
- **Action**: How to respond to the error (retry, skip, etc.)

## Example Usage
\`\`\`
Handle errors in "simulation_task" by retrying on "TimeoutError"
\`\`\`

## Related Patterns
- Workflow Trigger
- Dependency Control`;
              break;
              
            case 'infrastructure':
              markdown = `# ${selectedPattern.name}
              
## Overview
This pattern configures infrastructure resources for scientific workloads.

## Parameters
- **Resource Type**: Type of computing resource (HPC, cloud, etc.)
- **Resource Name**: Identifier for the resource
- **CPU Count**: Number of CPU cores to request
- **Memory Size**: Amount of memory (in GB)

## Example Usage
\`\`\`
Allocate HPC resources: 32 cores, 64GB memory, 2 GPUs
\`\`\`

## Related Patterns
- Container Execution
- Data Storage Configuration`;
              break;
              
            default:
              markdown = `# ${selectedPattern.name}
              
Documentation for this pattern is currently under development.`;
          }
        }
        
        setPatternContent(markdown);
      } catch (err) {
        setError('Error fetching pattern documentation: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPatternDoc();
  }, [selectedPattern]);
  
  return (
    <div className="documentation-browser">
      <div className="pattern-sidebar">
        <h3>Pattern Library</h3>
        
        {loading && <p>Loading patterns...</p>}
        {error && <p className="error-text">Error: {error}</p>}
        
        {categories.map(category => (
          <div key={category.id} className="pattern-category">
            <h4>{category.name}</h4>
            <ul>
              {patterns
                .filter(pattern => pattern.category.toLowerCase() === category.id || 
                                  pattern.category.toLowerCase() === category.name.toLowerCase().replace(' patterns', ''))
                .map(pattern => (
                  <li 
                    key={pattern.id} 
                    className={selectedPattern && selectedPattern.id === pattern.id ? 'selected' : ''}
                    onClick={() => setSelectedPattern(pattern)}
                  >
                    {pattern.name}
                  </li>
                ))
              }
            </ul>
          </div>
        ))}
      </div>
      
      <div className="pattern-content">
        {selectedPattern ? (
          <>
            {loading ? (
              <p>Loading pattern documentation...</p>
            ) : (
              <div className="markdown-content">
                <ReactMarkdown>{patternContent}</ReactMarkdown>
              </div>
            )}
          </>
        ) : (
          <div className="no-selection">
            <p>Select a pattern from the sidebar to view its documentation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentationBrowser;