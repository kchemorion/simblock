# Simulation Execution Pattern

## Description

The **Simulation Execution** pattern represents running a single simulation or model execution with a given set of parameters. This is a fundamental pattern for scientific workflows, allowing you to execute simulation software with specific configurations.

### When to Use

Use this pattern when you need to:
- Run a computational simulation with a specific configuration
- Execute a model with predefined parameters
- Perform a single run of a simulation program as part of a larger workflow

## Block Interface

The Simulation Execution block has the following configuration options:

- **Simulation Name**: A unique identifier for this simulation run
- **Config File**: Path to the configuration file for the simulation
- **Output Directory** (optional): Directory where simulation outputs will be stored
- **Timeout** (optional): Maximum execution time in seconds

### Block Preview

```
┌────────────────────────────────────────────────────┐
│ Run Simulation [simulation_name]                   │
│ with config [config.yaml]                          │
│ output to [/path/to/output]                        │
│ timeout [3600] seconds                             │
└────────────────────────────────────────────────────┘
```

## Block Implementation

### Block Definition (JavaScript)

```javascript
Blockly.Blocks['simulation_execution'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Run Simulation")
        .appendField(new Blockly.FieldTextInput("simulation_name"), "SIM_NAME")
        .appendField("with config")
        .appendField(new Blockly.FieldTextInput("config.yaml"), "CONFIG_FILE");
    this.appendDummyInput()
        .appendField("output to")
        .appendField(new Blockly.FieldTextInput("/path/to/output"), "OUTPUT_DIR");
    this.appendDummyInput()
        .appendField("timeout")
        .appendField(new Blockly.FieldNumber(3600, 0), "TIMEOUT")
        .appendField("seconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Execute a simulation with the given configuration.");
    this.setHelpUrl("");
  }
};
```

### Code Generator (JavaScript)

```javascript
pythonGenerator['simulation_execution'] = function(block) {
  const simName = block.getFieldValue('SIM_NAME');
  const config = block.getFieldValue('CONFIG_FILE');
  const outputDir = block.getFieldValue('OUTPUT_DIR');
  const timeout = block.getFieldValue('TIMEOUT');
  
  // Generate an Airflow task using the SimulationOperator
  const code = `
# Task: Simulation Execution - ${simName}
${simName}_task = SimulationOperator(
    task_id='simulate_${simName}',
    simulation_command='run_simulation.sh',
    config_file='${config}',
    output_dir='${outputDir}',
    timeout=${timeout},
    dag=dag,
)
`;
  
  // For basic mode, generate a BashOperator instead
  const basicCode = `
# Task: Simulation Execution - ${simName}
${simName}_task = BashOperator(
    task_id='simulate_${simName}',
    bash_command='run_simulation.sh --config ${config} --output-dir ${outputDir}',
    execution_timeout=timedelta(seconds=${timeout}),
    dag=dag,
)
`;
  
  return code;
};
```

## Generated Airflow Code

The pattern generates code for a custom `SimulationOperator` (for advanced usage) or a `BashOperator` (for basic usage):

```python
# Task: Simulation Execution - climate_model
climate_model_task = SimulationOperator(
    task_id='simulate_climate_model',
    simulation_command='run_simulation.sh',
    config_file='climate_params.yaml',
    output_dir='/data/climate/outputs',
    timeout=7200,
    dag=dag,
)
```

### Custom Operator Implementation

The custom SimulationOperator provides advanced features like monitoring and checkpoint management:

```python
class SimulationOperator(BaseOperator):
    """
    Operator that executes simulation software with the specified configuration.
    
    This operator provides specialized handling for simulation software including:
    - Resource monitoring
    - Configurable timeout handling
    - Simulation output parsing
    - Automatic checkpoint/restart capabilities
    """
    
    @apply_defaults
    def __init__(
        self,
        simulation_command,
        config_file,
        output_dir,
        timeout=3600,
        checkpoint_interval=300,
        *args,
        **kwargs
    ):
        super(SimulationOperator, self).__init__(*args, **kwargs)
        self.simulation_command = simulation_command
        self.config_file = config_file
        self.output_dir = output_dir
        self.timeout = timeout
        self.checkpoint_interval = checkpoint_interval
    
    def execute(self, context):
        """
        Execute the simulation command
        """
        logging.info(f"Executing simulation with config: {self.config_file}")
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Construct full command
        cmd = f"{self.simulation_command} --config {self.config_file} --output-dir {self.output_dir}"
        
        try:
            # Execute the command with a timeout
            process = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            
            if process.returncode != 0:
                logging.error(f"Simulation failed with return code {process.returncode}")
                logging.error(f"Error output: {process.stderr}")
                raise Exception(f"Simulation failed with return code {process.returncode}")
            
            logging.info(f"Simulation completed successfully")
            
            # Parse output for results
            results = self._parse_simulation_output(process.stdout)
            
            return results
            
        except subprocess.TimeoutExpired:
            logging.error(f"Simulation timed out after {self.timeout} seconds")
            raise Exception(f"Simulation timed out after {self.timeout} seconds")
```

## Examples

### Example 1: Basic Climate Model Simulation

```
[Data Transfer] → [Simulation Execution] → [Result Interpretation]
```

This simple workflow transfers input data, runs a climate simulation, and interprets the results.

### Example 2: Sequential Simulations with Different Configurations

```
[Simulation Execution: Initial Run] → [Simulation Execution: Refined Run] → [Result Comparison]
```

This workflow runs an initial simulation, followed by a refined simulation using insights from the first run.

## Best Practices

1. **Timeouts**: Always set appropriate timeouts based on expected running time.
2. **Error Handling**: The operator will capture and log errors, but consider adding downstream error handling.
3. **Resource Management**: For resource-intensive simulations, consider using the Resource Allocation pattern in conjunction.
4. **Output Management**: Use consistent output directory structures to organize simulation results.
5. **Configuration Management**: Store configuration files in version control and reference specific versions.

## Related Patterns

- [Parameter Sweep](parameter_sweep.md) - For running multiple simulations with varying parameters
- [Model Calibration](model_calibration.md) - For iteratively tuning model parameters
- [Convergence Loop](convergence_loop.md) - For iterative simulations that run until convergence
- [Resource Allocation](../infrastructure/resource_allocation.md) - For managing computational resources
- [Error Handling](../workflow/error_handling.md) - For robust error management