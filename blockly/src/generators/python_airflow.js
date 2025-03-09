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

/* SIMULATION BLOCKS - Pattern-based simulation building blocks */

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

// CFD Simulation
pythonGenerator['cfd_simulation'] = function(block) {
  const name = block.getFieldValue('NAME');
  const solver = block.getFieldValue('SOLVER');
  const mesh = block.getFieldValue('MESH');
  const config = block.getFieldValue('CONFIG');
  const iterations = block.getFieldValue('ITERATIONS');
  const convergence = block.getFieldValue('CONVERGENCE');
  const turbulence = block.getFieldValue('TURBULENCE');
  
  // Generate CFD simulation task
  const code = `
# Task: CFD Simulation - ${solver}
cfd_${name}_task = PythonOperator(
    task_id='cfd_${name}',
    python_callable=run_cfd_simulation,
    op_kwargs={
        'name': '${name}',
        'solver': '${solver}',
        'mesh_file': '${mesh}',
        'config_file': '${config}',
        'iterations': ${iterations},
        'convergence': ${convergence},
        'turbulence_model': '${turbulence}'
    },
    dag=dag,
)

# Define CFD simulation function
def run_cfd_simulation(name, solver, mesh_file, config_file, iterations, convergence, turbulence_model):
    """
    Run a computational fluid dynamics simulation using the specified solver and parameters.
    
    Args:
        name: Name of the simulation run
        solver: CFD solver to use (e.g., OpenFOAM, Fluent)
        mesh_file: Path to the mesh file
        config_file: Path to the configuration file
        iterations: Maximum number of iterations
        convergence: Convergence criteria threshold
        turbulence_model: Turbulence model to use
        
    Returns:
        dict: Results and metadata for the simulation run
    """
    import os
    import subprocess
    import yaml
    
    print(f"Starting CFD simulation '{name}' using {solver}")
    
    # Load configuration
    with open(config_file, 'r') as f:
        config = yaml.safe_load(f)
    
    # Prepare solver-specific commands
    if solver == 'OPENFOAM':
        cmd = f"blockMesh -case {name} && simpleFoam -case {name} -parallel"
    elif solver == 'FLUENT':
        cmd = f"fluent -g -i {config_file} -t{os.cpu_count()}"
    elif solver == 'SU2':
        cmd = f"SU2_CFD {config_file}"
    else:  # CUSTOM
        cmd = config.get('custom_command', f"echo 'Running custom CFD solver for {name}'")
    
    # Create results directory
    results_dir = f"results_{name}"
    os.makedirs(results_dir, exist_ok=True)
    
    # Log simulation metadata
    metadata = {
        'name': name,
        'solver': solver,
        'mesh_file': mesh_file,
        'config_file': config_file,
        'iterations': iterations,
        'convergence': convergence,
        'turbulence_model': turbulence_model,
        'start_time': datetime.now().isoformat()
    }
    
    with open(f"{results_dir}/metadata.yaml", 'w') as f:
        yaml.dump(metadata, f)
    
    # Execute simulation (mock execution for DAG generation)
    print(f"Executing CFD command: {cmd}")
    # In a real deployment, this would actually run the solver
    # subprocess.run(cmd, shell=True, check=True)
    
    # Update metadata with completion info
    metadata['end_time'] = datetime.now().isoformat()
    metadata['status'] = 'completed'
    
    with open(f"{results_dir}/metadata.yaml", 'w') as f:
        yaml.dump(metadata, f)
    
    return {
        'results_dir': results_dir,
        'status': 'completed'
    }
`;
  
  return code;
};

