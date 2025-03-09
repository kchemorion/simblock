import * as Blockly from 'blockly';

/**
 * Data Transfer Pattern
 * Moves or copies data from one location to another
 */
Blockly.Blocks['data_transfer'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Transfer data");
    this.appendDummyInput()
        .appendField("source type")
        .appendField(new Blockly.FieldDropdown([
          ["local filesystem", "LOCAL"],
          ["remote server (ssh/sftp)", "REMOTE"],
          ["S3 bucket", "S3"],
          ["Azure Blob Storage", "AZURE"],
          ["Google Cloud Storage", "GCS"],
          ["HDFS", "HDFS"],
          ["HTTP/HTTPS URL", "HTTP"],
          ["FTP server", "FTP"],
          ["database", "DB"]
        ]), "SRC_TYPE");
    this.appendDummyInput()
        .appendField("source path")
        .appendField(new Blockly.FieldTextInput("/path/or/URI"), "SRC");
    this.appendDummyInput()
        .appendField("destination type")
        .appendField(new Blockly.FieldDropdown([
          ["local filesystem", "LOCAL"],
          ["remote server (ssh/sftp)", "REMOTE"],
          ["S3 bucket", "S3"],
          ["Azure Blob Storage", "AZURE"],
          ["Google Cloud Storage", "GCS"],
          ["HDFS", "HDFS"],
          ["FTP server", "FTP"],
          ["database", "DB"]
        ]), "DEST_TYPE");
    this.appendDummyInput()
        .appendField("destination path")
        .appendField(new Blockly.FieldTextInput("/path/or/URI"), "DEST");
    this.appendDummyInput()
        .appendField("transfer mode")
        .appendField(new Blockly.FieldDropdown([
          ["copy", "COPY"],
          ["move", "MOVE"],
          ["sync", "SYNC"]
        ]), "MODE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Transfer data from source to destination.");
    this.setHelpUrl("");
  }
};

/**
 * ETL Process Pattern (Extract, Transform, Load)
 * Encapsulates a data pipeline step
 */
Blockly.Blocks['etl_process'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("ETL Process");
    this.appendDummyInput()
        .appendField("source format")
        .appendField(new Blockly.FieldDropdown([
          ["CSV", "CSV"],
          ["JSON", "JSON"],
          ["Parquet", "PARQUET"],
          ["HDF5", "HDF5"],
          ["NetCDF", "NETCDF"],
          ["SQL Database", "SQL"],
          ["Excel", "EXCEL"],
          ["XML", "XML"],
          ["Text", "TEXT"]
        ]), "SOURCE_FORMAT");
    this.appendDummyInput()
        .appendField("source path")
        .appendField(new Blockly.FieldTextInput("source.csv"), "SOURCE");
    this.appendDummyInput()
        .appendField("target format")
        .appendField(new Blockly.FieldDropdown([
          ["CSV", "CSV"],
          ["JSON", "JSON"],
          ["Parquet", "PARQUET"],
          ["HDF5", "HDF5"],
          ["NetCDF", "NETCDF"],
          ["SQL Database", "SQL"],
          ["Excel", "EXCEL"],
          ["XML", "XML"],
          ["Text", "TEXT"]
        ]), "TARGET_FORMAT");
    this.appendDummyInput()
        .appendField("target path")
        .appendField(new Blockly.FieldTextInput("target.db"), "TARGET");
    this.appendDummyInput()
        .appendField("transformation")
        .appendField(new Blockly.FieldDropdown([
          ["filtering", "FILTER"],
          ["aggregation", "AGGREGATE"],
          ["joining", "JOIN"],
          ["sorting", "SORT"],
          ["custom script", "CUSTOM"]
        ]), "TRANSFORM_TYPE");
    this.appendDummyInput()
        .appendField("custom script (optional)")
        .appendField(new Blockly.FieldTextInput("transform.py"), "TRANSFORM_SCRIPT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Extract, transform, and load data from source to target.");
    this.setHelpUrl("");
  }
};

/**
 * Data Validation Pattern
 * Checks data quality or integrity constraints
 */
Blockly.Blocks['data_validation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Validate Data");
    this.appendDummyInput()
        .appendField("data format")
        .appendField(new Blockly.FieldDropdown([
          ["CSV", "CSV"],
          ["JSON", "JSON"],
          ["Parquet", "PARQUET"],
          ["HDF5", "HDF5"],
          ["NetCDF", "NETCDF"],
          ["SQL Database", "SQL"],
          ["Excel", "EXCEL"],
          ["XML", "XML"],
          ["Text", "TEXT"]
        ]), "DATA_FORMAT");
    this.appendDummyInput()
        .appendField("data path")
        .appendField(new Blockly.FieldTextInput("/path/to/data"), "DATA_PATH");
    this.appendDummyInput()
        .appendField("validation rules")
        .appendField(new Blockly.FieldDropdown([
          ["completeness check", "COMPLETENESS"],
          ["range validation", "RANGE"],
          ["consistency check", "CONSISTENCY"],
          ["schema validation", "SCHEMA"],
          ["custom validation", "CUSTOM"]
        ]), "VALIDATION_TYPE");
    this.appendDummyInput()
        .appendField("validation schema/script")
        .appendField(new Blockly.FieldTextInput("validation.json"), "VALIDATION_SCHEMA");
    this.appendDummyInput()
        .appendField("on failure")
        .appendField(new Blockly.FieldDropdown([
          ["fail workflow", "FAIL"],
          ["continue with warning", "WARN"],
          ["skip invalid records", "SKIP"],
          ["attempt repair", "REPAIR"]
        ]), "ON_FAILURE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Validate data quality and integrity.");
    this.setHelpUrl("");
  }
};

