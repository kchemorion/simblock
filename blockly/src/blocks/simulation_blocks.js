import * as Blockly from 'blockly';

/**
 * Block Category: Simulation Patterns
 * 
 * These blocks represent common patterns used in scientific and engineering simulations.
 * Each block encapsulates best practices for a specific simulation workflow pattern.
 */

// Make sure Blockly is properly loaded
if (typeof Blockly === 'undefined' || !Blockly.Blocks) {
  console.error('Blockly is not properly loaded!');
}
Blockly.Blocks['simulation_execution'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Run Simulation")
        .appendField(new Blockly.FieldTextInput("simulation_name"), "SIM_NAME");
    this.appendDummyInput()
        .appendField("with config")
        .appendField(new Blockly.FieldTextInput("config.yaml"), "CONFIG_FILE");
    this.appendDummyInput()
        .appendField("output to")
        .appendField(new Blockly.FieldTextInput("/path/to/output"), "OUTPUT_DIR");
    this.appendDummyInput()
        .appendField("timeout")
        .appendField(new Blockly.FieldNumber(3600, 0), "TIMEOUT")
        .appendField("seconds");
    
    // Get available connections from window.SimBlockFlow.connections if it exists
    let platformOptions = [
      ["local machine", "LOCAL"],
      ["HPC cluster", "HPC"],
      ["cloud (AWS)", "AWS"],
      ["cloud (Azure)", "AZURE"],
      ["cloud (GCP)", "GCP"]
    ];
    
    // Use connection ID dropdown that will be populated dynamically
    this.appendDummyInput()
        .appendField("using connection")
        .appendField(new Blockly.FieldDropdown(function() {
          // This function will be called whenever the dropdown needs to be rendered
          // Try to get connections from the global variable
          if (window.SimBlockFlow && window.SimBlockFlow.connections) {
            // Map connections to dropdown options
            const connOptions = window.SimBlockFlow.connections.map(conn => {
              return [conn.conn_id + " (" + conn.conn_type + ")", conn.conn_id];
            });
            
            // Always include a "none" option
            connOptions.unshift(["none (local execution)", "none"]);
            
            return connOptions.length > 1 ? connOptions : [["Add connections in Control Panel", "none"]];
          }
          return [["Add connections in Control Panel", "none"]];
        }), "CONNECTION_ID");
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Execute a simulation with the given configuration using a connection defined in the Control Panel.");
    this.setHelpUrl("");
  }
};

/**
 * Parameter Sweep Pattern
 * Iterates over a set of parameters and executes a sub-workflow for each parameter set
 */
Blockly.Blocks['parameter_sweep'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("For each")
        .appendField(new Blockly.FieldVariable("param"), "PARAM_VAR")
        .appendField("in")
        .appendField(new Blockly.FieldDropdown([
          ["range", "RANGE"],
          ["list", "LIST"],
          ["file", "FILE"]
        ]), "PARAM_SOURCE");
    this.appendDummyInput()
        .appendField("values")
        .appendField(new Blockly.FieldTextInput("1..5"), "PARAM_VALUES");
    this.appendDummyInput()
        .appendField("in parallel")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "PARALLEL");
    this.appendStatementInput("DO")
        .appendField("do");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Sweep through parameter values and execute enclosed steps for each value.");
    this.setHelpUrl("");
  }
};

/**
 * Monte Carlo Simulation Pattern
 * Runs multiple simulation instances with random variations
 */
Blockly.Blocks['monte_carlo_simulation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Run Monte Carlo simulation");
    this.appendDummyInput()
        .appendField("name")
        .appendField(new Blockly.FieldTextInput("monte_carlo"), "NAME");
    this.appendDummyInput()
        .appendField("iterations")
        .appendField(new Blockly.FieldNumber(100, 1), "ITERATIONS");
    this.appendDummyInput()
        .appendField("base config")
        .appendField(new Blockly.FieldTextInput("base_config.yaml"), "BASE_CONFIG");
    this.appendDummyInput()
        .appendField("random seed")
        .appendField(new Blockly.FieldNumber(42), "SEED");
    this.appendStatementInput("DO")
        .appendField("for each iteration");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Run multiple simulation instances with random variations.");
    this.setHelpUrl("");
  }
};