// Molecular Dynamics Simulation
pythonGenerator['molecular_dynamics'] = function(block) {
  const name = block.getFieldValue('NAME');
  const engine = block.getFieldValue('ENGINE');
  const topology = block.getFieldValue('TOPOLOGY');
  const params = block.getFieldValue('PARAMS');
  const timestep = block.getFieldValue('TIMESTEP');
  const simTime = block.getFieldValue('SIM_TIME');
  const ensemble = block.getFieldValue('ENSEMBLE');
  
  // Generate MD simulation task
  const code = `
# Task: Molecular Dynamics Simulation - ${engine}
md_${name}_task = PythonOperator(
    task_id='md_${name}',
    python_callable=run_md_simulation,
    op_kwargs={
        'name': '${name}',
        'engine': '${engine}',
        'topology_file': '${topology}',
        'params_file': '${params}',
        'timestep': ${timestep},
        'sim_time': ${simTime},
        'ensemble': '${ensemble}'
    },
    dag=dag,
)

# Define MD simulation function
def run_md_simulation(name, engine, topology_file, params_file, timestep, sim_time, ensemble):
    """
    Run a molecular dynamics simulation using the specified engine and parameters.
    
    Args:
        name: Name of the simulation run
        engine: MD engine to use (e.g., GROMACS, LAMMPS)
        topology_file: Path to the topology/structure file
        params_file: Path to the parameters file
        timestep: Simulation timestep in fs
        sim_time: Total simulation time in ns
        ensemble: Thermodynamic ensemble (NVT, NPT, etc.)
        
    Returns:
        dict: Results and metadata for the simulation run
    """
    import os
    import subprocess
    import yaml
    
    print(f"Starting MD simulation '{name}' using {engine}")
    
    # Calculate number of steps
    steps = int((sim_time * 1e6) / timestep)  # Convert ns to fs
    
    # Prepare engine-specific commands
    if engine == 'GROMACS':
        cmd = f"gmx grompp -f {params_file} -c {topology_file} -o {name}.tpr && gmx mdrun -deffnm {name} -nsteps {steps}"
    elif engine == 'LAMMPS':
        cmd = f"lmp -in {params_file} -var topology {topology_file} -var timestep {timestep} -var steps {steps}"
    elif engine == 'NAMD':
        cmd = f"namd2 +p{os.cpu_count()} {params_file}"
    elif engine == 'AMBER':
        cmd = f"pmemd.cuda -i {params_file} -c {topology_file} -o {name}.out"
    else:  # CUSTOM
        cmd = f"echo 'Running custom MD engine for {name}'"
    
    # Create results directory
    results_dir = f"results_{name}"
    os.makedirs(results_dir, exist_ok=True)
    
    # Log simulation metadata
    metadata = {
        'name': name,
        'engine': engine,
        'topology_file': topology_file,
        'params_file': params_file,
        'timestep': timestep,
        'sim_time': sim_time,
        'ensemble': ensemble,
        'steps': steps,
        'start_time': datetime.now().isoformat()
    }
    
    with open(f"{results_dir}/metadata.yaml", 'w') as f:
        yaml.dump(metadata, f)
    
    # Execute simulation (mock execution for DAG generation)
    print(f"Executing MD command: {cmd}")
    # In a real deployment, this would actually run the engine
    # subprocess.run(cmd, shell=True, check=True)
    
    # Update metadata with completion info
    metadata['end_time'] = datetime.now().isoformat()
    metadata['status'] = 'completed'
    
    with open(f"{results_dir}/metadata.yaml", 'w') as f:
        yaml.dump(metadata, f)
    
    return {
        'results_dir': results_dir,
        'status': 'completed'
    }
`;
  
  return code;
};

