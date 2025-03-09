# Container Execution Pattern

## Description

The **Container Execution** pattern enables the execution of tasks in isolated containerized environments. This pattern leverages container technologies (Docker, Kubernetes) to provide consistent, reproducible, and isolated execution environments for computational tasks in a workflow.

### When to Use

Use this pattern when you need to:
- Run code with specific dependencies that differ from the host environment
- Ensure reproducible execution across different environments
- Isolate tasks for security or resource management
- Execute tasks with conflicting dependencies
- Scale tasks across heterogeneous infrastructure
- Package complex software environments for easier distribution
- Provide consistent execution between development and production

## Block Interface

The Container Execution block has the following configuration options:

- **Image**: Container image to use (e.g., Docker image URI)
- **Command**: Command to execute inside the container
- **Environment Variables**: Key-value pairs of environment variables
- **Resource Limits**: CPU, memory, and other resource constraints
- **Mount Points**: Directories to mount inside the container
- **Network Settings**: Network configuration for the container
- **Execution Platform**: Where to run the container (Kubernetes, Docker, etc.)

### Block Preview

```
┌────────────────────────────────────────────────────┐
│ Run in Container                                   │
│ image [python:3.9-slim]                            │
│ command [python /app/process.py]                   │
│ cpu [1.0] memory [2Gi]                             │
│ mount [/data:/app/data]                            │
│ on [Kubernetes] ▼                                  │
└────────────────────────────────────────────────────┘
```

## Block Implementation

### Block Definition (JavaScript)

```javascript
Blockly.Blocks['container_execution'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Run in Container");
    this.appendDummyInput()
        .appendField("image")
        .appendField(new Blockly.FieldTextInput("python:3.9-slim"), "IMAGE");
    this.appendDummyInput()
        .appendField("command")
        .appendField(new Blockly.FieldTextInput("python /app/script.py"), "COMMAND");
    this.appendDummyInput()
        .appendField("cpu")
        .appendField(new Blockly.FieldNumber(1, 0.1, 32, 0.1), "CPU")
        .appendField("memory")
        .appendField(new Blockly.FieldTextInput("2Gi"), "MEMORY");
    this.appendDummyInput()
        .appendField("mount")
        .appendField(new Blockly.FieldTextInput("/data:/app/data"), "MOUNTS");
    this.appendDummyInput()
        .appendField("environment variables")
        .appendField(new Blockly.FieldTextInput("DEBUG=true,LOG_LEVEL=info"), "ENV_VARS");
    this.appendDummyInput()
        .appendField("on")
        .appendField(new Blockly.FieldDropdown([
            ["Kubernetes", "K8S"],
            ["Docker", "DOCKER"],
            ["AWS Batch", "AWS_BATCH"],
            ["Local Docker", "LOCAL_DOCKER"]
        ]), "PLATFORM");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Execute a command in a containerized environment.");
    this.setHelpUrl("");
    
    // Update fields based on platform selection
    this.setOnChange(function(changeEvent) {
      if (changeEvent.name === 'PLATFORM') {
        this.updateFields(changeEvent.newValue);
      }
    });
  },
  
  updateFields: function(platform) {
    // Show/hide fields depending on the selected platform
    if (platform === 'K8S') {
      // Add Kubernetes-specific fields or adjust existing ones
    } else if (platform === 'AWS_BATCH') {
      // Add AWS Batch-specific fields
    }
  }
};
```

### Code Generator (JavaScript)

```javascript
pythonGenerator['container_execution'] = function(block) {
  const image = block.getFieldValue('IMAGE');
  const command = block.getFieldValue('COMMAND');
  const cpu = block.getFieldValue('CPU');
  const memory = block.getFieldValue('MEMORY');
  const mounts = block.getFieldValue('MOUNTS');
  const envVars = block.getFieldValue('ENV_VARS');
  const platform = block.getFieldValue('PLATFORM');
  
  // Parse environment variables
  const envVarMap = {};
  envVars.split(',').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      envVarMap[key.trim()] = value.trim();
    }
  });
  
  // Parse mounts
  const mountList = mounts.split(',').map(m => m.trim());
  
  // Generate code based on platform
  let code = '';
  let importStmt = '';
  
  if (platform === 'K8S') {
    importStmt = 'from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import KubernetesPodOperator';
    
    // Format environment variables for K8s
    const envVarsStr = Object.entries(envVarMap)
      .map(([key, value]) => `"${key}": "${value}"`)
      .join(',\n        ');
    
    // Format volume mounts
    const volumeConfig = mountList.map((mount, index) => {
      const [hostPath, containerPath] = mount.split(':');
      return {
        hostPath,
        containerPath,
        index
      };
    });
    
    const volumesStr = volumeConfig.map(({ hostPath, index }) => 
      `volumes.append(k8s.V1Volume(
          name=f"volume-{${index}}",
          host_path=k8s.V1HostPathVolumeSource(path="${hostPath}")
      ))`
    ).join('\n    ');
    
    const volumeMountsStr = volumeConfig.map(({ containerPath, index }) => 
      `volume_mounts.append(k8s.V1VolumeMount(
          mount_path="${containerPath}",
          name=f"volume-{${index}}"
      ))`
    ).join('\n    ');
    
    // Build the KubernetesPodOperator
    code = `
