import * as Blockly from 'blockly';
import { pythonGenerator } from 'blockly/python';

// Override the ORDER constants to match Python's operator precedence
pythonGenerator.ORDER_ATOMIC = 0;
pythonGenerator.ORDER_FUNCTION_CALL = 1;
pythonGenerator.ORDER_MEMBER = 2;
pythonGenerator.ORDER_EXPONENTIATION = 3;
pythonGenerator.ORDER_UNARY_SIGN = 4;
pythonGenerator.ORDER_BITWISE_NOT = 4;
pythonGenerator.ORDER_MULTIPLICATIVE = 5;
pythonGenerator.ORDER_ADDITIVE = 6;
pythonGenerator.ORDER_BITWISE_SHIFT = 7;
pythonGenerator.ORDER_BITWISE_AND = 8;
pythonGenerator.ORDER_BITWISE_XOR = 9;
pythonGenerator.ORDER_BITWISE_OR = 10;
pythonGenerator.ORDER_RELATIONAL = 11;
pythonGenerator.ORDER_LOGICAL_NOT = 12;
pythonGenerator.ORDER_LOGICAL_AND = 13;
pythonGenerator.ORDER_LOGICAL_OR = 14;
pythonGenerator.ORDER_CONDITIONAL = 15;
pythonGenerator.ORDER_LAMBDA = 16;
pythonGenerator.ORDER_NONE = 99;

/* SIMULATION BLOCKS */

// Simulation Execution
pythonGenerator['simulation_execution'] = function(block) {
  const simName = block.getFieldValue('SIM_NAME');
  const config = block.getFieldValue('CONFIG_FILE');
  const outputDir = block.getFieldValue('OUTPUT_DIR');
  const timeout = block.getFieldValue('TIMEOUT');
  const platform = block.getFieldValue('PLATFORM');
  
  let taskCode = '';
  
  if (platform === 'LOCAL') {
    taskCode = `
# Task: Simulation Execution - ${simName}
${simName}_task = BashOperator(
    task_id='simulate_${simName}',
    bash_command='run_simulation.sh --config ${config} --output-dir ${outputDir}',
    execution_timeout=timedelta(seconds=${timeout}),
    dag=dag,
)
`;
  } else if (platform === 'HPC') {
    taskCode = `
# Task: Simulation Execution on HPC - ${simName}
${simName}_task = SSHOperator(
    task_id='simulate_${simName}_hpc',
    ssh_hook=hpc_ssh_hook,
    command='sbatch -n 16 -t ${Math.ceil(timeout/60)} -o ${outputDir}/output.log run_simulation.sh --config ${config} --output-dir ${outputDir}',
    execution_timeout=timedelta(seconds=${timeout}),
    dag=dag,
)
`;
  } else if (platform === 'AWS' || platform === 'AZURE' || platform === 'GCP') {
    let operator = 'EmrOperator';
    let connId = 'aws_default';
    
    if (platform === 'AZURE') {
      operator = 'AzureBatchOperator';
      connId = 'azure_batch_default';
    } else if (platform === 'GCP') {
      operator = 'DataprocOperator';
      connId = 'google_cloud_default';
    }
    
    taskCode = `
# Task: Simulation Execution on ${platform} - ${simName}
${simName}_task = ${operator}(
    task_id='simulate_${simName}_cloud',
    command='run_simulation.sh --config ${config} --output-dir ${outputDir}',
    conn_id='${connId}',
    execution_timeout=timedelta(seconds=${timeout}),
    dag=dag,
)
`;
  }
  
  return taskCode;
};

