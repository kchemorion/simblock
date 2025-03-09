import * as Blockly from 'blockly';

/**
 * Error Handling Pattern
 * Defines how to handle errors in the workflow
 */
Blockly.Blocks['error_handling'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Error Handling");
    this.appendDummyInput()
        .appendField("for")
        .appendField(new Blockly.FieldTextInput("task_name"), "TASK_NAME");
    this.appendDummyInput()
        .appendField("on error")
        .appendField(new Blockly.FieldDropdown([
          ["retry", "RETRY"],
          ["skip", "SKIP"],
          ["fail workflow", "FAIL"],
          ["use fallback", "FALLBACK"],
          ["alert and continue", "ALERT"]
        ]), "ERROR_ACTION");
    this.appendDummyInput()
        .appendField("max retries")
        .appendField(new Blockly.FieldNumber(3, 0), "MAX_RETRIES");
    this.appendDummyInput()
        .appendField("retry delay (seconds)")
        .appendField(new Blockly.FieldNumber(60, 0), "RETRY_DELAY");
    this.appendDummyInput()
        .appendField("timeout (seconds)")
        .appendField(new Blockly.FieldNumber(3600, 0), "TIMEOUT");
    this.appendDummyInput()
        .appendField("alert email")
        .appendField(new Blockly.FieldTextInput("user@example.com"), "ALERT_EMAIL");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Define error handling strategy for tasks.");
    this.setHelpUrl("");
  }
};

/**
 * Conditional Branch Pattern
 * Implements conditional branching in the workflow
 */
Blockly.Blocks['conditional_branch'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("If");
    this.appendDummyInput()
        .appendField("condition type")
        .appendField(new Blockly.FieldDropdown([
          ["file exists", "FILE_EXISTS"],
          ["variable is", "VARIABLE_IS"],
          ["task status", "TASK_STATUS"],
          ["custom condition", "CUSTOM"]
        ]), "CONDITION_TYPE");
    this.appendDummyInput()
        .appendField("condition value")
        .appendField(new Blockly.FieldTextInput("condition.txt"), "CONDITION_VALUE");
    this.appendDummyInput()
        .appendField("operator")
        .appendField(new Blockly.FieldDropdown([
          ["equals", "EQ"],
          ["not equals", "NEQ"],
          ["greater than", "GT"],
          ["less than", "LT"],
          ["contains", "CONTAINS"],
          ["starts with", "STARTSWITH"],
          ["ends with", "ENDSWITH"]
        ]), "OPERATOR");
    this.appendDummyInput()
        .appendField("comparison value")
        .appendField(new Blockly.FieldTextInput("value"), "COMPARISON_VALUE");
    this.appendStatementInput("THEN")
        .appendField("then");
    this.appendStatementInput("ELSE")
        .appendField("else");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Create a conditional branch in the workflow.");
    this.setHelpUrl("");
  }
};

/**
 * Parallel Execution Pattern
 * Executes multiple tasks in parallel
 */
Blockly.Blocks['parallel_execution'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Parallel Execution");
    this.appendDummyInput()
        .appendField("max parallel tasks")
        .appendField(new Blockly.FieldNumber(4, 1), "MAX_PARALLEL");
    this.appendDummyInput()
        .appendField("failure strategy")
        .appendField(new Blockly.FieldDropdown([
          ["continue other branches", "CONTINUE"],
          ["fail all", "FAIL_ALL"],
          ["wait for all to complete", "WAIT_ALL"]
        ]), "FAILURE_STRATEGY");
    this.appendStatementInput("BRANCHES")
        .appendField("branches");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Execute multiple tasks in parallel.");
    this.setHelpUrl("");
  }
};

/**
 * Workflow Trigger Pattern
 * Defines when the workflow should be triggered
 */
Blockly.Blocks['workflow_trigger'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Workflow Trigger");
    this.appendDummyInput()
        .appendField("trigger type")
        .appendField(new Blockly.FieldDropdown([
          ["scheduled", "SCHEDULED"],
          ["event-based", "EVENT"],
          ["manual", "MANUAL"],
          ["sensor", "SENSOR"],
          ["webhook", "WEBHOOK"],
          ["completed workflow", "WORKFLOW_COMPLETION"]
        ]), "TRIGGER_TYPE");
    this.appendDummyInput()
        .appendField("schedule/event")
        .appendField(new Blockly.FieldTextInput("0 0 * * *"), "SCHEDULE");
    this.appendDummyInput()
        .appendField("description")
        .appendField(new Blockly.FieldTextInput("Run daily at midnight"), "DESCRIPTION");
    this.appendDummyInput()
        .appendField("enabled")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "ENABLED");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Define when the workflow should be triggered.");
    this.setHelpUrl("");
  }
};

