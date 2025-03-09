# Result Interpretation Pattern

## Description

The **Result Interpretation** pattern processes simulation or analysis outputs to derive insights, generate reports, visualize data, or prepare results for further analysis. This pattern is a critical bridge between raw computational outputs and actionable scientific insights.

### When to Use

Use this pattern when you need to:
- Process and analyze raw simulation results
- Generate summary statistics from experiment data
- Create visualizations of computational outputs
- Extract key metrics from large result sets
- Compare results across multiple simulations
- Prepare results for presentation or publication

## Block Interface

The Result Interpretation block has the following configuration options:

- **Method**: The analysis method to use (summary statistics, plotting, etc.)
- **Input Path**: Path to the input data to interpret
- **Output Path**: Where to store the interpretation results
- **Parameters**: Method-specific parameters (metrics, plot types, etc.)

### Block Preview

```
┌─────────────────────────────────────────────────────┐
│ Interpret results using [Summary Statistics] ▼      │
│ from [/path/to/results]                             │
│ output to [/path/to/output]                         │
│ metrics [mean, median, std, min, max]               │
└─────────────────────────────────────────────────────┘
```

## Block Implementation

### Block Definition (JavaScript)

```javascript
Blockly.Blocks['result_interpretation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Interpret results using")
        .appendField(new Blockly.FieldDropdown([
            ["Summary Statistics", "STATS"],
            ["Plot", "PLOT"],
            ["Report Generation", "REPORT"],
            ["Feature Extraction", "FEATURES"],
            ["Comparison", "COMPARE"]
        ]), "METHOD");
    this.appendDummyInput()
        .appendField("from")
        .appendField(new Blockly.FieldTextInput("/path/to/results"), "INPUT_PATH");
    this.appendDummyInput()
        .appendField("output to")
        .appendField(new Blockly.FieldTextInput("/path/to/output"), "OUTPUT_PATH");
    
    // Dynamic field based on method
    this.appendDummyInput("METHOD_OPTIONS")
        .appendField("metrics")
        .appendField(new Blockly.FieldTextInput("mean, median, std, min, max"), "METRICS");
        
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Process and interpret results from simulations or analyses.");
    this.setHelpUrl("");
    
    // Update the method options field when the method changes
    this.setOnChange(function(changeEvent) {
      if (changeEvent.name === 'METHOD') {
        this.updateMethodOptions(changeEvent.newValue);
      }
    });
  },
  
  updateMethodOptions: function(method) {
    // Remove the old field
    this.removeInput("METHOD_OPTIONS");
    
    // Add a new field based on the selected method
    if (method === "STATS") {
      this.appendDummyInput("METHOD_OPTIONS")
          .appendField("metrics")
          .appendField(new Blockly.FieldTextInput("mean, median, std, min, max"), "METRICS");
    } else if (method === "PLOT") {
      this.appendDummyInput("METHOD_OPTIONS")
          .appendField("plot type")
          .appendField(new Blockly.FieldDropdown([
            ["Line", "LINE"],
            ["Scatter", "SCATTER"],
            ["Bar", "BAR"],
            ["Histogram", "HISTOGRAM"],
            ["Heatmap", "HEATMAP"]
          ]), "PLOT_TYPE");
    } else if (method === "REPORT") {
      this.appendDummyInput("METHOD_OPTIONS")
          .appendField("format")
          .appendField(new Blockly.FieldDropdown([
            ["HTML", "HTML"],
            ["PDF", "PDF"],
            ["Markdown", "MD"]
          ]), "REPORT_FORMAT");
    } else if (method === "FEATURES") {
      this.appendDummyInput("METHOD_OPTIONS")
          .appendField("features")
          .appendField(new Blockly.FieldTextInput("peak, trend, outliers"), "FEATURES");
    } else if (method === "COMPARE") {
      this.appendDummyInput("METHOD_OPTIONS")
          .appendField("baseline")
          .appendField(new Blockly.FieldTextInput("/path/to/baseline"), "BASELINE");
    }
  }
};
```

