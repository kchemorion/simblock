import React from 'react';

// Component to display generated code and any errors
function CodeView({ code, error }) {
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
      )}
    </div>
  );
}

export default CodeView;