// ML-Enhanced Simulation
pythonGenerator['ml_simulation'] = function(block) {
  const name = block.getFieldValue('NAME');
  const method = block.getFieldValue('METHOD');
  const modelFile = block.getFieldValue('MODEL_FILE');
  const trainingData = block.getFieldValue('TRAINING_DATA');
  const valRatio = block.getFieldValue('VAL_RATIO');
  const framework = block.getFieldValue('FRAMEWORK');
  
  // Generate ML simulation task
  const code = `
# Task: ML-Enhanced Simulation - ${method}
ml_${name}_task = PythonOperator(
    task_id='ml_${name}',
    python_callable=run_ml_simulation,
    op_kwargs={
        'name': '${name}',
        'method': '${method}',
        'model_file': '${modelFile}',
        'training_data': '${trainingData}',
        'val_ratio': ${valRatio},
        'framework': '${framework}'
    },
    dag=dag,
)

# Define ML simulation function
def run_ml_simulation(name, method, model_file, training_data, val_ratio, framework):
    """
    Run a machine learning enhanced simulation using the specified method and parameters.
    
    Args:
        name: Name of the ML model/simulation
        method: ML method to use (surrogate, PINN, etc.)
        model_file: Path to save/load the model
        training_data: Path to the training data
        val_ratio: Validation data ratio
        framework: ML framework to use
        
    Returns:
        dict: Results and metadata for the ML simulation
    """
    import os
    import yaml
    import numpy as np
    
    print(f"Starting ML-enhanced simulation '{name}' using {method} method with {framework}")
    
    # Different imports based on framework
    if framework == 'TENSORFLOW':
        # Mock imports for DAG generation
        # import tensorflow as tf
        pass
    elif framework == 'PYTORCH':
        # import torch
        pass
    elif framework == 'JAX':
        # import jax
        # import jax.numpy as jnp
        pass
    elif framework == 'SKLEARN':
        # from sklearn.model_selection import train_test_split
        # from sklearn.ensemble import RandomForestRegressor
        pass
    
    # Create results directory
    results_dir = f"results_{name}"
    os.makedirs(results_dir, exist_ok=True)
    
    # Log simulation metadata
    metadata = {
        'name': name,
        'method': method,
        'model_file': model_file,
        'training_data': training_data,
        'val_ratio': val_ratio,
        'framework': framework,
        'start_time': datetime.now().isoformat()
    }
    
    with open(f"{results_dir}/metadata.yaml", 'w') as f:
        yaml.dump(metadata, f)
    
    # Mock ML workflow based on method
    if method == 'SURROGATE':
        print(f"Training surrogate model using {training_data}")
        # In a real deployment, this would load data, train the model, and save it
        # data = pd.read_csv(training_data)
        # X, y = prepare_data(data)
        # X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=val_ratio)
        # model = train_surrogate_model(X_train, y_train, X_val, y_val)
        # model.save(model_file)
    elif method == 'PINN':
        print(f"Training physics-informed neural network")
        # Implementation would define a PINN architecture with physics constraints
    elif method == 'ACTIVE_LEARNING':
        print(f"Running active learning simulation")
        # Implementation would use an uncertainty-based sampling strategy
    elif method == 'TRANSFER':
        print(f"Applying transfer learning from pre-trained model")
        # Implementation would load a pre-trained model and fine-tune
    elif method == 'RL':
        print(f"Training reinforcement learning agent for simulation")
        # Implementation would define RL environment, agent, and training loop
    
    # Update metadata with completion info
    metadata['end_time'] = datetime.now().isoformat()
    metadata['status'] = 'completed'
    
    with open(f"{results_dir}/metadata.yaml", 'w') as f:
        yaml.dump(metadata, f)
    
    return {
        'results_dir': results_dir,
        'model_path': model_file,
        'status': 'completed'
    }
`;
  
  return code;
};