// Parameter Sweep
pythonGenerator['parameter_sweep'] = function(block) {
  const paramVar = Blockly.Python.variableDB_.getName(
      block.getFieldValue('PARAM_VAR'),
      Blockly.Variables.NAME_TYPE);
  
  const paramSource = block.getFieldValue('PARAM_SOURCE');
  const paramValues = block.getFieldValue('PARAM_VALUES');
  const isParallel = block.getFieldValue('PARALLEL') === 'TRUE';
  
  // Get the code for the inner blocks
  const innerCode = pythonGenerator.statementToCode(block, 'DO');
  
  let paramLoopCode = '';
  
  if (paramSource === 'RANGE') {
    const [start, end] = paramValues.split('..');
    paramLoopCode = `range(${start}, ${parseInt(end) + 1})`;
  } else if (paramSource === 'LIST') {
    paramLoopCode = `[${paramValues}]`;
  } else if (paramSource === 'FILE') {
    paramLoopCode = `pd.read_csv('${paramValues}')['${paramVar}'].values`;
  }
  
  let code = '';
  
  if (isParallel) {
    code = `
# Pattern: Parallel Parameter Sweep
param_values = ${paramLoopCode}
param_tasks = []

for ${paramVar} in param_values:
    with TaskGroup(f"param_group_{${paramVar}}") as param_group:
${pythonGenerator.prefixLines(innerCode, '        ')}
    param_tasks.append(param_group)

# Set parallel execution of parameter sweep tasks
`;
  } else {
    code = `
# Pattern: Sequential Parameter Sweep
for ${paramVar} in ${paramLoopCode}:
${innerCode}

`;
  }
  
  return code;
};

/* DATA BLOCKS */

// Data Transfer
pythonGenerator['data_transfer'] = function(block) {
  const src = block.getFieldValue('SRC');
  const dest = block.getFieldValue('DEST');
  
  // Generate an Airflow BashOperator task to transfer data
  const code = `
# Task: Data Transfer
transfer_data_task = BashOperator(
    task_id='transfer_data',
    bash_command=f'cp -R ${src} ${dest}',
    dag=dag,
)

`;
  return code;
};

// ETL Process
pythonGenerator['etl_process'] = function(block) {
  const source = block.getFieldValue('SOURCE');
  const target = block.getFieldValue('TARGET');
  
  // Generate an Airflow PythonOperator task to perform ETL
  const code = `
# Task: ETL Process
etl_task = PythonOperator(
    task_id='etl_process',
    python_callable=run_etl_job,
    op_kwargs={'src': '${source}', 'dst': '${target}'},
    dag=dag,
)

# Define the ETL function
def run_etl_job(src, dst):
    print(f"Running ETL from {src} to {dst}")
    # ETL logic would go here
    return dst

`;
  return code;
};

// Data Validation
pythonGenerator['data_validation'] = function(block) {
  const dataPath = block.getFieldValue('DATA_PATH');
  
  // Generate an Airflow PythonOperator task to validate data
  const code = `
# Task: Data Validation
validate_data_task = PythonOperator(
    task_id='validate_data',
    python_callable=validate_dataset,
    op_kwargs={'path': '${dataPath}'},
    dag=dag,
)

# Define the validation function
def validate_dataset(path):
    print(f"Validating data at {path}")
    # Validation logic would go here
    return True

`;
  return code;
};

// Monte Carlo Simulation
pythonGenerator['monte_carlo_simulation'] = function(block) {
  const name = block.getFieldValue('NAME');
  const iterations = block.getFieldValue('ITERATIONS');
  const baseConfig = block.getFieldValue('BASE_CONFIG');
  const seed = block.getFieldValue('SEED');
  const innerCode = pythonGenerator.statementToCode(block, 'DO');
  
  const code = `
# Pattern: Monte Carlo Simulation
mc_tasks = []
for mc_iter in range(${iterations}):
    # Generate a unique random seed for each iteration
    iter_seed = ${seed} + mc_iter
    
    # Create a config file with the random seed
    config_file = f"${baseConfig.split('.')[0]}_iter_{mc_iter}.yaml"
    create_mc_config_task = PythonOperator(
        task_id=f'create_mc_config_{mc_iter}',
        python_callable=create_monte_carlo_config,
        op_kwargs={
            'base_config': '${baseConfig}',
            'output_config': config_file,
            'seed': iter_seed,
            'iteration': mc_iter
        },
        dag=dag,
    )
    
    # Per-iteration tasks
    with TaskGroup(f"monte_carlo_${name}_{mc_iter}") as mc_group:
${pythonGenerator.prefixLines(innerCode, '        ')}
    
    # Set task dependencies
    create_mc_config_task >> mc_group
    mc_tasks.append(mc_group)

# Define helper function for creating Monte Carlo configs
def create_monte_carlo_config(base_config, output_config, seed, iteration):
    import yaml
    import numpy as np
    
    # Set the random seed
    np.random.seed(seed)
    
    # Load the base configuration
    with open(base_config, 'r') as f:
        config = yaml.safe_load(f)
    
    # Add Monte Carlo specific parameters
    config['monte_carlo'] = {
        'seed': seed,
        'iteration': iteration
    }
    
    # Modify parameters according to Monte Carlo rules
    # This can be customized based on specific needs
    if 'parameters' in config:
        for param_name, param_value in config['parameters'].items():
            if isinstance(param_value, (int, float)):
                # Add random perturbation (+/- 10%)
                config['parameters'][param_name] = param_value * (1.0 + 0.1 * (np.random.random() - 0.5))
    
    # Write the configuration to the output file
    with open(output_config, 'w') as f:
        yaml.dump(config, f)
    
    return output_config

`;
  
  return code;
};