/**
 * Ensemble Simulation Pattern
 * Runs multiple simulations with different initial conditions or models
 */
Blockly.Blocks['ensemble_simulation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Run Ensemble simulation");
    this.appendDummyInput()
        .appendField("ensemble name")
        .appendField(new Blockly.FieldTextInput("ensemble"), "NAME");
    this.appendDummyInput()
        .appendField("ensemble size")
        .appendField(new Blockly.FieldNumber(10, 1), "SIZE");
    this.appendDummyInput()
        .appendField("ensemble method")
        .appendField(new Blockly.FieldDropdown([
          ["perturbed initial conditions", "PERTURBED_IC"],
          ["multi-model", "MULTI_MODEL"],
          ["stochastic physics", "STOCHASTIC_PHYSICS"]
        ]), "METHOD");
    this.appendDummyInput()
        .appendField("configs directory")
        .appendField(new Blockly.FieldTextInput("/path/to/configs"), "CONFIGS_DIR");
    this.appendStatementInput("DO")
        .appendField("for each member");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Run an ensemble of simulations with different initial conditions or models.");
    this.setHelpUrl("");
  }
};

/**
 * Multi-scale Simulation Pattern
 * Links simulations at different scales/resolutions
 */
Blockly.Blocks['multiscale_simulation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Multi-scale Simulation");
    this.appendDummyInput()
        .appendField("coarse scale model")
        .appendField(new Blockly.FieldTextInput("coarse_model"), "COARSE_MODEL");
    this.appendDummyInput()
        .appendField("fine scale model")
        .appendField(new Blockly.FieldTextInput("fine_model"), "FINE_MODEL");
    this.appendDummyInput()
        .appendField("coupling method")
        .appendField(new Blockly.FieldDropdown([
          ["one-way", "ONE_WAY"],
          ["two-way", "TWO_WAY"],
          ["adaptive", "ADAPTIVE"]
        ]), "COUPLING_METHOD");
    this.appendDummyInput()
        .appendField("max iterations")
        .appendField(new Blockly.FieldNumber(5, 1), "MAX_ITERS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Link simulations at different scales/resolutions.");
    this.setHelpUrl("");
  }
};

/**
 * Sensitivity Analysis Pattern
 * Analyzes how sensitive model outputs are to variations in inputs
 */
Blockly.Blocks['sensitivity_analysis'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Sensitivity Analysis");
    this.appendDummyInput()
        .appendField("model")
        .appendField(new Blockly.FieldTextInput("model_name"), "MODEL");
    this.appendDummyInput()
        .appendField("method")
        .appendField(new Blockly.FieldDropdown([
          ["one-at-a-time", "OAT"],
          ["Morris method", "MORRIS"],
          ["Sobol indices", "SOBOL"]
        ]), "METHOD");
    this.appendDummyInput()
        .appendField("parameters")
        .appendField(new Blockly.FieldTextInput("param1,param2,param3"), "PARAMS");
    this.appendDummyInput()
        .appendField("samples per parameter")
        .appendField(new Blockly.FieldNumber(10, 1), "SAMPLES");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Analyze how sensitive model outputs are to variations in inputs.");
    this.setHelpUrl("");
  }
};

/**
 * Simulation Checkpoint & Restart Pattern
 * Enables saving and resuming simulation state
 */
Blockly.Blocks['checkpoint_restart'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Use checkpointing for");
    this.appendDummyInput()
        .appendField("simulation")
        .appendField(new Blockly.FieldTextInput("sim_name"), "SIM_NAME");
    this.appendDummyInput()
        .appendField("checkpoint frequency")
        .appendField(new Blockly.FieldNumber(60, 1), "FREQUENCY")
        .appendField("minutes");
    this.appendDummyInput()
        .appendField("checkpoint dir")
        .appendField(new Blockly.FieldTextInput("/path/to/checkpoints"), "CHECKPOINT_DIR");
    this.appendDummyInput()
        .appendField("max checkpoints")
        .appendField(new Blockly.FieldNumber(5, 1, 100), "MAX_CHECKPOINTS");
    this.appendDummyInput()
        .appendField("restart from")
        .appendField(new Blockly.FieldDropdown([
          ["latest checkpoint", "LATEST"],
          ["specific checkpoint", "SPECIFIC"],
          ["no restart (new run)", "NONE"]
        ]), "RESTART_MODE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Enable saving and resuming simulation state.");
    this.setHelpUrl("");
  }
};