# Container Execution Task - Kubernetes
${importStmt}
from kubernetes.client import models as k8s

# Define volumes and volume mounts
volumes = []
volume_mounts = []

${volumesStr}
${volumeMountsStr}

container_task = KubernetesPodOperator(
    task_id='container_execution',
    namespace='default',
    image='${image}',
    cmds=${command.split(' ')[0] === 'python' ? `["python"]` : command.includes(' ') ? `["sh", "-c"]` : `["${command}"]`},
    arguments=${command.split(' ')[0] === 'python' ? JSON.stringify(command.split(' ').slice(1)) : command.includes(' ') ? `["${command}"]` : '[]'},
    volumes=volumes,
    volume_mounts=volume_mounts,
    env_vars={${envVarsStr}},
    resources={
        'request_cpu': '${cpu}',
        'request_memory': '${memory}',
        'limit_cpu': '${cpu}',
        'limit_memory': '${memory}',
    },
    is_delete_operator_pod=True,
    get_logs=True,
    dag=dag,
)
`;
  } else if (platform === 'DOCKER') {
    importStmt = 'from airflow.providers.docker.operators.docker import DockerOperator';
    
    // Format environment variables for Docker
    const envVarsStr = Object.entries(envVarMap)
      .map(([key, value]) => `"${key}": "${value}"`)
      .join(',\n        ');
    
    // Format volume mounts for Docker
    const volumesStr = mountList.map(mount => `"${mount}"`).join(',\n        ');
    
    code = `
# Container Execution Task - Docker
${importStmt}

container_task = DockerOperator(
    task_id='container_execution',
    image='${image}',
    command=${command.includes(' ') ? `"${command}"` : `["${command}"]`},
    environment={${envVarsStr}},
    volumes=[${volumesStr}],
    cpu_shares=${Math.floor(parseFloat(cpu) * 1024)},
    mem_limit='${memory}',
    auto_remove=True,
    dag=dag,
)
`;
  } else if (platform === 'AWS_BATCH') {
    importStmt = 'from airflow.providers.amazon.aws.operators.batch import BatchOperator';
    
    code = `
# Container Execution Task - AWS Batch
${importStmt}

container_task = BatchOperator(
    task_id='container_execution',
    job_name='airflow_batch_job',
    job_definition='${image.replace(/:/g, '_').replace(/\\//g, '_')}',
    job_queue='airflow-batch-queue',
    overrides={
        'containerOverrides': {
            'command': ${JSON.stringify(command.split(' '))},
            'environment': [
                ${Object.entries(envVarMap).map(([key, value]) => `{'name': '${key}', 'value': '${value}'}`).join(',\n                ')}
            ],
            'resourceRequirements': [
                {'type': 'VCPU', 'value': '${cpu}'},
                {'type': 'MEMORY', 'value': '${memory.replace('Gi', '000').replace('Mi', '')}'}
            ]
        }
    },
    aws_conn_id='aws_default',
    dag=dag,
)
`;
  } else { // LOCAL_DOCKER
    importStmt = 'from airflow.operators.bash import BashOperator';
    
    // For local Docker, we'll use BashOperator to run docker command
    const envVarsStr = Object.entries(envVarMap)
      .map(([key, value]) => `-e "${key}=${value}"`)
      .join(' ');
    
    const volumesStr = mountList.map(mount => `-v "${mount}"`).join(' ');
    
    code = `
# Container Execution Task - Local Docker
${importStmt}

container_task = BashOperator(
    task_id='container_execution',
    bash_command=f'docker run --rm ${volumesStr} ${envVarsStr} --cpus=${cpu} --memory=${memory} ${image} ${command}',
    dag=dag,
)
`;
  }
  
  return code;
};
```

