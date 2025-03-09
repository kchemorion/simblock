# Parameter Sweep Pattern

## Description

The **Parameter Sweep** pattern executes a simulation or analysis multiple times, each with a different set of parameter values from a predefined range. This pattern enables systematic exploration of parameter spaces to understand how parameter values affect outputs.

### When to Use

Use this pattern when you need to:
- Explore how a model responds to different input parameters
- Run the same process with many different configurations
- Conduct sensitivity analysis across a parameter space
- Perform hyperparameter optimization for models
- Execute embarrassingly parallel workloads

## Block Interface

The Parameter Sweep block has the following configuration options:

- **Parameter Name**: The name of the parameter to vary
- **Parameter Range**: The range of values to explore (format: "start..end", "start..end..step", or comma-separated values)
- **Parameter Type**: Type of parameter (numeric, string, etc.)
- **Parallel Execution**: Whether to run iterations in parallel (if supported)
- **Sub-workflow**: The workflow steps to execute for each parameter value (inside the loop block)

### Block Preview

```
┌───────────────────────────────────────────┐
│ For each [param] in range [1..10..2]      │
├───────────────────────────────────────────┤
│ [Sub-workflow blocks go here]              │
│                                           │
└───────────────────────────────────────────┘
```

## Block Implementation

### Block Definition (JavaScript)

```javascript
Blockly.Blocks['parameter_sweep'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("For each")
        .appendField(new Blockly.FieldVariable("param"), "PARAM_VAR")
        .appendField("in range")
        .appendField(new Blockly.FieldTextInput("1..10"), "PARAM_RANGE");
    this.appendDummyInput()
        .appendField("parameter type")
        .appendField(new Blockly.FieldDropdown([
            ["numeric", "NUMERIC"],
            ["string", "STRING"],
            ["boolean", "BOOLEAN"]
        ]), "PARAM_TYPE");
    this.appendDummyInput()
        .appendField("execute in parallel")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "PARALLEL");
    this.appendStatementInput("DO")
        .appendField("do");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Sweep through a range of parameter values and execute enclosed steps for each value.");
    this.setHelpUrl("");
  }
};
```

### Code Generator (JavaScript)

```javascript
pythonGenerator['parameter_sweep'] = function(block) {
  const paramVar = Blockly.Python.variableDB_.getName(
      block.getFieldValue('PARAM_VAR'),
      Blockly.Variables.NAME_TYPE);
  
  const rangeStr = block.getFieldValue('PARAM_RANGE');
  const paramType = block.getFieldValue('PARAM_TYPE');
  const parallel = block.getFieldValue('PARALLEL') === 'TRUE';
  
  // Parse range string
  let rangeCode = '';
  if (rangeStr.includes('..')) {
    // Format: start..end or start..end..step
    const parts = rangeStr.split('..');
    if (parts.length === 2) {
      const start = parts[0].trim();
      const end = parts[1].trim();
      rangeCode = `range(${start}, ${parseInt(end) + 1})`;
    } else if (parts.length === 3) {
      const start = parts[0].trim();
      const end = parts[1].trim();
      const step = parts[2].trim();
      rangeCode = `range(${start}, ${parseInt(end) + 1}, ${step})`;
    }
  } else if (rangeStr.includes(',')) {
    // Format: val1, val2, val3
    if (paramType === 'NUMERIC') {
      rangeCode = `[${rangeStr}]`;
    } else {
      // For strings, ensure proper quoting
      const values = rangeStr.split(',').map(s => s.trim());
      const quotedValues = values.map(s => `"${s}"`).join(', ');
      rangeCode = `[${quotedValues}]`;
    }
  }

  // Get the code for the inner blocks
  const innerCode = pythonGenerator.statementToCode(block, 'DO');
  
  // Generate a task group for the parameter sweep
  let code = '';
  
  if (parallel) {
    // Parallel execution using TaskGroups
    code = `
# Parameter Sweep - Parallel Execution
with TaskGroup(group_id="param_sweep_${paramVar}") as param_sweep_group:
    for ${paramVar} in ${rangeCode}:
        with TaskGroup(group_id=f"param_sweep_${paramVar}_{${paramVar}}") as param_group_${paramVar}:
${pythonGenerator.prefixLines(innerCode, '            ')}

`;
  } else {
    // Sequential execution
    code = `
# Parameter Sweep - Sequential Execution
param_tasks_${paramVar} = []
for ${paramVar} in ${rangeCode}:
${pythonGenerator.prefixLines(innerCode, '    ')}
    param_tasks_${paramVar}.append(${paramVar}_task)  # Store last task in the sweep

`;
  }
  
  return code;
};
```

## Generated Airflow Code