/**
 * CFD Simulation Pattern
 * Specialized block for Computational Fluid Dynamics simulations
 */
Blockly.Blocks['cfd_simulation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("CFD Simulation");
    this.appendDummyInput()
        .appendField("name")
        .appendField(new Blockly.FieldTextInput("cfd_simulation"), "NAME");
    this.appendDummyInput()
        .appendField("solver")
        .appendField(new Blockly.FieldDropdown([
          ["OpenFOAM", "OPENFOAM"],
          ["Fluent", "FLUENT"],
          ["SU2", "SU2"],
          ["custom", "CUSTOM"]
        ]), "SOLVER");
    this.appendDummyInput()
        .appendField("mesh file")
        .appendField(new Blockly.FieldTextInput("mesh.msh"), "MESH");
    this.appendDummyInput()
        .appendField("config file")
        .appendField(new Blockly.FieldTextInput("cfd_config.yaml"), "CONFIG");
    this.appendDummyInput()
        .appendField("iterations")
        .appendField(new Blockly.FieldNumber(1000, 1), "ITERATIONS");
    this.appendDummyInput()
        .appendField("convergence threshold")
        .appendField(new Blockly.FieldNumber(1e-6, 0), "CONVERGENCE");
    this.appendDummyInput()
        .appendField("turbulence model")
        .appendField(new Blockly.FieldDropdown([
          ["k-epsilon", "K_EPSILON"],
          ["k-omega", "K_OMEGA"],
          ["Spalart-Allmaras", "SA"],
          ["LES", "LES"],
          ["DNS", "DNS"]
        ]), "TURBULENCE");
    
    // Add connection field that will be populated dynamically
    this.appendDummyInput()
        .appendField("using connection")
        .appendField(new Blockly.FieldDropdown(function() {
          // This function will be called whenever the dropdown needs to be rendered
          // Try to get connections from the global variable
          if (window.SimBlockFlow && window.SimBlockFlow.connections) {
            // Map connections to dropdown options
            const connOptions = window.SimBlockFlow.connections.map(conn => {
              return [conn.conn_id + " (" + conn.conn_type + ")", conn.conn_id];
            });
            
            // Always include a "none" option
            connOptions.unshift(["none (local execution)", "none"]);
            
            return connOptions.length > 1 ? connOptions : [["Add connections in Control Panel", "none"]];
          }
          return [["Add connections in Control Panel", "none"]];
        }), "CONNECTION_ID");
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Run a Computational Fluid Dynamics simulation with the specified solver.");
    this.setHelpUrl("");
  }
};

/**
 * Molecular Dynamics Simulation Pattern
 * Specialized block for Molecular Dynamics simulations
 */
Blockly.Blocks['molecular_dynamics'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Molecular Dynamics Simulation");
    this.appendDummyInput()
        .appendField("name")
        .appendField(new Blockly.FieldTextInput("md_simulation"), "NAME");
    this.appendDummyInput()
        .appendField("engine")
        .appendField(new Blockly.FieldDropdown([
          ["GROMACS", "GROMACS"],
          ["LAMMPS", "LAMMPS"],
          ["NAMD", "NAMD"],
          ["AMBER", "AMBER"],
          ["custom", "CUSTOM"]
        ]), "ENGINE");
    this.appendDummyInput()
        .appendField("topology file")
        .appendField(new Blockly.FieldTextInput("topology.top"), "TOPOLOGY");
    this.appendDummyInput()
        .appendField("parameters file")
        .appendField(new Blockly.FieldTextInput("params.mdp"), "PARAMS");
    this.appendDummyInput()
        .appendField("timestep (fs)")
        .appendField(new Blockly.FieldNumber(2, 0.1), "TIMESTEP");
    this.appendDummyInput()
        .appendField("simulation time (ns)")
        .appendField(new Blockly.FieldNumber(10, 0.1), "SIM_TIME");
    this.appendDummyInput()
        .appendField("ensemble")
        .appendField(new Blockly.FieldDropdown([
          ["NVT", "NVT"],
          ["NPT", "NPT"],
          ["NVE", "NVE"],
          ["μVT", "UVT"]
        ]), "ENSEMBLE");
    
    // Add connection field that will be populated dynamically
    this.appendDummyInput()
        .appendField("using connection")
        .appendField(new Blockly.FieldDropdown(function() {
          // This function will be called whenever the dropdown needs to be rendered
          // Try to get connections from the global variable
          if (window.SimBlockFlow && window.SimBlockFlow.connections) {
            // Map connections to dropdown options
            const connOptions = window.SimBlockFlow.connections.map(conn => {
              return [conn.conn_id + " (" + conn.conn_type + ")", conn.conn_id];
            });
            
            // Always include a "none" option
            connOptions.unshift(["none (local execution)", "none"]);
            
            return connOptions.length > 1 ? connOptions : [["Add connections in Control Panel", "none"]];
          }
          return [["Add connections in Control Panel", "none"]];
        }), "CONNECTION_ID");
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Run a Molecular Dynamics simulation with the specified engine.");
    this.setHelpUrl("");
  }
};

