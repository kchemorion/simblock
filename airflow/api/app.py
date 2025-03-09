"""
SimBlock API Server

This Flask application provides API endpoints for:
- Deploying generated DAGs to Airflow
- Retrieving available patterns
- Monitoring workflow execution
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import datetime
import logging
import sys

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
AIRFLOW_DAGS_FOLDER = os.environ.get('AIRFLOW_DAGS_FOLDER', '/opt/airflow/dags')
PATTERNS_FOLDER = os.environ.get('PATTERNS_FOLDER', '../patterns')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/deploy-dag', methods=['POST'])
def deploy_dag():
    """
    Deploy a generated DAG to the Airflow DAGs folder
    
    Request body should contain:
    - dag_code: The Python code for the DAG
    - dag_name: The name for the DAG file (without .py)
    """
    try:
        data = request.json
        
        if not data or 'dag_code' not in data or 'dag_name' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: dag_code and dag_name'
            }), 400
        
        dag_code = data['dag_code']
        dag_name = data['dag_name']
        
        # Ensure the filename has .py extension
        if not dag_name.endswith('.py'):
            dag_name = f"{dag_name}.py"
        
        # Create the full path
        dag_path = os.path.join(AIRFLOW_DAGS_FOLDER, dag_name)
        
        # Write the DAG file
        with open(dag_path, 'w') as f:
            f.write(dag_code)
        
        logger.info(f"Deployed DAG to {dag_path}")
        
        return jsonify({
            'success': True,
            'message': f'DAG deployed successfully to {dag_path}'
        })
        
    except Exception as e:
        logger.error(f"Error deploying DAG: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/patterns', methods=['GET'])
def get_patterns():
    """
    Retrieve available patterns metadata
    """
    try:
        # In a real implementation, this would load from a database or file
        # For now, we'll return a hardcoded list of patterns
        patterns = [
            {
                'id': 'simulation_execution',
                'name': 'Simulation Execution',
                'category': 'Simulation',
                'description': 'Runs a simulation with given parameters',
                'parameters': [
                    {
                        'name': 'SIM_NAME',
                        'type': 'string',
                        'description': 'Name of the simulation'
                    },
                    {
                        'name': 'CONFIG_FILE',
                        'type': 'string',
                        'description': 'Path to configuration file'
                    }
                ]
            },
            {
                'id': 'parameter_sweep',
                'name': 'Parameter Sweep',
                'category': 'Simulation',
                'description': 'Iterates over a set of parameters and executes a sub-workflow for each parameter set',
                'parameters': [
                    {
                        'name': 'PARAM_VAR',
                        'type': 'variable',
                        'description': 'Parameter variable name'
                    },
                    {
                        'name': 'PARAM_RANGE',
                        'type': 'string',
                        'description': 'Range of parameter values (e.g. "1..5")'
                    }
                ]
            },
            {
                'id': 'data_transfer',
                'name': 'Data Transfer',
                'category': 'Data',
                'description': 'Moves or copies data from one location to another',
                'parameters': [
                    {
                        'name': 'SRC',
                        'type': 'string',
                        'description': 'Source path or URI'
                    },
                    {
                        'name': 'DEST',
                        'type': 'string',
                        'description': 'Destination path or URI'
                    }
                ]
            },
            {
                'id': 'result_interpretation',
                'name': 'Result Interpretation',
                'category': 'Analysis',
                'description': 'Processes results to derive insights',
                'parameters': [
                    {
                        'name': 'METHOD',
                        'type': 'enum',
                        'options': ['STATS', 'PLOT'],
                        'description': 'Analysis method'
                    }
                ]
            }
        ]
        
        return jsonify({
            'success': True,
            'patterns': patterns
        })
        
    except Exception as e:
        logger.error(f"Error retrieving patterns: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/dag-status/<dag_id>', methods=['GET'])
def get_dag_status(dag_id):
    """
    Get the status of a DAG's recent runs
    
    In a real implementation, this would query the Airflow API
    """
    try:
        # Mock response for demo purposes
        status = {
            'dag_id': dag_id,
            'is_active': True,
            'last_run': datetime.datetime.now().isoformat(),
            'runs': [
                {
                    'run_id': f'run_{dag_id}_1',
                    'start_date': (datetime.datetime.now() - datetime.timedelta(hours=1)).isoformat(),
                    'end_date': datetime.datetime.now().isoformat(),
                    'state': 'success',
                    'tasks': {
                        'total': 5,
                        'success': 5,
                        'failed': 0,
                        'running': 0
                    }
                }
            ]
        }
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        logger.error(f"Error retrieving DAG status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)