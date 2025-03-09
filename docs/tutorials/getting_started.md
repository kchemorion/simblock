# Getting Started with SimBlock

This guide will walk you through creating your first scientific workflow using SimBlock.

## Overview

SimBlock is a visual workflow design tool that allows scientists and engineers to create complex workflows using pre-built patterns. Workflows created in SimBlock are automatically converted to Apache Airflow DAGs for robust execution.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/simblock.git
   cd simblock
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd blockly
   npm install
   npm start
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd ../airflow
   pip install -r requirements.txt
   ```

## Creating Your First Workflow

### Step 1: Open the SimBlock Interface

Start the development server and open your browser:

```bash
cd blockly
npm start
```

Your browser should open to `http://localhost:3000` showing the SimBlock interface.

### Step 2: Design Your Workflow

1. **Add a Data Transfer Block**:
   - From the "Data" category in the left toolbox, drag a "Transfer data" block to your workspace.
   - Configure the source and destination paths.

2. **Add a Simulation Block**:
   - From the "Simulation" category, drag a "Run Simulation" block and place it below the data transfer block.
   - Configure the simulation name and config file.

3. **Add a Result Interpretation Block**:
   - From the "Analysis" category, drag an "Interpret results" block and place it below the simulation block.
   - Choose the interpretation method (summary stats or plot).

### Step 3: Generate the Airflow DAG

Click the "Generate Code" button to create the Airflow DAG code for your workflow.

### Step 4: Export the DAG

Click the "Download DAG" button to save the generated Python file.

### Step 5: Run in Airflow

1. Copy the downloaded DAG file to your Airflow DAGs folder.
2. Start the Airflow webserver and scheduler:
   ```bash
   airflow webserver --port 8080
   airflow scheduler
   ```
3. Open the Airflow UI at `http://localhost:8080` and trigger your DAG.

## Example: Parameter Sweep Workflow

Let's create a workflow that runs multiple simulations with different parameters and then analyzes the results.

### Step 1: Design the Workflow

1. **Start with Data Transfer**:
   - Add a "Transfer data" block
   - Set source to `/path/to/input/data`
   - Set destination to `/path/to/working/dir`

2. **Add Parameter Sweep**:
   - Add a "For each" parameter sweep block
   - Set parameter range to "1..5"

3. **Add Simulation Inside Sweep**:
   - Inside the parameter sweep, add a "Run Simulation" block
   - Set simulation name to "climate_model"
   - Set config to "config.yaml"

4. **Add Validation**:
   - After the parameter sweep, add a "Validate dataset" block
   - Set data path to `/path/to/working/dir`

5. **Add Result Interpretation**:
   - Finally, add an "Interpret results" block
   - Choose "summary stats" method

### Step 2: Generate and Run

1. Click "Generate Code"
2. Download the DAG
3. Deploy to Airflow
4. Trigger the workflow

## Working with Patterns

### Simulation Patterns

- **Simulation Execution**: Runs a single simulation
- **Parameter Sweep**: Runs multiple simulations with varying parameters

### Data Patterns

- **Data Transfer**: Moves data between locations
- **ETL Process**: Transforms data formats
- **Data Validation**: Checks data quality

### Analysis Patterns

- **Result Interpretation**: Processes results
- **Model Calibration**: Adjusts model parameters iteratively

## Tips and Best Practices

1. **Start Simple**: Begin with a small workflow and gradually add complexity
2. **Use Parameter Sweeps**: For exploratory analyses, use parameter sweeps to automate multiple runs
3. **Always Validate**: Include data validation steps to catch issues early
4. **Document Your Workflows**: Export and save your workflows with clear names
5. **Reuse Workflows**: Export working workflows as templates for future use

## Troubleshooting

- **Block Connections**: Ensure blocks are properly connected (stacked vertically)
- **Code Generation Errors**: Check that all block fields have valid values
- **Airflow Errors**: Check the Airflow logs for execution errors

## Next Steps

- Learn about [creating custom patterns](../patterns/pattern_design_guide.md)
- Explore [advanced Airflow integration](../airflow/advanced_integration.md)
- Contribute to the [pattern library](../patterns/contributing.md)