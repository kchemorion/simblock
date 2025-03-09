import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';

// Blockly component that wraps the Blockly workspace
function BlocklyWorkspace({ setWorkspace }) {
  const blocklyDiv = useRef(null);
  const toolboxDiv = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (blocklyDiv.current && !blocklyDiv.current.workspace) {
      try {
        console.log("Initializing Blockly workspace...");
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
                { kind: 'block', type: 'monte_carlo_simulation' },
                { kind: 'block', type: 'ensemble_simulation' },
                { kind: 'block', type: 'multiscale_simulation' },
                { kind: 'block', type: 'sensitivity_analysis' },
                { kind: 'block', type: 'checkpoint_restart' },
                { kind: 'block', type: 'cfd_simulation' },
                { kind: 'block', type: 'molecular_dynamics' },
                { kind: 'block', type: 'ml_simulation' },
                { kind: 'block', type: 'visualization' },
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
                { kind: 'block', type: 'data_transformation' },
                { kind: 'block', type: 'data_integration' },
                { kind: 'block', type: 'data_catalog' },
                { kind: 'block', type: 'data_visualization' },
              ],
            },
            {
              kind: 'category',
              name: 'Analysis',
              colour: '#A55B5B',
              contents: [
                { kind: 'block', type: 'result_interpretation' },
                { kind: 'block', type: 'model_calibration' },
                { kind: 'block', type: 'statistical_analysis' },
                { kind: 'block', type: 'machine_learning' },
                { kind: 'block', type: 'uncertainty_quantification' },
                { kind: 'block', type: 'signal_processing' },
                { kind: 'block', type: 'optimization' },
              ],
            },
            {
              kind: 'category',
              name: 'Workflow',
              colour: '#A55BA5',
              contents: [
                { kind: 'block', type: 'error_handling' },
                { kind: 'block', type: 'conditional_branch' },
                { kind: 'block', type: 'parallel_execution' },
                { kind: 'block', type: 'workflow_trigger' },
                { kind: 'block', type: 'retry_strategy' },
                { kind: 'block', type: 'notification' },
                { kind: 'block', type: 'task_dependency' },
              ],
            },
            {
              kind: 'category',
              name: 'Infrastructure',
              colour: '#5BA5A5',
              contents: [
                { kind: 'block', type: 'container_execution' },
                { kind: 'block', type: 'resource_allocation' },
                { kind: 'block', type: 'distributed_computing' },
                { kind: 'block', type: 'environment_setup' },
                { kind: 'block', type: 'data_storage_config' },
                { kind: 'block', type: 'network_config' },
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
                {
                  kind: 'block',
                  type: 'controls_repeat_ext',
                },
                {
                  kind: 'block',
                  type: 'controls_whileUntil',
                },
                {
                  kind: 'block',
                  type: 'controls_forEach',
                },
              ],
            },
            {
              kind: 'category',
              name: 'Variables',
              colour: '#A55B80',
              custom: 'VARIABLE',
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
        console.log("Workspace initialized successfully");

        // Create an observer to resize Blockly when the container resizes
        const observer = new ResizeObserver(() => {
          try {
            Blockly.svgResize(workspace);
          } catch (e) {
            console.error("Error resizing workspace:", e);
          }
        });
        observer.observe(blocklyDiv.current);

        return () => {
          try {
            workspace.dispose();
          } catch (e) {
            console.error("Error disposing workspace:", e);
          }
          observer.disconnect();
        };
      } catch (err) {
        console.error("Error setting up Blockly workspace:", err);
        setError(err.message);
      }
    }
  }, [blocklyDiv, setWorkspace]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px',
          backgroundColor: '#ffebee',
          color: '#b71c1c',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          <h3>Error Loading Blockly</h3>
          <p>{error}</p>
          <p>Please check the console for more details.</p>
        </div>
      )}
      <div 
        ref={blocklyDiv} 
        style={{ width: '100%', height: '100%' }}
      ></div>
    </div>
  );
}

export default BlocklyWorkspace;