// Visualization
pythonGenerator['visualization'] = function(block) {
  const dataSource = block.getFieldValue('DATA_SOURCE');
  const vizTool = block.getFieldValue('VIZ_TOOL');
  const outputFormat = block.getFieldValue('OUTPUT_FORMAT');
  const outputPath = block.getFieldValue('OUTPUT_PATH');
  const vizScript = block.getFieldValue('VIZ_SCRIPT');
  
  // Generate visualization task
  const code = `
# Task: Scientific Visualization - ${vizTool}
visualization_task = PythonOperator(
    task_id='visualize_results',
    python_callable=visualize_data,
    op_kwargs={
        'data_source': '${dataSource}',
        'viz_tool': '${vizTool}',
        'output_format': '${outputFormat}',
        'output_path': '${outputPath}',
        'viz_script': '${vizScript}'
    },
    dag=dag,
)

# Define visualization function
def visualize_data(data_source, viz_tool, output_format, output_path, viz_script):
    """
    Generate visualizations from simulation results.
    
    Args:
        data_source: Path to data files (supports glob patterns)
        viz_tool: Visualization tool to use
        output_format: Output file format
        output_path: Directory to save visualization outputs
        viz_script: Optional custom visualization script
        
    Returns:
        dict: Paths to generated visualization files
    """
    import os
    import glob
    import subprocess
    import yaml
    
    print(f"Generating visualizations using {viz_tool} from {data_source}")
    
    # Create output directory
    os.makedirs(output_path, exist_ok=True)
    
    # List all data files
    data_files = glob.glob(data_source)
    if not data_files:
        print(f"Warning: No data files found matching {data_source}")
        return {'status': 'error', 'message': 'No data files found'}
    
    print(f"Found {len(data_files)} data files to visualize")
    
    # Prepare tool-specific visualization commands
    if viz_tool == 'PARAVIEW':
        if os.path.exists(viz_script):
            cmd = f"pvpython {viz_script} --data-source '{data_source}' --output-path '{output_path}' --format {output_format}"
        else:
            cmd = f"pvbatch --script=auto_visualize.py --data-source='{data_source}' --output-path='{output_path}' --format={output_format}"
    elif viz_tool == 'VISIT':
        cmd = f"visit -cli -s {viz_script} -args '{data_source}' '{output_path}' {output_format}"
    elif viz_tool == 'MATPLOTLIB':
        cmd = f"python {viz_script} --data '{data_source}' --output '{output_path}' --format {output_format}"
    elif viz_tool == 'PYVISTA':
        cmd = f"python {viz_script} --data '{data_source}' --output '{output_path}' --format {output_format}"
    else:  # CUSTOM
        cmd = f"python {viz_script} --data '{data_source}' --output '{output_path}' --format {output_format}"
    
    # Log visualization metadata
    metadata = {
        'data_source': data_source,
        'viz_tool': viz_tool,
        'output_format': output_format,
        'output_path': output_path,
        'viz_script': viz_script,
        'data_files': data_files,
        'start_time': datetime.now().isoformat()
    }
    
    with open(f"{output_path}/viz_metadata.yaml", 'w') as f:
        yaml.dump(metadata, f)
    
    # Execute visualization (mock execution for DAG generation)
    print(f"Executing visualization command: {cmd}")
    # In a real deployment, this would actually run the visualization
    # subprocess.run(cmd, shell=True, check=True)
    
    # Generate list of expected output files
    output_files = []
    for i, data_file in enumerate(data_files):
        base_name = os.path.splitext(os.path.basename(data_file))[0]
        if output_format == 'PNG':
            output_files.append(f"{output_path}/{base_name}.png")
        elif output_format == 'HTML':
            output_files.append(f"{output_path}/{base_name}.html")
        elif output_format == 'MP4':
            if i == 0:  # Only one video for all data
                output_files.append(f"{output_path}/animation.mp4")
        elif output_format == 'VTK':
            output_files.append(f"{output_path}/{base_name}.vtk")
    
    # Update metadata with completion info
    metadata['end_time'] = datetime.now().isoformat()
    metadata['status'] = 'completed'
    metadata['output_files'] = output_files
    
    with open(f"{output_path}/viz_metadata.yaml", 'w') as f:
        yaml.dump(metadata, f)
    
    return {
        'output_path': output_path,
        'output_files': output_files,
        'status': 'completed'
    }
`;
  
  return code;
};

