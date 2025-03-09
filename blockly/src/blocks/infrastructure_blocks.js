import * as Blockly from 'blockly';

/**
 * Container Execution Pattern
 * Executes tasks within a container
 */
Blockly.Blocks['container_execution'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Container Execution");
    this.appendDummyInput()
        .appendField("container image")
        .appendField(new Blockly.FieldTextInput("python:3.9"), "CONTAINER_IMAGE");
    this.appendDummyInput()
        .appendField("command")
        .appendField(new Blockly.FieldTextInput("python script.py"), "COMMAND");
    this.appendDummyInput()
        .appendField("environment")
        .appendField(new Blockly.FieldDropdown([
          ["Docker", "DOCKER"],
          ["Kubernetes", "K8S"],
          ["AWS ECS", "ECS"],
          ["Azure Container Instances", "ACI"],
          ["Google Cloud Run", "GCR"]
        ]), "ENVIRONMENT");
    this.appendDummyInput()
        .appendField("CPU limit")
        .appendField(new Blockly.FieldNumber(1, 0.1), "CPU_LIMIT");
    this.appendDummyInput()
        .appendField("memory limit (GB)")
        .appendField(new Blockly.FieldNumber(2, 0.1), "MEMORY_LIMIT");
    this.appendDummyInput()
        .appendField("volumes")
        .appendField(new Blockly.FieldTextInput("/host/path:/container/path"), "VOLUMES");
    this.appendDummyInput()
        .appendField("environment variables")
        .appendField(new Blockly.FieldTextInput("KEY1=VALUE1,KEY2=VALUE2"), "ENV_VARS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Execute tasks within a container environment.");
    this.setHelpUrl("");
  }
};

/**
 * Resource Allocation Pattern
 * Allocates compute resources for tasks
 */
Blockly.Blocks['resource_allocation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Resource Allocation");
    this.appendDummyInput()
        .appendField("resource type")
        .appendField(new Blockly.FieldDropdown([
          ["CPU", "CPU"],
          ["GPU", "GPU"],
          ["Memory", "MEMORY"],
          ["Storage", "STORAGE"],
          ["Network", "NETWORK"]
        ]), "RESOURCE_TYPE");
    this.appendDummyInput()
        .appendField("amount")
        .appendField(new Blockly.FieldNumber(1, 0.1), "AMOUNT");
    this.appendDummyInput()
        .appendField("allocation strategy")
        .appendField(new Blockly.FieldDropdown([
          ["fixed", "FIXED"],
          ["dynamic", "DYNAMIC"],
          ["auto-scaling", "AUTO"],
          ["spot instances", "SPOT"]
        ]), "STRATEGY");
        
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
        
    this.appendDummyInput()
        .appendField("instance/machine type")
        .appendField(new Blockly.FieldTextInput("m5.xlarge"), "INSTANCE_TYPE");
    this.appendDummyInput()
        .appendField("timeout (minutes)")
        .appendField(new Blockly.FieldNumber(60, 1), "TIMEOUT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Allocate compute resources for workflow tasks using a connection defined in the Control Panel.");
    this.setHelpUrl("");
  }
};

/**
 * Distributed Computing Pattern
 * Sets up distributed computing for tasks
 */
Blockly.Blocks['distributed_computing'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Distributed Computing");
    this.appendDummyInput()
        .appendField("framework")
        .appendField(new Blockly.FieldDropdown([
          ["Dask", "DASK"],
          ["Spark", "SPARK"],
          ["Ray", "RAY"],
          ["MPI", "MPI"],
          ["custom", "CUSTOM"]
        ]), "FRAMEWORK");
    this.appendDummyInput()
        .appendField("cluster size")
        .appendField(new Blockly.FieldNumber(4, 1), "CLUSTER_SIZE");
    this.appendDummyInput()
        .appendField("worker resources")
        .appendField(new Blockly.FieldDropdown([
          ["small", "SMALL"],
          ["medium", "MEDIUM"],
          ["large", "LARGE"],
          ["gpu", "GPU"],
          ["custom", "CUSTOM"]
        ]), "WORKER_RESOURCES");
    this.appendDummyInput()
        .appendField("scaling")
        .appendField(new Blockly.FieldDropdown([
          ["fixed", "FIXED"],
          ["auto-scaling", "AUTO"],
          ["manual", "MANUAL"]
        ]), "SCALING");
    this.appendDummyInput()
        .appendField("task script")
        .appendField(new Blockly.FieldTextInput("distributed_task.py"), "TASK_SCRIPT");
    this.appendDummyInput()
        .appendField("communication pattern")
        .appendField(new Blockly.FieldDropdown([
          ["map-reduce", "MAP_REDUCE"],
          ["parameter server", "PARAM_SERVER"],
          ["all-reduce", "ALL_REDUCE"],
          ["peer-to-peer", "P2P"]
        ]), "COMM_PATTERN");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Set up distributed computing for tasks.");
    this.setHelpUrl("");
  }
};

