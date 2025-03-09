import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { pythonGenerator } from 'blockly/python';
import './App.css';

// Import basic Blockly blocks we know should work
import './blocks/simulation_blocks';

function App() {
  const [workspace, setWorkspace] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState(null);
  const blocklyDiv = useRef(null);
  
  useEffect(() => {
    if (blocklyDiv.current && !blocklyDiv.current.workspace) {
      try {
        console.log("Initializing Blockly workspace...");
        
        // Define a simple toolbox with just a few blocks
        const toolbox = {
          kind: 'categoryToolbox',
          contents: [
            {
              kind: 'category',
              name: 'Simulation',
              colour: '#5C81A6',
              contents: [
                { kind: 'block', type: 'simulation_execution' }
              ]
            },
            {
              kind: 'category',
              name: 'Logic',
              colour: '#5BA55B',
              contents: [
                { kind: 'block', type: 'controls_if' },
                { kind: 'block', type: 'logic_compare' }
              ]
            }
          ]
        };
        
        // Create the Blockly workspace
        const workspace = Blockly.inject(blocklyDiv.current, {
          toolbox,
          grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true,
          },
          zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2,
          },
          trashcan: true,
        });
        
        setWorkspace(workspace);
        console.log("Workspace initialized successfully");
        
        // Create an observer to resize Blockly when the container resizes
        const observer = new ResizeObserver(() => {
          Blockly.svgResize(workspace);
        });
        observer.observe(blocklyDiv.current);
        
        return () => {
          workspace.dispose();
          observer.disconnect();
        };
      } catch (err) {
        console.error("Error initializing Blockly workspace:", err);
        setError("Failed to initialize Blockly: " + err.message);
      }
    }
  }, [blocklyDiv]);
  
  // Generate code
  const generateCode = () => {
    if (!workspace) return;
    
    try {
      // Get the Python code from Blockly
      const code = pythonGenerator.workspaceToCode(workspace);
      setGeneratedCode(code);
      setError(null);
    } catch (err) {
      console.error("Error generating code:", err);
      setError(err.message);
    }
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>SimBlockFlow (Simplified)</h1>
        <button onClick={generateCode}>Generate Code</button>
      </header>
      
      <main className="app-main">
        <div className="workspace-container">
          <div 
            ref={blocklyDiv} 
            style={{ width: '100%', height: '100%' }}
          ></div>
        </div>
        
        <div className="right-panel">
          <div className="code-container">
            <h3>Generated Code</h3>
            {error && <div className="error">{error}</div>}
            <pre>{generatedCode}</pre>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;