// Generate WorkflowHub RO-Crate Metadata
pythonGenerator.generateWorkflowHubMetadata = function(workflowName, workflowDescription, authors, license, keywords, programmingLanguage, includeDiagram, dagCode) {
  // Create a metadata generation function that can be called when exporting
  const code = `
# Function to generate WorkflowHub.eu compatible RO-Crate metadata
def generate_workflow_ro_crate(output_path='workflow.crate.zip'):
    """
    Generate a WorkflowHub.eu compatible RO-Crate zip file including:
    - Main workflow file (this DAG)
    - Metadata file conforming to RO-Crate 1.1 standard
    - Optional workflow diagram
    
    Returns:
        str: Path to the created RO-Crate zip file
    """
    import json
    import os
    import zipfile
    import tempfile
    import shutil
    from datetime import datetime
    
    # Create a temporary directory to assemble the RO-Crate
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Create main workflow file in temp directory
        workflow_filename = '${workflowName.replace(/\s+/g, '_').toLowerCase()}.py'
        workflow_path = os.path.join(temp_dir, workflow_filename)
        
        with open(workflow_path, 'w') as f:
            f.write('''${dagCode}''')
        
        # Create ro-crate-metadata.json
        metadata = {
            "@context": "https://w3id.org/ro/crate/1.1/context",
            "@graph": [
                {
                    "@type": "CreativeWork",
                    "@id": "ro-crate-metadata.json",
                    "conformsTo": [
                        {"@id": "https://w3id.org/ro/crate/1.1"},
                        {"@id": "https://w3id.org/workflowhub/workflow-ro-crate/1.0"}
                    ],
                    "about": {"@id": "./"}
                },
                {
                    "@id": "./",
                    "@type": "Dataset",
                    "name": "${workflowName}",
                    "description": "${workflowDescription.replace(/"/g, '\\"')}",
                    "datePublished": datetime.now().isoformat(),
                    "license": {"@id": "https://spdx.org/licenses/${license}"},
                    "keywords": [${keywords.split(',').map(k => `"${k.trim()}"`).join(', ')}],
                    "mainEntity": {"@id": workflow_filename},
                    "author": [
                        ${authors.split(',').map(author => {
                            const matches = author.trim().match(/(.*?)<(.*?)>/);
                            if (matches) {
                                return `{
                                    "@type": "Person",
                                    "name": "${matches[1].trim()}",
                                    "email": "${matches[2].trim()}"
                                }`;
                            } else {
                                return `{
                                    "@type": "Person",
                                    "name": "${author.trim()}"
                                }`;
                            }
                        }).join(',\n                        ')}
                    ]
                },
                {
                    "@id": workflow_filename,
                    "@type": ["File", "SoftwareSourceCode", "ComputationalWorkflow"],
                    "name": "${workflowName} workflow",
                    "programmingLanguage": {"@id": "#${programmingLanguage}"},
                    "encodingFormat": "text/x-python"
                },
                {
                    "@id": "#${programmingLanguage}",
                    "@type": "ComputerLanguage",
                    "name": "${programmingLanguage === 'python' ? 'Python' : 
                            programmingLanguage === 'cwl' ? 'Common Workflow Language' :
                            programmingLanguage === 'nextflow' ? 'Nextflow' :
                            programmingLanguage === 'snakemake' ? 'Snakemake' : 'Apache Airflow'}"
                }
            ]
        }
        
        # If including a diagram, add it to the metadata
        if ${includeDiagram}:
            # Generate a workflow diagram (placeholder)
            diagram_filename = '${workflowName.replace(/\s+/g, '_').toLowerCase()}_diagram.png'
            diagram_path = os.path.join(temp_dir, diagram_filename)
            
            # For a real implementation, this would generate an actual diagram
            # Here, we're just creating a placeholder file
            with open(diagram_path, 'w') as f:
                f.write("Placeholder for workflow diagram")
            
            # Add the diagram to the metadata
            metadata["@graph"].append({
                "@id": diagram_filename,
                "@type": ["File", "ImageObject"],
                "name": "${workflowName} diagram",
                "encodingFormat": "image/png"
            })
            
            # Reference the diagram in the workflow entry
            for item in metadata["@graph"]:
                if item.get("@id") == workflow_filename:
                    item["image"] = {"@id": diagram_filename}
        
        # Write the metadata file
        metadata_path = os.path.join(temp_dir, 'ro-crate-metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Create the zip file with the required .crate.zip extension
        with zipfile.ZipFile(output_path, 'w') as zipf:
            # Add all files from the temp directory
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, temp_dir)
                    zipf.write(file_path, arcname)
        
        print(f"Created WorkflowHub RO-Crate: {output_path}")
        return output_path
        
    finally:
        # Clean up the temporary directory
        shutil.rmtree(temp_dir)
`;
  
  return code;
};