### Code Generator (JavaScript)

```javascript
pythonGenerator['result_interpretation'] = function(block) {
  const method = block.getFieldValue('METHOD');
  const inputPath = block.getFieldValue('INPUT_PATH');
  const outputPath = block.getFieldValue('OUTPUT_PATH');
  
  // Get method-specific parameters
  let methodParams = '';
  let pythonFunc = '';
  let importStmt = '';
  
  if (method === 'STATS') {
    const metrics = block.getFieldValue('METRICS');
    methodParams = `metrics=['${metrics.split(',').map(m => m.trim()).join("', '")}']`;
    pythonFunc = 'compute_summary_statistics';
    importStmt = 'import pandas as pd\nimport numpy as np';
  } else if (method === 'PLOT') {
    const plotType = block.getFieldValue('PLOT_TYPE');
    methodParams = `plot_type='${plotType.toLowerCase()}'`;
    pythonFunc = 'generate_plots';
    importStmt = 'import matplotlib.pyplot as plt\nimport pandas as pd';
  } else if (method === 'REPORT') {
    const format = block.getFieldValue('REPORT_FORMAT');
    methodParams = `format='${format.toLowerCase()}'`;
    pythonFunc = 'generate_report';
    importStmt = 'import pandas as pd';
  } else if (method === 'FEATURES') {
    const features = block.getFieldValue('FEATURES');
    methodParams = `features=['${features.split(',').map(f => f.trim()).join("', '")}']`;
    pythonFunc = 'extract_features';
    importStmt = 'import pandas as pd\nimport numpy as np\nfrom scipy import signal';
  } else if (method === 'COMPARE') {
    const baseline = block.getFieldValue('BASELINE');
    methodParams = `baseline_path='${baseline}'`;
    pythonFunc = 'compare_results';
    importStmt = 'import pandas as pd\nimport numpy as np';
  }
  
  // Generate the PythonOperator
  const code = `
# Result Interpretation Task
from airflow.operators.python import PythonOperator
${importStmt}

def ${pythonFunc}(input_path, output_path, **kwargs):
    """
    Process and interpret results.
    
    Args:
        input_path: Path to input data
        output_path: Path to store results
        **kwargs: Additional parameters
    
    Returns:
        dict: Key metrics or paths to generated outputs
    """
    print(f"Processing results at {input_path}")
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Load data
    try:
        if input_path.endswith('.csv'):
            data = pd.read_csv(input_path)
        elif input_path.endswith('.json'):
            data = pd.read_json(input_path)
        elif input_path.endswith('.parquet'):
            data = pd.read_parquet(input_path)
        else:
            # Try to load as numpy array for raw simulation outputs
            data = np.load(input_path)
    except Exception as e:
        print(f"Error loading data: {e}")
        raise
    
    # Process based on method
    results = {}
    
    # Implementation specific to the method
    if '${method}' == 'STATS':
        # Calculate summary statistics
        metrics = kwargs.get('metrics', ['mean', 'median', 'std', 'min', 'max'])
        for metric in metrics:
            if metric == 'mean':
                results['mean'] = data.mean().to_dict() if isinstance(data, pd.DataFrame) else np.mean(data)
            elif metric == 'median':
                results['median'] = data.median().to_dict() if isinstance(data, pd.DataFrame) else np.median(data)
            elif metric == 'std':
                results['std'] = data.std().to_dict() if isinstance(data, pd.DataFrame) else np.std(data)
            elif metric == 'min':
                results['min'] = data.min().to_dict() if isinstance(data, pd.DataFrame) else np.min(data)
            elif metric == 'max':
                results['max'] = data.max().to_dict() if isinstance(data, pd.DataFrame) else np.max(data)
        
        # Save results
        pd.DataFrame(results).to_csv(output_path, index=False)
        
    elif '${method}' == 'PLOT':
        # Generate plots
        plot_type = kwargs.get('plot_type', 'line')
        plt.figure(figsize=(10, 6))
        
        if plot_type == 'line':
            if isinstance(data, pd.DataFrame):
                data.plot(kind='line')
            else:
                plt.plot(data)
        elif plot_type == 'scatter':
            if isinstance(data, pd.DataFrame) and len(data.columns) >= 2:
                plt.scatter(data.iloc[:, 0], data.iloc[:, 1])
            else:
                plt.scatter(range(len(data)), data)
        elif plot_type == 'bar':
            if isinstance(data, pd.DataFrame):
                data.plot(kind='bar')
            else:
                plt.bar(range(len(data)), data)
        elif plot_type == 'histogram':
            if isinstance(data, pd.DataFrame):
                data.hist()
            else:
                plt.hist(data)
        elif plot_type == 'heatmap':
            plt.imshow(data, cmap='viridis')
            plt.colorbar()
        
        # Save the plot
        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()
        
        results['plot_path'] = output_path
    
    # Similar implementations for other methods...
    
    print(f"Results saved to {output_path}")
    return results

