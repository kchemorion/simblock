import * as Blockly from 'blockly';

/**
 * Simulation Execution Pattern
 * Represents running a simulation with given parameters
 */
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
    this.appendDummyInput()
        .appendField("on")
        .appendField(new Blockly.FieldDropdown([
          ["local machine", "LOCAL"],
          ["HPC cluster", "HPC"],
          ["cloud (AWS)", "AWS"],
          ["cloud (Azure)", "AZURE"],
          ["cloud (GCP)", "GCP"]
        ]), "PLATFORM");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Execute a simulation with the given configuration.");
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