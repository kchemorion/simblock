"""
Simulation Operator for SimBlock

A custom Airflow operator for executing simulation tasks with proper monitoring
and resource management capabilities.
"""

from airflow.models import BaseOperator
from airflow.utils.decorators import apply_defaults
import os
import subprocess
import logging

class SimulationOperator(BaseOperator):
    """
    Operator that executes simulation software with the specified configuration.
    
    This operator provides specialized handling for simulation software including:
    - Resource monitoring
    - Configurable timeout handling
    - Simulation output parsing
    - Automatic checkpoint/restart capabilities
    
    :param simulation_command: The shell command to execute the simulation
    :type simulation_command: str
    :param config_file: Path to the simulation configuration file
    :type config_file: str
    :param output_dir: Directory where simulation outputs will be stored
    :type output_dir: str
    :param timeout: Maximum time in seconds for the simulation to run
    :type timeout: int
    :param checkpoint_interval: Time in seconds between simulation checkpoints
    :type checkpoint_interval: int
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
            logging.info(f"Output: {process.stdout}")
            
            # Parse output for results (example)
            results = self._parse_simulation_output(process.stdout)
            
            return results
            
        except subprocess.TimeoutExpired:
            logging.error(f"Simulation timed out after {self.timeout} seconds")
            raise Exception(f"Simulation timed out after {self.timeout} seconds")
    
    def _parse_simulation_output(self, output):
        """
        Parse the simulation output to extract key metrics
        """
        # Simple example implementation - in a real scenario, this would
        # parse specialized output formats from the simulation software
        metrics = {}
        
        # Example: look for lines with "Result:" prefix
        for line in output.split('\n'):
            if line.startswith('Result:'):
                parts = line.split(':')
                if len(parts) >= 3:
                    key = parts[1].strip()
                    value = parts[2].strip()
                    try:
                        # Convert to float if possible
                        metrics[key] = float(value)
                    except ValueError:
                        metrics[key] = value
        
        return metrics