The pattern generates Airflow code that creates task groups for parallel execution or a loop for sequential execution:

### Parallel Execution

```python
# Parameter Sweep - Parallel Execution
with TaskGroup(group_id="param_sweep_temperature") as param_sweep_group:
    for temperature in range(20, 31):
        with TaskGroup(group_id=f"param_sweep_temperature_{temperature}") as param_group_temperature:
            # Task: Simulation Execution
            climate_model_task = SimulationOperator(
                task_id=f'simulate_climate_model_{temperature}',
                simulation_command='run_simulation.sh',
                config_file=f'climate_params_{temperature}.yaml',
                output_dir=f'/data/climate/outputs/temp_{temperature}',
                timeout=3600,
                dag=dag,
            )
            
            # Task: Result Interpretation
            analyze_task = PythonOperator(
                task_id=f'analyze_results_{temperature}',
                python_callable=analyze_climate_results,
                op_kwargs={'temperature': temperature, 'result_path': f'/data/climate/outputs/temp_{temperature}'},
                dag=dag,
            )
            
            climate_model_task >> analyze_task
```

### Sequential Execution

```python
# Parameter Sweep - Sequential Execution
param_tasks_temperature = []
for temperature in range(20, 31):
    # Task: Simulation Execution
    climate_model_task = SimulationOperator(
        task_id=f'simulate_climate_model_{temperature}',
        simulation_command='run_simulation.sh',
        config_file=f'climate_params_{temperature}.yaml',
        output_dir=f'/data/climate/outputs/temp_{temperature}',
        timeout=3600,
        dag=dag,
    )
    
    # Task: Result Interpretation
    analyze_task = PythonOperator(
        task_id=f'analyze_results_{temperature}',
        python_callable=analyze_climate_results,
        op_kwargs={'temperature': temperature, 'result_path': f'/data/climate/outputs/temp_{temperature}'},
        dag=dag,
    )
    
    climate_model_task >> analyze_task
    param_tasks_temperature.append(analyze_task)  # Store last task in the sweep
```

## Examples

### Example 1: Simple Temperature Range Sweep

```
[Data Preparation] → [Parameter Sweep: Temperature (20..30)] → [Aggregate Results]
                          ↓
                     [Run Simulation]
                          ↓
                     [Extract Results]
```

This workflow prepares data, then runs simulations for temperatures from 20 to 30°C, and finally aggregates the results.

### Example 2: Multi-Dimensional Parameter Sweep

```
[Parameter Sweep: Temperature (20..30)] → [Parameter Sweep: Humidity (30..80..10)]
                                              ↓
                                        [Run Simulation]
                                              ↓
                                        [Extract Results]
```

This workflow performs a nested parameter sweep across both temperature and humidity ranges.

## Best Practices

1. **Parallel Execution**: Enable parallel execution when iterations are independent to maximize throughput.
2. **Resource Management**: Be cautious with large parameter sweeps as they can consume significant resources.
3. **Dynamic Parameters**: Consider using a database or external file to store parameter ranges for complex sweeps.
4. **Unique Task IDs**: Ensure task IDs include the parameter value to avoid conflicts.
5. **Result Organization**: Use consistent directory/file naming that includes parameter values.
6. **Parameter Files**: For complex parameter sets, generate parameter files programmatically.
7. **Reduce Redundancy**: Use XComs or shared resources to avoid redundant computations across iterations.

## Advanced Features

### Parameter Space Sampling

For large parameter spaces, instead of sweeping through every possible combination, you can sample the parameter space:

```javascript
// Block extension for sampling method
this.appendDummyInput()
    .appendField("sampling method")
    .appendField(new Blockly.FieldDropdown([
        ["grid", "GRID"],
        ["random", "RANDOM"],
        ["latin hypercube", "LHS"]
    ]), "SAMPLING_METHOD");
```

This would generate more sophisticated code that uses sampling techniques to explore the parameter space efficiently.

### Early Termination

Add functionality to stop a parameter sweep early if certain criteria are met:

```javascript
// Block extension for early termination
this.appendDummyInput()
    .appendField("stop when")
    .appendField(new Blockly.FieldTextInput("result > threshold"), "STOP_CONDITION");
```

## Related Patterns

- [Simulation Execution](simulation_execution.md) - The base pattern for running a single simulation
- [Sensitivity Analysis](sensitivity_analysis.md) - Advanced analysis of how outputs vary with inputs
- [Parallel Execution](../workflow/parallel_execution.md) - For running multiple tasks simultaneously
- [Data Aggregation](../data/data_aggregation.md) - For combining results from multiple simulations
- [Monte Carlo Simulation](monte_carlo.md) - For randomized simulation approaches