/**
 * Machine Learning Simulation Pattern
 * Specialized block for Machine Learning workflows in simulations
 */
Blockly.Blocks['ml_simulation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("ML-Enhanced Simulation");
    this.appendDummyInput()
        .appendField("name")
        .appendField(new Blockly.FieldTextInput("ml_sim"), "NAME");
    this.appendDummyInput()
        .appendField("method")
        .appendField(new Blockly.FieldDropdown([
          ["surrogate model", "SURROGATE"],
          ["physics-informed NN", "PINN"],
          ["active learning", "ACTIVE_LEARNING"],
          ["transfer learning", "TRANSFER"],
          ["reinforcement learning", "RL"]
        ]), "METHOD");
    this.appendDummyInput()
        .appendField("model file")
        .appendField(new Blockly.FieldTextInput("ml_model.h5"), "MODEL_FILE");
    this.appendDummyInput()
        .appendField("training data")
        .appendField(new Blockly.FieldTextInput("training_data.csv"), "TRAINING_DATA");
    this.appendDummyInput()
        .appendField("validation ratio")
        .appendField(new Blockly.FieldNumber(0.2, 0, 1, 0.05), "VAL_RATIO");
    this.appendDummyInput()
        .appendField("framework")
        .appendField(new Blockly.FieldDropdown([
          ["TensorFlow", "TENSORFLOW"],
          ["PyTorch", "PYTORCH"],
          ["JAX", "JAX"],
          ["scikit-learn", "SKLEARN"]
        ]), "FRAMEWORK");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Enhance simulations with machine learning capabilities.");
    this.setHelpUrl("");
  }
};

/**
 * Visualization Block
 * Specialized block for scientific visualization of simulation results
 */
Blockly.Blocks['visualization'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Visualize Results");
    this.appendDummyInput()
        .appendField("data source")
        .appendField(new Blockly.FieldTextInput("results/*.vtu"), "DATA_SOURCE");
    this.appendDummyInput()
        .appendField("visualization tool")
        .appendField(new Blockly.FieldDropdown([
          ["ParaView", "PARAVIEW"],
          ["VisIt", "VISIT"],
          ["Matplotlib", "MATPLOTLIB"],
          ["PyVista", "PYVISTA"],
          ["custom", "CUSTOM"]
        ]), "VIZ_TOOL");
    this.appendDummyInput()
        .appendField("output format")
        .appendField(new Blockly.FieldDropdown([
          ["PNG images", "PNG"],
          ["interactive HTML", "HTML"],
          ["MP4 video", "MP4"],
          ["VTK files", "VTK"]
        ]), "OUTPUT_FORMAT");
    this.appendDummyInput()
        .appendField("output path")
        .appendField(new Blockly.FieldTextInput("viz_output/"), "OUTPUT_PATH");
    this.appendDummyInput()
        .appendField("visualization script")
        .appendField(new Blockly.FieldTextInput("viz_script.py"), "VIZ_SCRIPT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Visualize simulation results using scientific visualization tools.");
    this.setHelpUrl("");
  }
};