interpret_results_task = PythonOperator(
    task_id='interpret_results',
    python_callable=${pythonFunc},
    op_kwargs={
        'input_path': '${inputPath}',
        'output_path': '${outputPath}',
        ${methodParams}
    },
    dag=dag,
)
`;
  
  return code;
};
```

## Generated Airflow Code

The pattern generates a PythonOperator with a detailed function for the selected interpretation method:

### Summary Statistics Example

```python
# Result Interpretation Task
from airflow.operators.python import PythonOperator
import pandas as pd
import numpy as np

def compute_summary_statistics(input_path, output_path, **kwargs):
    """
    Process and interpret results.
    
    Args:
        input_path: Path to input data
        output_path: Path to store results
        **kwargs: Additional parameters
    
    Returns:
        dict: Key metrics or paths to generated outputs
    """
    print(f"Processing results at {input_path}")
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Load data
    try:
        if input_path.endswith('.csv'):
            data = pd.read_csv(input_path)
        elif input_path.endswith('.json'):
            data = pd.read_json(input_path)
        elif input_path.endswith('.parquet'):
            data = pd.read_parquet(input_path)
        else:
            # Try to load as numpy array for raw simulation outputs
            data = np.load(input_path)
    except Exception as e:
        print(f"Error loading data: {e}")
        raise
    
    # Process based on method
    results = {}
    
    # Calculate summary statistics
    metrics = kwargs.get('metrics', ['mean', 'median', 'std', 'min', 'max'])
    for metric in metrics:
        if metric == 'mean':
            results['mean'] = data.mean().to_dict() if isinstance(data, pd.DataFrame) else np.mean(data)
        elif metric == 'median':
            results['median'] = data.median().to_dict() if isinstance(data, pd.DataFrame) else np.median(data)
        elif metric == 'std':
            results['std'] = data.std().to_dict() if isinstance(data, pd.DataFrame) else np.std(data)
        elif metric == 'min':
            results['min'] = data.min().to_dict() if isinstance(data, pd.DataFrame) else np.min(data)
        elif metric == 'max':
            results['max'] = data.max().to_dict() if isinstance(data, pd.DataFrame) else np.max(data)
    
    # Save results
    pd.DataFrame(results).to_csv(output_path, index=False)
    
    print(f"Results saved to {output_path}")
    return results

interpret_results_task = PythonOperator(
    task_id='interpret_results',
    python_callable=compute_summary_statistics,
    op_kwargs={
        'input_path': '/data/simulation/climate_model_outputs.csv',
        'output_path': '/data/analysis/climate_summary.csv',
        'metrics': ['mean', 'median', 'std', 'min', 'max']
    },
    dag=dag,
)
```

### Plotting Example

