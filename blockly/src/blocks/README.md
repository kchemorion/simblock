# SimBlockFlow Simulation Blocks

This directory contains the block definitions for the SimBlockFlow pattern-based simulation workflow designer. Each file defines a category of blocks that represent common patterns in scientific simulations.

## Block Categories

### Simulation Blocks (`simulation_blocks.js`)

These blocks represent core simulation patterns and specialized simulation types:

- **Simulation Execution** - Run a generic simulation with configurable parameters
- **Parameter Sweep** - Iterate over parameter values to run multiple simulations
- **Monte Carlo Simulation** - Run simulations with random variations
- **Ensemble Simulation** - Run multiple simulations with different initial conditions
- **Multiscale Simulation** - Link simulations at different scales/resolutions
- **Sensitivity Analysis** - Analyze how model outputs respond to input variations
- **Checkpoint & Restart** - Enable saving and resuming simulation state
- **CFD Simulation** - Specialized Computational Fluid Dynamics simulation
- **Molecular Dynamics** - Specialized Molecular Dynamics simulation
- **ML-Enhanced Simulation** - Machine learning integrated with simulations
- **Visualization** - Scientific visualization for simulation results

### Data Blocks (`data_blocks.js`)

These blocks represent data handling patterns:

- **Data Transfer** - Move data between locations
- **ETL Process** - Extract, transform, and load data
- **Data Validation** - Validate data against rules or schemas
- **Data Transformation** - Process and transform data
- **Data Integration** - Combine data from multiple sources
- **Data Catalog** - Register data with metadata
- **Data Visualization** - Visualize data with charts and graphs

### Analysis Blocks (`analysis_blocks.js`)

These blocks represent analysis patterns:

- **Result Interpretation** - Analyze simulation results
- **Model Calibration** - Calibrate model parameters
- **Statistical Analysis** - Perform statistical tests on results
- **Machine Learning** - Apply ML algorithms to simulation data
- **Uncertainty Quantification** - Quantify uncertainties in results
- **Signal Processing** - Process time series or spatial data
- **Optimization** - Find optimal parameter values

### Workflow Blocks (`workflow_blocks.js`)

These blocks represent workflow control patterns:

- **Error Handling** - Handle errors with retry or skip
- **Conditional Branch** - Execute different paths based on conditions
- **Parallel Execution** - Run tasks in parallel
- **Workflow Trigger** - Define how workflow is initiated
- **Retry Strategy** - Define retry logic for failed tasks
- **Notification** - Send notifications about workflow status
- **Task Dependency** - Define dependencies between tasks

### Infrastructure Blocks (`infrastructure_blocks.js`)

These blocks represent infrastructure patterns:

- **Container Execution** - Run tasks in containers
- **Resource Allocation** - Allocate compute resources
- **Distributed Computing** - Configure distributed execution
- **Environment Setup** - Prepare software environment
- **Data Storage Config** - Configure storage for data
- **Network Config** - Set up network connections

## Adding New Blocks

When adding new blocks:

1. Choose the appropriate category file
2. Follow the Blockly block definition pattern
3. Add corresponding code generator in `../generators/python_airflow.js`
4. Update the BlocklyWorkspace component's toolbox configuration
5. Test the new block by using it in a workflow

## Block Design Principles

When designing blocks:

1. Make blocks self-contained with all necessary configuration
2. Use consistent naming for similar parameters across blocks
3. Provide clear tooltips that explain the block's purpose
4. Use meaningful field labels
5. Keep blocks focused on a single responsibility
6. Support connection to preceding and following steps
7. Prefer dropdowns over free text when options are limited
8. Use statement inputs for nested blocks when appropriate