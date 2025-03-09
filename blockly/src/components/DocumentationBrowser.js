import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * Component for browsing and displaying pattern documentation
 */
function DocumentationBrowser() {
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [patternContent, setPatternContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Categories for organizing patterns
  const categories = [
    { id: 'all', name: 'All Patterns' },
    { id: 'simulation', name: 'Simulation Patterns' },
    { id: 'data', name: 'Data Patterns' },
    { id: 'infrastructure', name: 'Infrastructure Patterns' },
    { id: 'workflow', name: 'Workflow Patterns' },
    { id: 'analysis', name: 'Analysis Patterns' },
    { id: 'guides', name: 'Methodology Guides' }
  ];
  
  // Fetch patterns from API
  useEffect(() => {
    async function fetchPatterns() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/patterns');
        const data = await response.json();
        
        if (data.success) {
          setPatterns(data.patterns);
        } else {
          setError(data.error || 'Failed to fetch patterns');
        }
      } catch (err) {
        setError('Error connecting to API: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPatterns();
  }, []);
  
  // Fetch pattern documentation when a pattern is selected
  useEffect(() => {
    if (!selectedPattern) return;
    
    async function fetchPatternDoc() {
      try {
        setLoading(true);
        
        let markdown = '';
        
        // If we have a doc_path, fetch from the API
        if (selectedPattern.doc_path) {
          const response = await fetch(`http://localhost:5000/api/pattern-doc/${selectedPattern.doc_path}`);
          const data = await response.json();
          
          if (data.success) {
            markdown = data.content;
          } else {
            throw new Error(data.error || 'Failed to fetch pattern documentation');
          }
        } else {
          // Fallback to hardcoded documentation
          switch(selectedPattern.category.toLowerCase()) {
            case 'simulation':
              markdown = getSimulationPatternDoc(selectedPattern.id);
              break;
              
            case 'data':
              markdown = getDataPatternDoc(selectedPattern.id);
              break;
              
            case 'analysis':
              markdown = getAnalysisPatternDoc(selectedPattern.id);
              break;
              
            case 'workflow':
              markdown = getWorkflowPatternDoc(selectedPattern.id);
              break;
              
            case 'infrastructure':
              markdown = getInfrastructurePatternDoc(selectedPattern.id);
              break;
              
            default:
              markdown = `# ${selectedPattern.name}\n\nDetailed documentation for this pattern is currently under development.`;
          }
        }
        
        setPatternContent(markdown);
      } catch (err) {
        setError('Error fetching pattern documentation: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPatternDoc();
  }, [selectedPattern]);

  // Get filtered patterns based on selected category
  const filteredPatterns = selectedCategory === 'all' 
    ? patterns 
    : patterns.filter(pattern => 
        pattern.category.toLowerCase() === selectedCategory || 
        pattern.category.toLowerCase() === categories.find(c => c.id === selectedCategory)?.name.toLowerCase().replace(' patterns', '')
      );
  
  return (
    <div className="documentation-browser">
      <div className="doc-sidebar">
        <h3>Pattern Library</h3>
        
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {loading && !selectedPattern && <p className="loading-text">Loading patterns...</p>}
        {error && !selectedPattern && <p className="error-text">Error: {error}</p>}
        
        <div className="pattern-list">
          {filteredPatterns.map(pattern => (
            <div 
              key={pattern.id} 
              className={`pattern-item ${selectedPattern && selectedPattern.id === pattern.id ? 'selected' : ''}`}
              onClick={() => setSelectedPattern(pattern)}
            >
              <h4>{pattern.name}</h4>
              <p>{pattern.description || 'No description available'}</p>
            </div>
          ))}
          
          {filteredPatterns.length === 0 && !loading && (
            <p className="no-patterns">No patterns found in this category.</p>
          )}
        </div>
      </div>
      
      <div className="doc-content">
        {selectedPattern ? (
          <>
            {loading ? (
              <div className="loading-container">
                <p>Loading pattern documentation...</p>
              </div>
            ) : (
              <>
                <div className="pattern-metadata">
                  <span className="pattern-category">{selectedPattern.category}</span>
                  <h2 className="pattern-title">{selectedPattern.name}</h2>
                </div>
                
                <div className="markdown-content">
                  <ReactMarkdown>{patternContent}</ReactMarkdown>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="no-selection">
            <h2>SimBlock Pattern Documentation</h2>
            <p>Select a pattern from the sidebar to view its documentation.</p>
            
            <div className="doc-overview">
              <h3>What are Simulation Patterns?</h3>
              <p>
                Patterns are reusable solutions to common simulation workflow challenges. 
                They encapsulate best practices and standardized approaches for different 
                aspects of simulation workflows, from data handling to execution strategies.
              </p>
              
              <h3>Available Pattern Categories:</h3>
              <ul>
                <li><strong>Simulation Patterns</strong>: Core patterns for executing simulations, including parameter sweeps, Monte Carlo methods, and ensemble simulations.</li>
                <li><strong>Data Patterns</strong>: Patterns for handling input/output data, including validation, transformation, and transfer operations.</li>
                <li><strong>Analysis Patterns</strong>: Patterns for interpreting simulation results, including statistical analysis and visualization strategies.</li>
                <li><strong>Workflow Patterns</strong>: Patterns for orchestrating complex workflows, handling errors, and managing dependencies.</li>
                <li><strong>Infrastructure Patterns</strong>: Patterns for deploying simulations on different compute environments.</li>
              </ul>
              
              <h3>Using Patterns in SimBlock</h3>
              <p>
                To use a pattern, drag the corresponding block from the toolbox on the left 
                into your workflow canvas. Configure the pattern by setting its parameters
                in the block configuration dialog. Connect patterns together to create a
                complete workflow.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions to provide detailed pattern documentation for different categories

function getSimulationPatternDoc(patternId) {
  switch(patternId) {
    case 'simulation_execution':
      return `# Simulation Execution Pattern

## Overview
The Simulation Execution pattern represents the process of running a computational model with specified parameters to simulate a real-world phenomenon.

## When to Use
Use this pattern when you need to execute a standalone simulation as part of your workflow.

## Parameters
- **Simulation Name**: A unique identifier for this simulation run
- **Configuration File**: YAML or JSON file containing simulation parameters
- **Output Directory**: Location to store simulation results
- **Timeout**: Maximum execution time (in seconds)
- **Platform**: Execution environment (LOCAL, HPC, AWS, AZURE, GCP)

## Implementation Details
This pattern translates to an appropriate Airflow operator based on the selected platform:
- LOCAL → BashOperator
- HPC → SSHOperator
- AWS/AZURE/GCP → Cloud-specific operators

The pattern ensures the simulation runs with proper resource allocation and handles timeout conditions gracefully.

## Connection Requirements
- For HPC: SSH connection to the HPC cluster (hpc_cluster)
- For AWS: AWS credentials (aws_default)
- For GCP: Google Cloud credentials (google_cloud_default)
- For Azure: Azure credentials (azure_batch_default)

## Example
\`\`\`python
# Running a climate model simulation on an HPC cluster
climate_sim_task = SSHOperator(
    task_id='simulate_climate_model',
    ssh_hook=hpc_ssh_hook,
    command='sbatch -n 16 -t 120 run_simulation.sh --config climate_params.yaml --output-dir /data/results',
    execution_timeout=timedelta(hours=2),
    dag=dag,
)
\`\`\`

## Best Practices
- Always specify a reasonable timeout value to prevent stuck simulations
- Use the appropriate platform based on your simulation's computational requirements
- Store configuration in version-controlled external files
- Ensure output directories exist or are created before the simulation starts`;

    case 'parameter_sweep':
      return `# Parameter Sweep Pattern

## Overview
The Parameter Sweep pattern creates a series of simulation runs, each with a different value for a parameter of interest. This allows for exploring the parameter space and understanding how the model behaves under different conditions.

## When to Use
Use this pattern when you need to:
- Explore how a model responds to changes in a specific parameter
- Calibrate a model by finding optimal parameter values
- Perform sensitivity analysis to understand which parameters most influence outcomes

## Parameters
- **Parameter Variable**: The name of the parameter to sweep
- **Parameter Source**: How to generate parameter values (RANGE, LIST, FILE)
- **Parameter Values**: The values to use (format depends on source)
- **Parallel Execution**: Whether to run parameter variations in parallel

## Implementation Details
This pattern creates a loop (in sequential mode) or a set of parallel tasks (in parallel mode) that execute the contained blocks once for each parameter value. The pattern supports three ways to specify parameter values:

- **RANGE**: A start and end value with automatic stepping (e.g., "1..10")
- **LIST**: An explicit list of values (e.g., "1, 2, 3, 5, 8, 13")
- **FILE**: Read values from a CSV file column

## Connection Requirements
- None specifically for this pattern, but inner blocks may have requirements

## Example
\`\`\`python
# A parameter sweep over temperature values from 270 to 320K
for temperature in range(270, 321, 10):
    with TaskGroup(f"temp_sweep_{temperature}K") as temp_group:
        # Tasks defined here will run for each temperature value
        run_climate_sim = BashOperator(
            task_id=f'simulate_temp_{temperature}',
            bash_command=f'run_sim.sh --temp {temperature}',
            dag=dag
        )
\`\`\`

## Best Practices
- For large parameter spaces, consider using the parallel execution mode
- For very large spaces, consider a more sophisticated approach like Design of Experiments (DoE)
- Ensure parameter values are within physically meaningful bounds
- Consider using logarithmic spacing for parameters that span multiple orders of magnitude`;
      
    case 'monte_carlo_simulation':
      return `# Monte Carlo Simulation Pattern

## Overview
The Monte Carlo Simulation pattern runs multiple simulations with randomized parameter values to account for uncertainty and produce probabilistic results. This approach is essential for risk assessment and uncertainty quantification.

## When to Use
Use this pattern when:
- Your model has inherent uncertainty in inputs or parameters
- You need to understand the range of possible outcomes
- You want to assess the probability of specific events or outcomes
- You need confidence intervals for your predictions

## Parameters
- **Name**: Identifier for the Monte Carlo ensemble
- **Iterations**: Number of simulations to run
- **Base Config**: Template configuration file
- **Seed**: Random seed for reproducibility

## Implementation Details
This pattern creates multiple iterations of the inner workflow, each with a unique random seed. For each iteration:
1. A new configuration file is created with randomized parameters
2. The inner workflow executes using this configuration
3. Results are collected for statistical analysis

The pattern manages random seeds to ensure reproducibility while providing proper randomization.

## Connection Requirements
- None specifically for this pattern, but inner blocks may have requirements

## Example
\`\`\`python
# Monte Carlo simulation with 1000 iterations
for mc_iter in range(1000):
    # Generate config with randomized parameters
    config_file = f"config_iter_{mc_iter}.yaml"
    create_mc_config_task = PythonOperator(
        task_id=f'create_mc_config_{mc_iter}',
        python_callable=create_monte_carlo_config,
        op_kwargs={
            'base_config': 'base_config.yaml',
            'output_config': config_file,
            'seed': 12345 + mc_iter,
        },
        dag=dag,
    )
    
    # Run simulation with generated config
    with TaskGroup(f"monte_carlo_sim_{mc_iter}") as mc_group:
        # Inner tasks defined here
        pass
        
    # Set dependencies
    create_mc_config_task >> mc_group
\`\`\`

## Best Practices
- Use a sufficiently large number of iterations (typically 1000+)
- Ensure proper random distribution for each parameter
- Consider correlations between parameters when randomizing
- Save the seed used for each iteration for reproducibility
- Perform convergence tests to ensure you have enough iterations`;
      
    case 'ensemble_simulation':
      return `# Ensemble Simulation Pattern

## Overview
The Ensemble Simulation pattern executes multiple simulation runs with systematic variations to model uncertainty or improve forecast accuracy. Unlike simple parameter sweeps, ensembles are typically created through sophisticated methods like perturbed initial conditions, stochastic physics, or multi-model approaches.

## When to Use
Use this pattern when:
- You need to account for uncertainty in initial conditions or model formulation
- You want to improve forecast reliability through ensemble averaging
- You need to quantify structural uncertainty in the model
- You're working with inherently probabilistic systems (e.g., weather forecasting)

## Parameters
- **Name**: Identifier for the ensemble
- **Size**: Number of ensemble members
- **Method**: Ensemble generation method (PERTURBED_IC, MULTI_MODEL, STOCHASTIC_PHYSICS)
- **Configs Directory**: Where to store generated configuration files

## Implementation Details
This pattern creates multiple ensemble members based on the selected method:
- **PERTURBED_IC**: Varies initial conditions with small perturbations
- **MULTI_MODEL**: Uses different model formulations or parameterizations
- **STOCHASTIC_PHYSICS**: Introduces random variations in physical parameters during simulation

For each ensemble member, a specific configuration is generated and the inner workflow executes. Results are then processed collectively.

## Connection Requirements
- None specifically for this pattern, but inner blocks may have requirements

## Example
\`\`\`python
# 20-member ensemble with perturbed initial conditions
for member in range(20):
    # Create config with perturbed initial conditions
    create_ic_config_task = PythonOperator(
        task_id=f'create_ensemble_config_{member}',
        python_callable=create_perturbed_ic_config,
        op_kwargs={
            'member_id': member,
            'perturbation_scale': 0.01,
            'output_config': f"ensemble/member_{member}.yaml"
        },
        dag=dag,
    )
    
    # Run simulation with perturbed config
    with TaskGroup(f"ensemble_member_{member}") as ensemble_group:
        # Inner tasks defined here
        pass
        
    # Set dependencies
    create_ic_config_task >> ensemble_group
    
# Process ensemble results
process_ensemble_task = PythonOperator(
    task_id='process_ensemble_results',
    python_callable=compute_ensemble_statistics,
    dag=dag,
)
\`\`\`

## Best Practices
- Use an appropriate ensemble size (typically 10-50 members)
- Choose the ensemble method based on your primary source of uncertainty
- Consider calibration to ensure the ensemble spread correctly represents uncertainty
- Use proper ensemble statistics (mean, median, percentiles) when analyzing results
- Save all ensemble members for detailed analysis`;
    
    default:
      return `# Simulation Pattern
      
Detailed documentation for this simulation pattern is currently under development.`;
  }
}

function getDataPatternDoc(patternId) {
  switch(patternId) {
    case 'data_transfer':
      return `# Data Transfer Pattern

## Overview
The Data Transfer pattern moves data between different storage locations, ensuring that input and output files are available where needed throughout the workflow.

## When to Use
Use this pattern when:
- You need to move simulation input data to a compute resource
- You need to collect simulation outputs from distributed locations
- You're transferring data between different storage systems
- You need to archive or backup simulation results

## Parameters
- **Source**: Path or URI of the source data
- **Destination**: Path or URI where the data should be transferred

## Implementation Details
This pattern creates an appropriate data transfer task based on the source and destination types:
- Local-to-local transfers use simple copy commands
- Remote transfers use specialized protocols (SCP, SFTP, S3, etc.)
- The pattern handles directory creation and error handling

## Connection Requirements
Depending on the transfer type:
- SSH connections for remote server transfers
- AWS credentials for S3 transfers
- Database connections for database transfers

## Example
\`\`\`python
# Transfer simulation results from HPC to S3 storage
transfer_results_task = BashOperator(
    task_id='transfer_simulation_results',
    bash_command='aws s3 sync /scratch/simulation/results s3://my-bucket/results',
    dag=dag,
)
\`\`\`

## Best Practices
- Use appropriate protocols for different transfer types (rsync for large datasets, etc.)
- Implement checksums to verify data integrity
- Consider compression for large transfers
- Implement proper error handling and retries
- For very large datasets, consider specialized data transfer services`;

    case 'data_validation':
      return `# Data Validation Pattern

## Overview
The Data Validation pattern verifies that data meets quality standards and format requirements before it is used in a simulation or after it is produced by a simulation.

## When to Use
Use this pattern when:
- You need to ensure input data meets the requirements of the simulation
- You want to verify that simulation outputs are reasonable and valid
- You need to check data formats and structures
- You're implementing quality control procedures

## Parameters
- **Data Path**: Location of the data to validate
- **Validation Rules**: Rules to apply (schema checks, range validation, etc.)
- **Action on Failure**: What to do if validation fails (FAIL, WARN, SKIP)

## Implementation Details
This pattern creates a validation task that:
1. Reads the specified data
2. Applies validation rules as defined
3. Either continues, warns, or fails based on the validation results

## Connection Requirements
- None specifically, though database connections may be needed for DB-stored data

## Example
\`\`\`python
# Validate simulation input data
validate_inputs_task = PythonOperator(
    task_id='validate_input_data',
    python_callable=validate_dataset,
    op_kwargs={
        'path': '/data/inputs/climate_data.csv',
        'rules': {
            'schema': {'temperature': 'float', 'pressure': 'float', 'humidity': 'float'},
            'ranges': {'temperature': [-50, 50], 'pressure': [900, 1100], 'humidity': [0, 100]},
            'required_fields': ['temperature', 'pressure', 'humidity', 'timestamp'],
            'no_nulls': True
        },
        'on_failure': 'FAIL'
    },
    dag=dag,
)
\`\`\`

## Best Practices
- Define validation rules as configuration, not code
- Include range checks, format validation, and consistency checks
- Log validation results for future reference
- Consider validating metadata in addition to data
- Implement data provenance tracking along with validation`;

    case 'etl_process':
      return `# ETL Process Pattern

## Overview
The ETL (Extract, Transform, Load) Process pattern extracts data from source systems, transforms it into a suitable format for simulation, and loads it into the target location.

## When to Use
Use this pattern when:
- Raw data needs preprocessing before it can be used in a simulation
- You need to integrate data from multiple sources
- You need to transform data formats or structures
- You're implementing data pipelines for regular simulation inputs

## Parameters
- **Source**: Data source location or connection
- **Target**: Target location for processed data
- **Transformations**: Data transformations to apply

## Implementation Details
This pattern creates an ETL pipeline that:
1. Extracts data from the specified source(s)
2. Applies transformation operations (filtering, aggregation, normalization, etc.)
3. Loads the processed data to the target location

## Connection Requirements
- Source data connections (databases, APIs, file systems)
- Target system connections

## Example
\`\`\`python
# ETL process for climate data
process_climate_data_task = PythonOperator(
    task_id='etl_climate_data',
    python_callable=run_etl_job,
    op_kwargs={
        'src': '/raw_data/climate/',
        'dst': '/processed_data/climate/',
        'transformations': [
            {'type': 'filter', 'field': 'quality', 'value': 'high'},
            {'type': 'normalize', 'fields': ['temperature', 'pressure']},
            {'type': 'aggregate', 'group_by': 'station', 'method': 'daily_average'}
        ]
    },
    dag=dag,
)
\`\`\`

## Best Practices
- Make transformations configurable and reusable
- Include data quality checks in the process
- Log transformation steps for provenance tracking
- Consider incremental processing for large datasets
- Implement proper error handling for each ETL phase`;

    default:
      return `# Data Pattern
      
Detailed documentation for this data pattern is currently under development.`;
  }
}

function getAnalysisPatternDoc(patternId) {
  switch(patternId) {
    case 'result_interpretation':
      return `# Result Interpretation Pattern

## Overview
The Result Interpretation pattern processes simulation outputs to extract insights, calculate statistics, and produce visualizations that help understand the simulation results.

## When to Use
Use this pattern when:
- You need to analyze simulation outputs
- You want to extract key metrics from raw results
- You need to visualize simulation outcomes
- You're comparing results across multiple simulation runs

## Parameters
- **Input Path**: Location of simulation results to analyze
- **Method**: Analysis method (STATS, TIME_SERIES, COMPARE, SPATIAL, etc.)
- **Parameters**: Method-specific parameters
- **Output Format**: Format for analysis results (CSV, PNG, PDF, etc.)
- **Output Path**: Where to store analysis results

## Implementation Details
This pattern creates an analysis task that applies the specified method to the simulation results:
- **STATS**: Computes statistical summaries (min, max, mean, etc.)
- **TIME_SERIES**: Analyzes time-dependent data
- **COMPARE**: Compares results against reference data
- **SPATIAL**: Analyzes spatial patterns and distributions
- **CORRELATION**: Identifies correlations between variables
- **CLUSTER**: Applies clustering algorithms to identify patterns
- **CUSTOM**: Applies user-defined analysis functions

## Connection Requirements
- None specifically, but may need database connections for storing results

## Example
\`\`\`python
# Statistical analysis of climate simulation results
analysis_task = PythonOperator(
    task_id='analyze_climate_results',
    python_callable=compute_summary_statistics,
    op_kwargs={
        'input_path': '/results/climate_sim/',
        'parameters': {'variables': ['temperature', 'precipitation'], 'percentiles': [5, 50, 95]},
        'output_format': 'csv',
        'output_path': '/analysis/climate_stats.csv'
    },
    dag=dag,
)

# Create visualization of results
visualization_task = PythonOperator(
    task_id='visualize_results',
    python_callable=create_time_series_plots,
    op_kwargs={
        'input_path': '/results/climate_sim/',
        'parameters': {'variables': ['temperature'], 'regions': ['global', 'tropics', 'arctic']},
        'output_format': 'png',
        'output_path': '/analysis/temperature_trends.png'
    },
    dag=dag,
)

# Set dependencies
analysis_task >> visualization_task
\`\`\`

## Best Practices
- Separate data extraction, analysis, and visualization steps
- Make analysis parameters configurable
- Include metadata in analysis outputs
- Consider statistical significance and uncertainty
- Save intermediate analysis results for reproducibility
- Use appropriate visualization techniques for different data types`;

    case 'model_calibration':
      return `# Model Calibration Pattern

## Overview
The Model Calibration pattern automatically tunes model parameters to optimize the match between simulation outputs and reference data.

## When to Use
Use this pattern when:
- You need to tune model parameters to match observations
- You're developing a new model that requires calibration
- You want to improve model accuracy
- You're implementing parameter estimation workflows

## Parameters
- **Model**: Identifier of the model to calibrate
- **Reference Data**: Observations or benchmarks to calibrate against
- **Parameters**: List of parameters to calibrate
- **Metric**: Evaluation metric for calibration quality
- **Method**: Calibration algorithm to use
- **Convergence Criteria**: When to stop calibration

## Implementation Details
This pattern creates an iterative calibration workflow:
1. Run the model with initial parameter values
2. Compare outputs to reference data
3. Update parameters using the chosen algorithm
4. Repeat until convergence criteria are met

The pattern supports various calibration methods:
- **Grid Search**: Systematic parameter space exploration
- **Gradient Descent**: Follow the gradient of the error function
- **Bayesian Optimization**: Build a surrogate model of the objective function
- **MCMC**: Markov Chain Monte Carlo for posterior distribution sampling

## Connection Requirements
- Model execution environment
- Reference data source

## Example
\`\`\`python
# Calibrate a hydrological model using Bayesian optimization
for iter_calib in range(20):  # Max 20 iterations
    # Run model with current parameters
    run_model_task = BashOperator(
        task_id=f'run_model_iter_{iter_calib}',
        bash_command=f'run_model.sh --params params_{iter_calib}.json --output results_{iter_calib}.csv',
        dag=dag,
    )
    
    # Evaluate results against observations
    evaluate_task = PythonOperator(
        task_id=f'evaluate_iter_{iter_calib}',
        python_callable=compute_model_error,
        op_kwargs={
            'model_output': f'results_{iter_calib}.csv',
            'observations': 'observations.csv',
            'metrics': ['rmse', 'nse']
        },
        dag=dag,
    )
    
    # Update parameters for next iteration
    update_params_task = PythonOperator(
        task_id=f'update_params_iter_{iter_calib}',
        python_callable=bayesian_parameter_update,
        op_kwargs={
            'iteration': iter_calib,
            'previous_results': f'results_{iter_calib}.csv',
            'error_metrics': f'errors_{iter_calib}.json',
            'output_params': f'params_{iter_calib + 1}.json'
        },
        dag=dag,
    )
    
    # Check for convergence
    check_convergence_task = PythonOperator(
        task_id=f'check_convergence_iter_{iter_calib}',
        python_callable=check_calibration_convergence,
        op_kwargs={
            'iteration': iter_calib,
            'error_metrics': f'errors_{iter_calib}.json',
            'tolerance': 0.001
        },
        dag=dag,
    )
    
    # Set dependencies for this iteration
    run_model_task >> evaluate_task >> update_params_task >> check_convergence_task
\`\`\`

## Best Practices
- Start with sensitivity analysis to identify important parameters
- Use appropriate calibration algorithms for your model complexity
- Implement cross-validation to avoid overfitting
- Consider multi-objective calibration when relevant
- Save all intermediate results for traceability
- Set reasonable convergence criteria and iteration limits`;

    default:
      return `# Analysis Pattern
      
Detailed documentation for this analysis pattern is currently under development.`;
  }
}

function getWorkflowPatternDoc(patternId) {
  switch(patternId) {
    case 'error_handling':
      return `# Error Handling Pattern

## Overview
The Error Handling pattern provides robust mechanisms to detect, respond to, and recover from errors that occur during workflow execution.

## When to Use
Use this pattern when:
- You need to make your workflow resilient to failures
- You want to implement specific actions for different error types
- You need to handle expected exceptions gracefully
- You're implementing production-ready workflows

## Parameters
- **Task ID**: The task to apply error handling to
- **Error Type**: The type of error to handle
- **Action**: How to respond to the error (RETRY, SKIP, FAIL, ALTERNATE)

## Implementation Details
This pattern wraps a task or task group with error handling code that:
1. Attempts to execute the original task
2. Catches any exceptions that match the specified error type
3. Implements the chosen action:
   - **RETRY**: Attempts the task again after a delay
   - **SKIP**: Skips the failed task and continues the workflow
   - **FAIL**: Fails the entire workflow with a descriptive message
   - **ALTERNATE**: Executes an alternative task instead

## Connection Requirements
- None specifically for this pattern

## Example
\`\`\`python
# Retry simulation on timeout errors
simulation_with_retry = PythonOperator(
    task_id='simulation_with_retry',
    python_callable=handle_task_with_retry,
    op_kwargs={
        'task_func': run_simulation,
        'max_retries': 3,
        'retry_delay': 60,
        'error_type': 'TimeoutError'
    },
    dag=dag,
)

# Skip data validation on file not found errors
validation_with_skip = PythonOperator(
    task_id='validation_with_skip',
    python_callable=handle_task_with_skip,
    op_kwargs={
        'task_func': validate_data,
        'error_type': 'FileNotFoundError'
    },
    dag=dag,
)

# Define handler functions
def handle_task_with_retry(task_func, max_retries, retry_delay, error_type):
    for attempt in range(max_retries):
        try:
            return task_func()
        except Exception as e:
            if type(e).__name__ == error_type and attempt < max_retries - 1:
                print(f"Task failed with {error_type}. Retrying in {retry_delay}s...")
                time.sleep(retry_delay)
            else:
                raise
                
def handle_task_with_skip(task_func, error_type):
    try:
        return task_func()
    except Exception as e:
        if type(e).__name__ == error_type:
            print(f"Skipping task due to {error_type}.")
            raise AirflowSkipException(f"Skipped due to {error_type}")
        else:
            raise
\`\`\`

## Best Practices
- Be specific about which error types to handle
- Include proper logging for error diagnosis
- Set appropriate retry delays with exponential backoff
- Consider using Airflow's built-in retry mechanisms
- Implement alerting for critical errors
- Avoid masking serious errors with overly broad exception handling`;

    default:
      return `# Workflow Pattern
      
Detailed documentation for this workflow pattern is currently under development.`;
  }
}

function getInfrastructurePatternDoc(patternId) {
  switch(patternId) {
    case 'container_execution':
      return `# Container Execution Pattern

## Overview
The Container Execution pattern runs a containerized application as part of the workflow, ensuring portability, reproducibility, and isolation.

## When to Use
Use this pattern when:
- You need reproducible execution environments
- You're working with complex software dependencies
- You want to isolate simulation components
- You need portable execution across different environments

## Parameters
- **Container Name**: Identifier for the container
- **Image**: Container image to use (e.g., Docker image)
- **Command**: Command to execute inside the container
- **Platform**: Execution platform (DOCKER, KUBERNETES, AWS_BATCH)

## Implementation Details
This pattern creates a task that executes a containerized application:
- **DOCKER**: Uses Docker directly via the BashOperator
- **KUBERNETES**: Uses the KubernetesPodOperator for Kubernetes environments
- **AWS_BATCH**: Uses AWS Batch for managed container execution

The pattern handles container lifecycle, resource allocation, and output capture.

## Connection Requirements
- Docker daemon access for Docker execution
- Kubernetes cluster credentials for Kubernetes execution
- AWS credentials for AWS Batch execution

## Example
\`\`\`python
# Run a simulation in a Docker container
docker_sim_task = BashOperator(
    task_id='docker_simulation',
    bash_command='docker run --rm -v /data:/data climate-model:v1.2.3 run_model.sh --input /data/input.nc --output /data/output.nc',
    dag=dag,
)

# Run on Kubernetes
k8s_sim_task = KubernetesPodOperator(
    task_id='kubernetes_simulation',
    namespace='simulations',
    image='climate-model:v1.2.3',
    cmds=['run_model.sh'],
    arguments=['--input', '/data/input.nc', '--output', '/data/output.nc'],
    volumes=[Volume(name='data-volume', claim='data-pvc')],
    volume_mounts=[VolumeMount(name='data-volume', mount_path='/data')],
    resources={'request_cpu': '2', 'request_memory': '8Gi'},
    is_delete_operator_pod=True,
    dag=dag,
)
\`\`\`

## Best Practices
- Use version-specific image tags for reproducibility
- Mount data volumes efficiently to avoid large data copies
- Set appropriate resource limits and requests
- Include container health checks
- Use container registries for image management
- Document container dependencies and environment variables`;

    case 'resource_allocation':
      return `# Resource Allocation Pattern

## Overview
The Resource Allocation pattern manages computational resources needed for simulation tasks, ensuring efficient utilization and proper specification.

## When to Use
Use this pattern when:
- You need to request specific computing resources
- You're working with HPC systems that require job specifications
- You need to optimize resource utilization
- You're implementing dynamic resource allocation

## Parameters
- **Resource Type**: Type of resource (HPC_CLUSTER, CLOUD_INSTANCE, CONTAINER_RESOURCES)
- **Resource Name**: Identifier for the resource allocation
- **CPU Count**: Number of CPU cores to allocate
- **Memory Size**: Amount of memory to allocate (in GB)
- **GPU Count**: Number of GPUs to allocate
- **Duration**: Expected duration of resource need (in hours)

## Implementation Details
This pattern creates a resource allocation task appropriate for the chosen resource type:
- **HPC_CLUSTER**: Creates a job allocation on an HPC system (e.g., using SLURM)
- **CLOUD_INSTANCE**: Provisions a cloud instance with the specified resources
- **CONTAINER_RESOURCES**: Sets resource limits for containerized execution

The pattern ensures resources are properly requested, allocated, and released.

## Connection Requirements
- HPC cluster credentials for HPC allocations
- Cloud provider credentials for cloud instances

## Example
\`\`\`python
# Allocate HPC resources for a simulation
hpc_allocation_task = SSHOperator(
    task_id='allocate_hpc_resources',
    ssh_hook=hpc_ssh_hook,
    command='salloc -N 1 -c 32 --mem=128G --gres=gpu:2 -t 4:00:00 -J climate_sim -p normal',
    dag=dag,
)

# Provision a cloud instance
cloud_allocation_task = PythonOperator(
    task_id='provision_cloud_instance',
    python_callable=provision_cloud_resources,
    op_kwargs={
        'instance_type': 'c5.9xlarge',
        'region': 'us-west-2',
        'duration_hours': 8
    },
    dag=dag,
)
\`\`\`

## Best Practices
- Request only the resources you need to avoid waste
- Use appropriate instance types or partitions for your workload
- Include resource deallocation steps to avoid lingering allocations
- Consider cost optimization for cloud resources
- Set realistic timeouts based on expected duration
- Implement automatic scaling for variable workloads`;

    default:
      return `# Infrastructure Pattern
      
Detailed documentation for this infrastructure pattern is currently under development.`;
  }
}

export default DocumentationBrowser;