```python
# Result Interpretation Task
from airflow.operators.python import PythonOperator
import matplotlib.pyplot as plt
import pandas as pd

def generate_plots(input_path, output_path, **kwargs):
    # ... [same loading code as above] ...
    
    # Generate plots
    plot_type = kwargs.get('plot_type', 'line')
    plt.figure(figsize=(10, 6))
    
    if plot_type == 'line':
        if isinstance(data, pd.DataFrame):
            data.plot(kind='line')
        else:
            plt.plot(data)
    elif plot_type == 'scatter':
        if isinstance(data, pd.DataFrame) and len(data.columns) >= 2:
            plt.scatter(data.iloc[:, 0], data.iloc[:, 1])
        else:
            plt.scatter(range(len(data)), data)
    elif plot_type == 'bar':
        if isinstance(data, pd.DataFrame):
            data.plot(kind='bar')
        else:
            plt.bar(range(len(data)), data)
    elif plot_type == 'histogram':
        if isinstance(data, pd.DataFrame):
            data.hist()
        else:
            plt.hist(data)
    elif plot_type == 'heatmap':
        plt.imshow(data, cmap='viridis')
        plt.colorbar()
    
    # Save the plot
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    
    results['plot_path'] = output_path
    
    # ... [return results] ...

interpret_results_task = PythonOperator(
    task_id='interpret_results',
    python_callable=generate_plots,
    op_kwargs={
        'input_path': '/data/simulation/temperature_series.csv',
        'output_path': '/data/plots/temperature_trends.png',
        'plot_type': 'line'
    },
    dag=dag,
)
```

## Examples

### Example 1: Simulation Analysis Pipeline

```
[Simulation Execution] → [Data Validation] → [Result Interpretation: Statistics] → [Result Interpretation: Plot]
```

This workflow runs a simulation, validates the data, computes summary statistics, and generates plots of the results.

### Example 2: Comparative Analysis

```
[Parameter Sweep: Temperature] → [Simulation Execution] → [Result Interpretation: Compare]
                                                           (Baseline: /path/to/reference)
```

This workflow runs simulations with different temperatures and compares each result against a reference baseline.

## Best Practices

1. **Data Format Awareness**: Ensure your interpretation method can handle the format of your input data.
2. **Error Handling**: Include comprehensive error handling for data loading and processing.
3. **Output Organization**: Create a standardized directory structure for different types of outputs.
4. **Performance**: For large datasets, consider using streaming or chunking approaches.
5. **Visualization Standards**: Follow consistent styling and formatting for visualizations.
6. **Reporting Templates**: Use templates for reports to maintain consistent structure.
7. **Metadata**: Include metadata about the analysis (parameters, timestamps, etc.) in outputs.

## Advanced Features

### Dynamic Interpretation

The pattern can be extended to dynamically select interpretation methods based on the data:

```python
# Analyze data characteristics and choose appropriate method
def select_interpretation_method(data):
    if len(data.columns) <= 2:
        return 'LINE'  # Line plot for time series
    elif data.select_dtypes(include=['number']).shape[1] >= 3:
        return 'HEATMAP'  # Heatmap for multi-dimensional data
    else:
        return 'STATS'  # Default to statistics
```

### Interactive Visualizations

For web-based outputs, the pattern could generate interactive visualizations:

```python
# Using Plotly for interactive visualizations
def generate_interactive_plot(data, output_path):
    import plotly.express as px
    fig = px.line(data)
    fig.write_html(output_path)
    return {'plot_path': output_path}
```

## Related Patterns

- [Simulation Execution](../simulation/simulation_execution.md) - Source of data for interpretation
- [Data Validation](../data/data_validation.md) - Ensures data quality before interpretation
- [Parameter Sweep](../simulation/parameter_sweep.md) - Often used before interpretation to explore parameter spaces
- [Visualization Generation](visualization.md) - More specialized version focused on complex visualizations
- [Statistical Analysis](statistical_analysis.md) - In-depth statistical methods for result analysis