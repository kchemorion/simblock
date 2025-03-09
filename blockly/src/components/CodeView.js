import React, { useState } from 'react';
import { pythonGenerator } from 'blockly/python';

// Component to display generated code and any errors
function CodeView({ code, error, onDeploy }) {
  const [showRoCrateModal, setShowRoCrateModal] = useState(false);
  const [workflowMetadata, setWorkflowMetadata] = useState({
    name: 'SimBlock Workflow',
    description: 'Workflow created with SimBlock pattern-based workflow design tool',
    authors: '',
    license: 'MIT',
    keywords: 'simulation, workflow, airflow',
    programmingLanguage: 'airflow',
    includeDiagram: true
  });

  const handleMetadataChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setWorkflowMetadata({
      ...workflowMetadata,
      [name]: newValue
    });
  };

  const generateRoCrateCode = () => {
    // Generate the RO-Crate metadata function code
    const roCrateCode = pythonGenerator.generateWorkflowHubMetadata(
      workflowMetadata.name,
      workflowMetadata.description,
      workflowMetadata.authors,
      workflowMetadata.license,
      workflowMetadata.keywords,
      workflowMetadata.programmingLanguage,
      workflowMetadata.includeDiagram,
      code
    );

    // Combine with the original DAG code
    return `${code}\n\n${roCrateCode}\n\n# Uncomment to generate RO-Crate\n# if __name__ == "__main__":\n#     generate_workflow_ro_crate()`;
  };

  const downloadAsRoCrate = () => {
    const fullCode = generateRoCrateCode();
    const blob = new Blob([fullCode], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simblock_workflow_with_rocrate.py';
    a.click();
    setShowRoCrateModal(false);
  };

  return (
    <div className="code-view">
      <h3>Generated Airflow DAG Code</h3>
      
      {error && (
        <div className="error-box">
          <p>Error: {error}</p>
        </div>
      )}
      
      <pre className="code-block">
        <code>{code || '// No code generated yet. Create a workflow and click "Generate Code".'}</code>
      </pre>
      
      {code && (
        <div className="code-actions">
          <button 
            onClick={() => {
              const blob = new Blob([code], { type: 'text/python' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'simblock_workflow.py';
              a.click();
            }}
            className="download-button"
          >
            Download DAG
          </button>
          
          <button 
            onClick={() => setShowRoCrateModal(true)}
            className="download-button rocrate"
          >
            WorkflowHub Export
          </button>
          
          <button 
            onClick={onDeploy}
            className="deploy-button"
          >
            Deploy to Airflow
          </button>
        </div>
      )}

      {showRoCrateModal && (
        <div className="rocrate-modal-overlay">
          <div className="rocrate-modal">
            <h3>Export for WorkflowHub.eu</h3>
            <p>Fill in metadata for your workflow RO-Crate package:</p>
            
            <div className="form-group">
              <label>Workflow Name:</label>
              <input 
                type="text"
                name="name"
                value={workflowMetadata.name}
                onChange={handleMetadataChange}
              />
            </div>
            
            <div className="form-group">
              <label>Description:</label>
              <textarea 
                name="description"
                value={workflowMetadata.description}
                onChange={handleMetadataChange}
              />
            </div>
            
            <div className="form-group">
              <label>Authors (comma separated):</label>
              <input 
                type="text"
                name="authors"
                value={workflowMetadata.authors}
                onChange={handleMetadataChange}
                placeholder="e.g., Jane Doe <jane@example.com>, John Smith <john@example.com>"
              />
            </div>
            
            <div className="form-group">
              <label>License:</label>
              <select 
                name="license"
                value={workflowMetadata.license}
                onChange={handleMetadataChange}
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
                value={workflowMetadata.keywords}
                onChange={handleMetadataChange}
              />
            </div>
            
            <div className="form-group">
              <label>Programming Language/Workflow Type:</label>
              <select 
                name="programmingLanguage"
                value={workflowMetadata.programmingLanguage}
                onChange={handleMetadataChange}
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
                checked={workflowMetadata.includeDiagram}
                onChange={handleMetadataChange}
              />
              <label htmlFor="includeDiagram">Include workflow diagram</label>
            </div>
            
            <div className="modal-actions">
              <button onClick={downloadAsRoCrate} className="download-button">
                Download with RO-Crate
              </button>
              <button onClick={() => setShowRoCrateModal(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeView;