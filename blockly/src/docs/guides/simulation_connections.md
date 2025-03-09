# Using Simulation Connections in SimBlockFlow

This guide explains how to create and manage connections for different simulation software and how to use them with the specialized simulation blocks in SimBlockFlow.

## What are Simulation Connections?

Simulation connections are reusable configurations that define how to connect to different simulation software and computing resources. They allow you to:

- Store connection details once and reuse them across multiple blocks
- Manage credentials securely
- Abstract the connection details from the workflow definition
- Switch between different execution environments without changing the workflow

## Setting Up Connections

### 1. Navigate to the Connections Tab

1. Open the Control Panel on the right side of the SimBlockFlow interface
2. Click on the "Connections" tab

### 2. Create a New Connection

Click the "+ Add Connection" button and fill in the following details:

- **Connection ID**: A unique identifier for the connection (e.g., "local_openfoam")
- **Type**: The type of connection (choose from the dropdown)
- **Description**: Optional description of the connection
- **Host**: Hostname or IP address for remote connections
- **Port**: Port number for the connection
- **Login**: Username for authentication
- **Password**: Password or access key (stored securely)
- **Extra**: Additional JSON configuration parameters

### 3. Connection Types for Simulations

SimBlockFlow supports several simulation-specific connection types:

- **OpenFOAM**: Connections to OpenFOAM installations
- **GROMACS**: Connections to GROMACS molecular dynamics software
- **LAMMPS**: Connections to LAMMPS molecular dynamics software
- **NAMD**: Connections to NAMD molecular dynamics software
- **TensorFlow**: Connections to TensorFlow for ML-enhanced simulations
- **PyTorch**: Connections to PyTorch for ML-enhanced simulations

### 4. Test the Connection

After creating a connection, click the "Test" button to verify that the connection works. This will:

- Check that the software is accessible
- Verify credentials
- Confirm that the connection parameters are valid

## Using Connections in Simulation Blocks

### CFD Simulation Block

1. Add a "CFD Simulation" block to your workflow
2. Configure all simulation parameters
3. In the "using connection" dropdown, select your CFD connection
4. The block will use this connection when executed

Example for using an OpenFOAM connection:
- Choose a connection like "hpc_openfoam" from the dropdown
- The simulation will execute on the HPC cluster using OpenFOAM
- Resources will be allocated according to the connection configuration

### Molecular Dynamics Block

1. Add a "Molecular Dynamics" block to your workflow
2. Configure all simulation parameters
3. In the "using connection" dropdown, select your MD connection
4. The block will use this connection when executed

Example for using a GROMACS connection:
- Choose a connection like "cluster_gromacs" from the dropdown
- The simulation will execute using GROMACS on the specified cluster
- Input/output will be handled according to the connection configuration

### ML-Enhanced Simulation Block

1. Add an "ML-Enhanced Simulation" block to your workflow
2. Configure all simulation parameters
3. In the "using connection" dropdown, select your ML framework connection
4. The block will use this connection when executed

Example for using a TensorFlow connection:
- Choose a connection like "gpu_tensorflow" from the dropdown
- The simulation will execute using TensorFlow on the GPU resources
- Model training and inference will use the specified resources

## Best Practices for Simulation Connections

1. **Naming Convention**: Use a consistent naming convention for connections (e.g., "location_software")
2. **Connection Types**: Use specific connection types rather than generic ones when possible
3. **Environment Variables**: Use environment variables for sensitive values when possible
4. **Connection Testing**: Always test connections before using them in workflows
5. **Documentation**: Document connection requirements for your workflow
6. **Resource Allocation**: Specify resource requirements in the connection extra parameters

## Example Connection Configurations

### OpenFOAM on HPC

```json
{
  "conn_id": "hpc_openfoam",
  "conn_type": "openfoam",
  "host": "hpc.example.org",
  "port": 22,
  "login": "username",
  "password": "password",
  "extra": {
    "openfoam_version": "v2112",
    "mpi_processes": 64,
    "scheduler": "slurm",
    "queue": "compute",
    "modules": ["openfoam/v2112", "mpi/openmpi-4.1.1"]
  }
}
```

### GROMACS on Local Machine

```json
{
  "conn_id": "local_gromacs",
  "conn_type": "gromacs",
  "host": "localhost",
  "extra": {
    "gromacs_path": "/opt/gromacs/bin",
    "gromacs_version": "2021.4",
    "gpu_enabled": true,
    "cuda_version": "11.4"
  }
}
```

### TensorFlow on GPU Cluster

```json
{
  "conn_id": "gpu_tensorflow",
  "conn_type": "tensorflow",
  "host": "gpu-cluster.example.org",
  "port": 22,
  "login": "username",
  "password": "password",
  "extra": {
    "tf_version": "2.8.0",
    "gpu_count": 4,
    "gpu_type": "tesla_v100",
    "container_image": "tensorflow/tensorflow:2.8.0-gpu",
    "scheduler": "slurm",
    "queue": "gpu"
  }
}
```

## Troubleshooting Connections

If you encounter issues with your connections:

1. Verify that the connection parameters are correct
2. Check that the simulation software is properly installed and accessible
3. Ensure that any required authentication keys or certificates are valid
4. Check firewall settings if connecting to remote resources
5. Verify that the specified resources (GPUs, CPUs, memory) are available
6. Look for error messages in the execution log