// Ensemble Simulation
pythonGenerator['ensemble_simulation'] = function(block) {
  const name = block.getFieldValue('NAME');
  const size = block.getFieldValue('SIZE');
  const method = block.getFieldValue('METHOD');
  const configsDir = block.getFieldValue('CONFIGS_DIR');
  const innerCode = pythonGenerator.statementToCode(block, 'DO');
  
  const code = `
# Pattern: Ensemble Simulation
ensemble_tasks = []

# Method: ${method}
for ensemble_member in range(${size}):
    member_config = f"${configsDir}/ensemble_{ensemble_member}.yaml"
    
    # Create specific config for this ensemble member
    create_ensemble_config_task = PythonOperator(
        task_id=f'create_ensemble_config_{ensemble_member}',
        python_callable=create_ensemble_member_config,
        op_kwargs={
            'method': '${method}',
            'member_id': ensemble_member,
            'ensemble_size': ${size},
            'output_config': member_config
        },
        dag=dag,
    )
    
    # Per-member tasks
    with TaskGroup(f"ensemble_${name}_{ensemble_member}") as ensemble_group:
${pythonGenerator.prefixLines(innerCode, '        ')}
    
    # Set task dependencies
    create_ensemble_config_task >> ensemble_group
    ensemble_tasks.append(ensemble_group)

# Process ensemble results
process_ensemble_task = PythonOperator(
    task_id='process_ensemble_results',
    python_callable=process_ensemble,
    op_kwargs={
        'ensemble_name': '${name}',
        'ensemble_size': ${size},
        'method': '${method}'
    },
    dag=dag,
)

# Set ensemble post-processing dependency
ensemble_tasks >> process_ensemble_task

# Define helper functions for ensemble simulation
def create_ensemble_member_config(method, member_id, ensemble_size, output_config):
    import yaml
    import numpy as np
    
    # Base configuration structure
    config = {
        'ensemble': {
            'method': method,
            'member_id': member_id,
            'ensemble_size': ensemble_size
        }
    }
    
    # Different configuration based on ensemble method
    if method == 'PERTURBED_IC':
        # Perturbed initial conditions ensemble
        config['initial_conditions'] = {
            'perturbation_scale': 0.01,
            'perturbation_seed': 1000 + member_id
        }
    elif method == 'MULTI_MODEL':
        # Multi-model ensemble
        models = ['model_a', 'model_b', 'model_c', 'model_d', 'model_e']
        config['model'] = {
            'name': models[member_id % len(models)],
            'version': '1.0'
        }
    elif method == 'STOCHASTIC_PHYSICS':
        # Stochastic physics ensemble
        config['physics'] = {
            'stochastic': True,
            'seed': 2000 + member_id,
            'perturbation_scale': 0.05
        }
    
    # Write the configuration to the output file
    with open(output_config, 'w') as f:
        yaml.dump(config, f)
    
    return output_config

def process_ensemble(ensemble_name, ensemble_size, method):
    print(f"Processing ensemble {ensemble_name} with {ensemble_size} members using {method} method")
    # Process ensemble results (aggregate statistics, etc.)
    return True

`;
  
  return code;
};

/* ANALYSIS BLOCKS */

