import * as Blockly from 'blockly';

/**
 * Result Interpretation Pattern
 * Processes the results of simulations or analyses to derive insights, generate reports, or perform aggregations
 */
Blockly.Blocks['result_interpretation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Interpret results using")
        .appendField(new Blockly.FieldDropdown([
          ["summary stats", "STATS"], 
          ["plot", "PLOT"]
        ]), "METHOD");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Post-process results (aggregate, analyze, or visualize).");
    this.setHelpUrl("");
  }
};

/**
 * Model Calibration Pattern
 * Iteratively adjusts model parameters to fit observed data
 */
Blockly.Blocks['model_calibration'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Calibrate model")
        .appendField(new Blockly.FieldTextInput("ModelName"), "MODEL");
    this.appendStatementInput("STEPS")
        .appendField("using steps");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Iteratively adjust model parameters to fit data.");
    this.setHelpUrl("");
  }
};