/**
 * Retry Strategy Pattern
 * Defines retry behavior for tasks
 */
Blockly.Blocks['retry_strategy'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Retry Strategy");
    this.appendDummyInput()
        .appendField("for task")
        .appendField(new Blockly.FieldTextInput("task_name"), "TASK_NAME");
    this.appendDummyInput()
        .appendField("max retries")
        .appendField(new Blockly.FieldNumber(3, 0), "MAX_RETRIES");
    this.appendDummyInput()
        .appendField("retry delay (seconds)")
        .appendField(new Blockly.FieldNumber(60, 0), "RETRY_DELAY");
    this.appendDummyInput()
        .appendField("delay factor")
        .appendField(new Blockly.FieldNumber(2, 1), "DELAY_FACTOR");
    this.appendDummyInput()
        .appendField("retry on")
        .appendField(new Blockly.FieldDropdown([
          ["any error", "ANY"],
          ["connection errors", "CONNECTION"],
          ["timeout errors", "TIMEOUT"],
          ["specific error codes", "SPECIFIC"]
        ]), "RETRY_ON");
    this.appendDummyInput()
        .appendField("specific error codes")
        .appendField(new Blockly.FieldTextInput("500,502,503"), "ERROR_CODES");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Define retry behavior for workflow tasks.");
    this.setHelpUrl("");
  }
};

/**
 * Notification Pattern
 * Sends notifications at various workflow stages
 */
Blockly.Blocks['notification'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Notification");
    this.appendDummyInput()
        .appendField("trigger on")
        .appendField(new Blockly.FieldDropdown([
          ["workflow start", "START"],
          ["workflow success", "SUCCESS"],
          ["workflow failure", "FAILURE"],
          ["task completion", "TASK_COMPLETE"],
          ["task failure", "TASK_FAILURE"],
          ["custom condition", "CUSTOM"]
        ]), "TRIGGER_ON");
    this.appendDummyInput()
        .appendField("notification method")
        .appendField(new Blockly.FieldDropdown([
          ["email", "EMAIL"],
          ["Slack", "SLACK"],
          ["MS Teams", "TEAMS"],
          ["webhook", "WEBHOOK"],
          ["SMS", "SMS"]
        ]), "METHOD");
    this.appendDummyInput()
        .appendField("recipients")
        .appendField(new Blockly.FieldTextInput("user@example.com"), "RECIPIENTS");
    this.appendDummyInput()
        .appendField("message template")
        .appendField(new Blockly.FieldTextInput("Workflow {{workflow_id}} {{status}}"), "MESSAGE");
    this.appendDummyInput()
        .appendField("include details")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "INCLUDE_DETAILS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Send notifications at various workflow stages.");
    this.setHelpUrl("");
  }
};

/**
 * Task Dependency Pattern
 * Defines dependencies between tasks
 */
Blockly.Blocks['task_dependency'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Task Dependency");
    this.appendDummyInput()
        .appendField("task")
        .appendField(new Blockly.FieldTextInput("task_name"), "TASK_NAME");
    this.appendDummyInput()
        .appendField("depends on tasks")
        .appendField(new Blockly.FieldTextInput("task1,task2"), "DEPENDENCIES");
    this.appendDummyInput()
        .appendField("dependency type")
        .appendField(new Blockly.FieldDropdown([
          ["all must succeed", "ALL_SUCCESS"],
          ["all done", "ALL_DONE"],
          ["one must succeed", "ONE_SUCCESS"],
          ["none failed", "NONE_FAILED"],
          ["custom trigger rule", "CUSTOM"]
        ]), "DEPENDENCY_TYPE");
    this.appendDummyInput()
        .appendField("wait timeout (seconds)")
        .appendField(new Blockly.FieldNumber(3600, 0), "WAIT_TIMEOUT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Define dependencies between workflow tasks.");
    this.setHelpUrl("");
  }
};