// Result Interpretation
pythonGenerator['result_interpretation'] = function(block) {
  const inputPath = block.getFieldValue('INPUT_PATH');
  const method = block.getFieldValue('METHOD');
  const parameters = block.getFieldValue('PARAMETERS');
  const outputFormat = block.getFieldValue('OUTPUT_FORMAT');
  const outputPath = block.getFieldValue('OUTPUT_PATH');
  
  // Map method to function name and meaningful task ID
  let methodFunc = '';
  let taskId = '';
  
  switch(method) {
    case 'STATS':
      methodFunc = 'compute_summary_statistics';
      taskId = 'summary_stats';
      break;
    case 'TIME_SERIES':
      methodFunc = 'analyze_time_series';
      taskId = 'time_series_analysis';
      break;
    case 'COMPARE':
      methodFunc = 'compare_results';
      taskId = 'comparative_analysis';
      break;
    case 'SPATIAL':
      methodFunc = 'analyze_spatial_data';
      taskId = 'spatial_analysis';
      break;
    case 'CORRELATION':
      methodFunc = 'compute_correlations';
      taskId = 'correlation_analysis';
      break;
    case 'CLUSTER':
      methodFunc = 'cluster_results';
      taskId = 'clustering';
      break;
    case 'CUSTOM':
      methodFunc = 'custom_analysis';
      taskId = 'custom_analysis';
      break;
  }
  
  // Generate Airflow PythonOperator task
  const code = `
# Task: Result Interpretation (${method})
${taskId}_task = PythonOperator(
    task_id='${taskId}',
    python_callable=${methodFunc},
    op_kwargs={
        'input_path': '${inputPath}',
        'parameters': ${parameters},
        'output_format': '${outputFormat}',
        'output_path': '${outputPath}'
    },
    dag=dag,
)

# Define the result interpretation function
def ${methodFunc}(input_path, parameters, output_format, output_path):
    print(f"Analyzing results at {input_path} using {parameters}")
    
    # Analysis logic would go here based on method type
    # For example, if using pandas:
    # import pandas as pd
    # df = pd.read_csv(input_path)
    # results = df.describe()  # for STATS method
    
    # Save results in the specified format
    print(f"Saving results to {output_path} in {output_format} format")
    
    return True

`;
  return code;
};

// Model Calibration
pythonGenerator['model_calibration'] = function(block) {
  const modelName = block.getFieldValue('MODEL');
  
  // Get code from calibration steps
  const stepsCode = pythonGenerator.statementToCode(block, 'STEPS');
  
  // Generate a calibration loop with the steps inside
  const code = `
# Model Calibration
for iter_${modelName} in range(10):  # Run up to 10 iterations for calibration
    print(f"Calibration iteration {iter_${modelName}} for model ${modelName}")
${pythonGenerator.prefixLines(stepsCode, '    ')}
    # Check for convergence (simplified)
    if check_convergence_${modelName}():
        break

# Define a convergence check function
def check_convergence_${modelName}():
    # Convergence check logic would go here
    return False  # Return True when converged

`;
  return code;
};

/* INFRASTRUCTURE BLOCKS */

// Container Execution
pythonGenerator['container_execution'] = function(block) {
  const containerName = block.getFieldValue('CONTAINER_NAME');
  const image = block.getFieldValue('IMAGE');
  const command = block.getFieldValue('COMMAND');
  const platform = block.getFieldValue('PLATFORM');
  
  let code = '';
  
  switch (platform) {
    case 'DOCKER':
      code = `
# Task: Container Execution - Docker
${containerName}_task = BashOperator(
    task_id='container_${containerName}',
    bash_command=f'docker run --rm ${image} ${command}',
    dag=dag,
)
`;
      break;
    case 'KUBERNETES':
      code = `
# Task: Container Execution - Kubernetes
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import KubernetesPodOperator

${containerName}_task = KubernetesPodOperator(
    task_id='container_${containerName}',
    namespace='default',
    image='${image}',
    cmds=['sh', '-c', '${command}'],
    name='${containerName}',
    is_delete_operator_pod=True,
    in_cluster=True,
    dag=dag,
)
`;
      break;
    case 'AWS_BATCH':
      code = `
# Task: Container Execution - AWS Batch
from airflow.providers.amazon.aws.operators.batch import BatchOperator

${containerName}_task = BatchOperator(
    task_id='container_${containerName}',
    job_name='${containerName}',
    job_definition='${containerName}_job_def',
    job_queue='scientific-compute-queue',
    overrides={
        'containerOverrides': {
            'command': ['sh', '-c', '${command}'],
        },
    },
    dag=dag,
)
`;
      break;
  }
  
  return code;
};