/**
 * Data Transformation Pattern
 * Applies transformations to datasets
 */
Blockly.Blocks['data_transformation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Transform Data");
    this.appendDummyInput()
        .appendField("input data")
        .appendField(new Blockly.FieldTextInput("input.csv"), "INPUT");
    this.appendDummyInput()
        .appendField("output data")
        .appendField(new Blockly.FieldTextInput("output.csv"), "OUTPUT");
    this.appendDummyInput()
        .appendField("transformation type")
        .appendField(new Blockly.FieldDropdown([
          ["normalization", "NORMALIZE"],
          ["standardization", "STANDARDIZE"],
          ["outlier removal", "OUTLIER"],
          ["feature engineering", "FEATURE_ENG"],
          ["dimension reduction", "DIM_REDUCTION"],
          ["custom transformation", "CUSTOM"]
        ]), "TRANSFORM_TYPE");
    this.appendDummyInput()
        .appendField("parameters")
        .appendField(new Blockly.FieldTextInput("{}"), "PARAMETERS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Apply transformations to datasets.");
    this.setHelpUrl("");
  }
};

/**
 * Data Integration Pattern
 * Combines data from multiple sources
 */
Blockly.Blocks['data_integration'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Data Integration");
    this.appendDummyInput()
        .appendField("integration method")
        .appendField(new Blockly.FieldDropdown([
          ["merge", "MERGE"],
          ["join", "JOIN"],
          ["concatenate", "CONCAT"],
          ["union", "UNION"]
        ]), "INTEGRATION_METHOD");
    this.appendDummyInput()
        .appendField("primary dataset")
        .appendField(new Blockly.FieldTextInput("data1.csv"), "PRIMARY_DATASET");
    this.appendDummyInput()
        .appendField("secondary datasets")
        .appendField(new Blockly.FieldTextInput("data2.csv,data3.csv"), "SECONDARY_DATASETS");
    this.appendDummyInput()
        .appendField("output dataset")
        .appendField(new Blockly.FieldTextInput("integrated.csv"), "OUTPUT");
    this.appendDummyInput()
        .appendField("join key (for joins)")
        .appendField(new Blockly.FieldTextInput("id"), "JOIN_KEY");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Integrate data from multiple sources.");
    this.setHelpUrl("");
  }
};

/**
 * Data Cataloging Pattern
 * Maintains metadata about datasets
 */
Blockly.Blocks['data_catalog'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Catalog Data");
    this.appendDummyInput()
        .appendField("catalog action")
        .appendField(new Blockly.FieldDropdown([
          ["register dataset", "REGISTER"],
          ["update metadata", "UPDATE"],
          ["search catalog", "SEARCH"],
          ["retrieve metadata", "RETRIEVE"]
        ]), "CATALOG_ACTION");
    this.appendDummyInput()
        .appendField("dataset path")
        .appendField(new Blockly.FieldTextInput("/path/to/dataset"), "DATASET_PATH");
    this.appendDummyInput()
        .appendField("catalog system")
        .appendField(new Blockly.FieldDropdown([
          ["local catalog", "LOCAL"],
          ["Apache Atlas", "ATLAS"],
          ["AWS Glue", "GLUE"],
          ["custom catalog", "CUSTOM"]
        ]), "CATALOG_SYSTEM");
    this.appendDummyInput()
        .appendField("metadata parameters")
        .appendField(new Blockly.FieldTextInput("{}"), "METADATA");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Register and maintain metadata about datasets.");
    this.setHelpUrl("");
  }
};

/**
 * Data Visualization Pattern
 * Creates visualizations from data
 */
Blockly.Blocks['data_visualization'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Visualize Data");
    this.appendDummyInput()
        .appendField("input data")
        .appendField(new Blockly.FieldTextInput("data.csv"), "INPUT_DATA");
    this.appendDummyInput()
        .appendField("visualization type")
        .appendField(new Blockly.FieldDropdown([
          ["line chart", "LINE"],
          ["bar chart", "BAR"],
          ["scatter plot", "SCATTER"],
          ["heatmap", "HEATMAP"],
          ["contour plot", "CONTOUR"],
          ["3D plot", "3D"],
          ["custom", "CUSTOM"]
        ]), "VIZ_TYPE");
    this.appendDummyInput()
        .appendField("x variable")
        .appendField(new Blockly.FieldTextInput("x"), "X_VAR");
    this.appendDummyInput()
        .appendField("y variable")
        .appendField(new Blockly.FieldTextInput("y"), "Y_VAR");
    this.appendDummyInput()
        .appendField("output file")
        .appendField(new Blockly.FieldTextInput("plot.png"), "OUTPUT_FILE");
    this.appendDummyInput()
        .appendField("additional parameters")
        .appendField(new Blockly.FieldTextInput("{}"), "PARAMETERS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Create visualizations from data.");
    this.setHelpUrl("");
  }
};