/**
 * Environment Setup Pattern
 * Prepares the execution environment
 */
Blockly.Blocks['environment_setup'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Environment Setup");
    this.appendDummyInput()
        .appendField("environment type")
        .appendField(new Blockly.FieldDropdown([
          ["virtual environment", "VENV"],
          ["container", "CONTAINER"],
          ["VM", "VM"],
          ["bare metal", "BARE_METAL"],
          ["managed service", "MANAGED"]
        ]), "ENV_TYPE");
    this.appendDummyInput()
        .appendField("setup script")
        .appendField(new Blockly.FieldTextInput("setup.sh"), "SETUP_SCRIPT");
    this.appendDummyInput()
        .appendField("dependencies")
        .appendField(new Blockly.FieldTextInput("requirements.txt"), "DEPENDENCIES");
    this.appendDummyInput()
        .appendField("environment variables")
        .appendField(new Blockly.FieldTextInput("KEY1=VALUE1,KEY2=VALUE2"), "ENV_VARS");
    this.appendDummyInput()
        .appendField("cleanup on completion")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "CLEANUP");
    this.appendDummyInput()
        .appendField("persist between runs")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "PERSIST");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Prepare the execution environment.");
    this.setHelpUrl("");
  }
};

/**
 * Data Storage Configuration Pattern
 * Configures data storage for the workflow
 */
Blockly.Blocks['data_storage_config'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Data Storage Configuration");
    this.appendDummyInput()
        .appendField("storage type")
        .appendField(new Blockly.FieldDropdown([
          ["local filesystem", "LOCAL"],
          ["object storage", "OBJECT"],
          ["distributed filesystem", "DIST_FS"],
          ["database", "DB"],
          ["block storage", "BLOCK"]
        ]), "STORAGE_TYPE");
    this.appendDummyInput()
        .appendField("provider")
        .appendField(new Blockly.FieldDropdown([
          ["local", "LOCAL"],
          ["AWS S3", "S3"],
          ["Azure Blob", "AZURE_BLOB"],
          ["Google Cloud Storage", "GCS"],
          ["HDFS", "HDFS"],
          ["NFS", "NFS"]
        ]), "PROVIDER");
    this.appendDummyInput()
        .appendField("location/URL")
        .appendField(new Blockly.FieldTextInput("s3://bucket/path"), "LOCATION");
    this.appendDummyInput()
        .appendField("access credentials")
        .appendField(new Blockly.FieldTextInput("credentials.json"), "CREDENTIALS");
    this.appendDummyInput()
        .appendField("mount point (if applicable)")
        .appendField(new Blockly.FieldTextInput("/mnt/data"), "MOUNT_POINT");
    this.appendDummyInput()
        .appendField("lifecycle policy")
        .appendField(new Blockly.FieldDropdown([
          ["keep forever", "KEEP"],
          ["delete after workflow", "DELETE"],
          ["archive after 30 days", "ARCHIVE"],
          ["custom policy", "CUSTOM"]
        ]), "LIFECYCLE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Configure data storage for the workflow.");
    this.setHelpUrl("");
  }
};

/**
 * Network Configuration Pattern
 * Configures network settings for the workflow
 */
Blockly.Blocks['network_config'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Network Configuration");
    this.appendDummyInput()
        .appendField("network type")
        .appendField(new Blockly.FieldDropdown([
          ["public internet", "PUBLIC"],
          ["private network", "PRIVATE"],
          ["VPN", "VPN"],
          ["isolated", "ISOLATED"]
        ]), "NETWORK_TYPE");
    this.appendDummyInput()
        .appendField("bandwidth requirement")
        .appendField(new Blockly.FieldDropdown([
          ["low", "LOW"],
          ["medium", "MEDIUM"],
          ["high", "HIGH"],
          ["ultra-high", "ULTRA"]
        ]), "BANDWIDTH");
    this.appendDummyInput()
        .appendField("firewall rules")
        .appendField(new Blockly.FieldTextInput("allow:80,443;deny:all"), "FIREWALL");
    this.appendDummyInput()
        .appendField("DNS configuration")
        .appendField(new Blockly.FieldTextInput("use-default"), "DNS");
    this.appendDummyInput()
        .appendField("security level")
        .appendField(new Blockly.FieldDropdown([
          ["standard", "STANDARD"],
          ["encrypted", "ENCRYPTED"],
          ["high-security", "HIGH_SEC"],
          ["custom", "CUSTOM"]
        ]), "SECURITY");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Configure network settings for the workflow.");
    this.setHelpUrl("");
  }
};