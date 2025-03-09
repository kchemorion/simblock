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
PATTERNS_FOLDER = os.environ.get('PATTERNS_FOLDER', '../../patterns')

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
    Retrieve available patterns metadata and documentation
    """
    try:
        # Load patterns based on the patterns directory structure
        patterns = []
        categories = {
            'simulation': 'Simulation',
            'data': 'Data',
            'workflow': 'Workflow',
            'analysis': 'Analysis',
            'infrastructure': 'Infrastructure'
        }
        
        # Try to scan pattern directories
        patterns_root = os.path.abspath(PATTERNS_FOLDER)
        
        for category_dir, category_name in categories.items():
            category_path = os.path.join(patterns_root, category_dir)
            
            if os.path.isdir(category_path):
                # List all markdown files in this category
                pattern_files = [f for f in os.listdir(category_path) 
                               if f.endswith('.md') and os.path.isfile(os.path.join(category_path, f))]
                
                for pattern_file in pattern_files:
                    pattern_path = os.path.join(category_path, pattern_file)
                    pattern_id = os.path.splitext(pattern_file)[0]
                    
                    # Extract name and description from the markdown
                    pattern_name = pattern_id.replace('_', ' ').title()
                    description = ''
                    
                    try:
                        with open(pattern_path, 'r') as f:
                            content = f.read()
                            # Try to extract pattern name from the first heading
                            title_match = content.split('\n')[0]
                            if title_match.startswith('# '):
                                pattern_name = title_match[2:].strip()
                            
                            # Extract first paragraph as description
                            desc_lines = []
                            in_first_para = False
                            for line in content.split('\n')[1:]:
                                if not line.strip() and not in_first_para:
                                    continue
                                elif not line.strip() and in_first_para:
                                    break
                                elif line.strip() and not line.startswith('#'):
                                    in_first_para = True
                                    desc_lines.append(line.strip())
                            
                            if desc_lines:
                                description = ' '.join(desc_lines)
                    except Exception as e:
                        logger.error(f"Error reading pattern file {pattern_path}: {e}")
                    
                    # Create pattern metadata
                    patterns.append({
                        'id': pattern_id,
                        'name': pattern_name,
                        'category': category_name,
                        'description': description,
                        'doc_path': f"{category_dir}/{pattern_file}"
                    })
        
        # If no patterns found from files, use hardcoded defaults
        if not patterns:
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

@app.route('/api/pattern-doc/<path:doc_path>', methods=['GET'])
def get_pattern_doc(doc_path):
    """
    Get documentation content for a specific pattern
    """
    try:
        # Ensure we don't allow path traversal
        if '..' in doc_path:
            return jsonify({
                'success': False,
                'error': 'Invalid document path'
            }), 400
        
        full_path = os.path.join(PATTERNS_FOLDER, doc_path)
        
        if not os.path.isfile(full_path):
            return jsonify({
                'success': False,
                'error': f'Document not found: {doc_path}'
            }), 404
        
        # Read the markdown content
        with open(full_path, 'r') as f:
            content = f.read()
        
        return jsonify({
            'success': True,
            'content': content
        })
        
    except Exception as e:
        logger.error(f"Error retrieving pattern documentation: {str(e)}")
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