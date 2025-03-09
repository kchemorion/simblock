import * as Blockly from 'blockly';

// Make sure Blockly is properly loaded
if (typeof Blockly === 'undefined' || !Blockly.Blocks) {
  console.error('Blockly is not properly loaded!');
} else {
  console.log('Blockly is properly loaded, defining blocks...');
}

// Basic simulation execution block definition
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
    
    // Dropdown for platform
    this.appendDummyInput()
        .appendField("on platform")
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