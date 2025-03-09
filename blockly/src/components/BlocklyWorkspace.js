import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';

// Blockly component that wraps the Blockly workspace
function BlocklyWorkspace({ setWorkspace }) {
  const blocklyDiv = useRef(null);
  const toolboxDiv = useRef(null);

  useEffect(() => {
    if (blocklyDiv.current && !blocklyDiv.current.workspace) {
      // Define the toolbox XML
      const toolbox = {
        kind: 'categoryToolbox',
        contents: [
          {
            kind: 'category',
            name: 'Simulation',
            colour: '#5C81A6',
            contents: [
              { kind: 'block', type: 'simulation_execution' },
              { kind: 'block', type: 'parameter_sweep' },
            ],
          },
          {
            kind: 'category',
            name: 'Data',
            colour: '#9FA55B',
            contents: [
              { kind: 'block', type: 'data_transfer' },
              { kind: 'block', type: 'etl_process' },
              { kind: 'block', type: 'data_validation' },
            ],
          },
          {
            kind: 'category',
            name: 'Analysis',
            colour: '#A55B5B',
            contents: [
              { kind: 'block', type: 'result_interpretation' },
              { kind: 'block', type: 'model_calibration' },
            ],
          },
          {
            kind: 'category',
            name: 'Logic',
            colour: '#5BA55B',
            contents: [
              { 
                kind: 'block',
                type: 'controls_if',
              },
              {
                kind: 'block',
                type: 'logic_compare',
              },
              {
                kind: 'block',
                type: 'logic_operation',
              },
            ],
          },
        ],
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

      // Set the workspace in the parent component state
      setWorkspace(workspace);

      // Create an observer to resize Blockly when the container resizes
      const observer = new ResizeObserver(() => {
        Blockly.svgResize(workspace);
      });
      observer.observe(blocklyDiv.current);

      return () => {
        workspace.dispose();
        observer.disconnect();
      };
    }
  }, [blocklyDiv, setWorkspace]);

  return (
    <div 
      ref={blocklyDiv} 
      style={{ width: '100%', height: '100%' }}
    ></div>
  );
}

export default BlocklyWorkspace;