// Resource Allocation
pythonGenerator['resource_allocation'] = function(block) {
  const resourceType = block.getFieldValue('RESOURCE_TYPE');
  const resourceName = block.getFieldValue('RESOURCE_NAME');
  const cpuCount = block.getFieldValue('CPU_COUNT');
  const memorySize = block.getFieldValue('MEMORY_SIZE');
  const gpuCount = block.getFieldValue('GPU_COUNT');
  const duration = block.getFieldValue('DURATION');
  
  let code = '';
  
  switch (resourceType) {
    case 'HPC_CLUSTER':
      code = `
# Task: Resource Allocation - HPC Cluster
${resourceName}_allocation_task = SSHOperator(
    task_id='allocate_${resourceName}',
    ssh_hook=hpc_ssh_hook,
    command=f'salloc -N 1 -c ${cpuCount} --mem=${memorySize}G --gres=gpu:${gpuCount} -t ${duration} -J ${resourceName}',
    dag=dag,
)
`;
      break;
    case 'CLOUD_INSTANCE':
      code = `
# Task: Resource Allocation - Cloud Instance
${resourceName}_allocation_task = PythonOperator(
    task_id='allocate_${resourceName}',
    python_callable=provision_cloud_instance,
    op_kwargs={
        'instance_name': '${resourceName}',
        'cpu_count': ${cpuCount},
        'memory_size': ${memorySize},
        'gpu_count': ${gpuCount},
        'duration_hours': ${duration}
    },
    dag=dag,
)

# Define cloud provisioning function
def provision_cloud_instance(instance_name, cpu_count, memory_size, gpu_count, duration_hours):
    print(f"Provisioning cloud instance {instance_name}")
    # Cloud provider-specific instance provisioning code would go here
    return {'instance_id': f'{instance_name}-123', 'ip': '10.0.0.1'}
`;
      break;
    case 'CONTAINER_RESOURCES':
      code = `
# Task: Resource Allocation - Container Resources
# This defines resource requirements for containers
container_resources = {
    'name': '${resourceName}',
    'cpu': '${cpuCount}',
    'memory': '${memorySize}G',
    'gpu': '${gpuCount}',
    'timeout_seconds': ${duration} * 3600
}

# Store as an Airflow Variable for tasks to reference
from airflow.models import Variable
Variable.set(
    '${resourceName}_resources',
    container_resources,
    serialize_json=True
)
`;
      break;
  }
  
  return code;
};

/* WORKFLOW BLOCKS */

// Error Handling
pythonGenerator['error_handling'] = function(block) {
  const taskId = block.getFieldValue('TASK_ID');
  const errorType = block.getFieldValue('ERROR_TYPE');
  const action = block.getFieldValue('ACTION');
  
  let code = '';
  
  switch (action) {
    case 'RETRY':
      code = `
# Error Handling - Retry
${taskId}_with_retry = PythonOperator(
    task_id='${taskId}_with_retry',
    python_callable=handle_task_with_retry,
    op_kwargs={
        'task_func': ${taskId}_function,
        'max_retries': 3,
        'retry_delay': 60,
        'error_type': '${errorType}'
    },
    dag=dag,
)

# Define retry handler function
def handle_task_with_retry(task_func, max_retries, retry_delay, error_type):
    import time
    for attempt in range(max_retries):
        try:
            return task_func()
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Task failed with error: {e}. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print(f"Task failed after {max_retries} attempts.")
                raise
`;
      break;
    case 'SKIP':
      code = `
# Error Handling - Skip
${taskId}_with_skip = PythonOperator(
    task_id='${taskId}_with_skip',
    python_callable=handle_task_with_skip,
    op_kwargs={
        'task_func': ${taskId}_function,
        'error_type': '${errorType}'
    },
    dag=dag,
)

# Define skip handler function
def handle_task_with_skip(task_func, error_type):
    try:
        return task_func()
    except Exception as e:
        if '${errorType}' in str(e) or '${errorType}' in e.__class__.__name__:
            print(f"Skipping task due to expected error: {e}")
            raise AirflowSkipException(f"Skipping due to expected error: {e}")
        else:
            raise
`;
      break;
  }
  
  return code;
};