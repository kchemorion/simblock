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
        className="toolbar-btn new"
        onClick={onNew}
        title="Create new workflow"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
        </svg>
        <span>New</span>
      </button>
      
      <button 
        className="toolbar-btn generate"
        onClick={onGenerate}
        title="Generate Airflow DAG code"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="currentColor" />
        </svg>
        <span>Generate</span>
      </button>
      
      <button 
        className="toolbar-btn export"
        onClick={onExport}
        title="Export workflow as XML"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
        </svg>
        <span>Export</span>
      </button>
      
      <button 
        className="toolbar-btn import"
        onClick={handleImportClick}
        title="Import workflow from XML"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 15l-7-7-7 7h4v5h6v-5h4zM5 4v2h14V4H5z" fill="currentColor" />
        </svg>
        <span>Import</span>
      </button>
      
      <a 
        className="toolbar-btn help"
        href="https://github.com/simblockflow/docs" 
        target="_blank"
        rel="noopener noreferrer"
        title="Help and Documentation"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor" />
        </svg>
        <span>Help</span>
      </a>
      
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