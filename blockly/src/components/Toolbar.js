import React, { useRef } from 'react';

// Toolbar component with buttons for actions
function Toolbar({ onNew, onGenerate, onExport, onImport }) {
  const fileInputRef = useRef(null);
  
  // Trigger file input when import button is clicked
  const handleImportClick = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="toolbar">
      <button 
        onClick={onNew}
        title="Create new workflow"
      >
        New
      </button>
      
      <button 
        onClick={onGenerate}
        title="Generate Airflow DAG code"
      >
        Generate Code
      </button>
      
      <button 
        onClick={onExport}
        title="Export workflow as XML"
      >
        Export
      </button>
      
      <button 
        onClick={handleImportClick}
        title="Import workflow from XML"
      >
        Import
      </button>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={onImport}
        accept=".xml"
      />
    </div>
  );
}

export default Toolbar;