## Generated Airflow Code

The pattern generates different Airflow operators based on the selected execution platform:

### Kubernetes Pod Operator

```python
# Container Execution Task - Kubernetes
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import KubernetesPodOperator
from kubernetes.client import models as k8s

# Define volumes and volume mounts
volumes = []
volume_mounts = []

volumes.append(k8s.V1Volume(
    name=f"volume-0",
    host_path=k8s.V1HostPathVolumeSource(path="/data")
))
volume_mounts.append(k8s.V1VolumeMount(
    mount_path="/app/data",
    name=f"volume-0"
))

container_task = KubernetesPodOperator(
    task_id='container_execution',
    namespace='default',
    image='python:3.9-slim',
    cmds=["python"],
    arguments=["/app/process.py"],
    volumes=volumes,
    volume_mounts=volume_mounts,
    env_vars={"DEBUG": "true", "LOG_LEVEL": "info"},
    resources={
        'request_cpu': '1.0',
        'request_memory': '2Gi',
        'limit_cpu': '1.0',
        'limit_memory': '2Gi',
    },
    is_delete_operator_pod=True,
    get_logs=True,
    dag=dag,
)
```

### Docker Operator

```python
# Container Execution Task - Docker
from airflow.providers.docker.operators.docker import DockerOperator

container_task = DockerOperator(
    task_id='container_execution',
    image='python:3.9-slim',
    command="python /app/process.py",
    environment={"DEBUG": "true", "LOG_LEVEL": "info"},
    volumes=["/data:/app/data"],
    cpu_shares=1024,
    mem_limit='2Gi',
    auto_remove=True,
    dag=dag,
)
```

## Examples

### Example 1: Multi-Stage Data Science Pipeline

```
[Data Transfer] → [Container: Data Prep] → [Container: Model Training] → [Container: Model Evaluation]
```

This pipeline uses different containers for each stage of a data science workflow, each with appropriate dependencies.

### Example 2: Heterogeneous Compute Pipeline

```
[Container: CPU Preprocessing] → [Container: GPU Training (CUDA)] → [Container: CPU Evaluation]
```

This pipeline uses different container specifications for CPU vs GPU tasks, providing the right environment for each task.

## Best Practices

1. **Use Specific Image Tags**: Always specify exact image versions (e.g., `python:3.9.7-slim`) rather than using `latest` to ensure reproducibility.
2. **Minimal Images**: Use lightweight, purpose-built images rather than general-purpose ones to reduce overhead.
3. **Volume Management**: Mount only the necessary data volumes to maintain isolation and security.
4. **Resource Allocation**: Specify appropriate CPU and memory resources based on workload requirements.
5. **Environment Variables**: Use environment variables to configure container behavior rather than hardcoding values.
6. **Container Registry**: Use a reliable container registry with versioning and access controls.
7. **Security**: Avoid running containers with elevated privileges unless absolutely necessary.
8. **Logging**: Configure containers to output logs to stdout/stderr for Airflow to capture.

## Advanced Features

### Custom Container Registry Authentication

When using private container registries:

```python
# Add authentication for private container registry
from airflow.models import Connection
from airflow.hooks.base import BaseHook

registry_conn_id = 'my_private_registry'
registry_conn = BaseHook.get_connection(registry_conn_id)

container_task = KubernetesPodOperator(
    # ... other parameters ...
    image_pull_secrets=[k8s.V1LocalObjectReference(registry_conn.conn_id)],
    dag=dag,
)
```

### Resource Auto-scaling

For workloads with variable resource needs:

```python
def calculate_resources(**kwargs):
    """Dynamically calculate resources based on input data"""
    input_size = get_data_size(kwargs['data_path'])
    cpu = min(max(1.0, input_size / 1e9), 8.0)  # Scale CPU with data size, between 1-8 cores
    memory = min(max(2, input_size / 5e8), 16)  # Scale memory with data size, between 2-16 GB
    return {
        'cpu': f"{cpu}",
        'memory': f"{memory}Gi"
    }

# Use as part of a task
resources = calculate_resources(data_path='/path/to/data')
```

## Related Patterns

- [Resource Allocation](resource_allocation.md) - More detailed control over computational resources
- [HPC Job Submission](hpc_job.md) - For submitting jobs to HPC clusters
- [Distributed Computation](distributed_computation.md) - For distributing work across nodes
- [Cloud Integration](cloud_integration.md) - For integrating with cloud services
- [Parameter Sweep](../simulation/parameter_sweep.md) - Often used with containers for parallel processing