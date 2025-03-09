# SimBlock: Pattern-Based Scientific Workflow Design

SimBlock is a comprehensive toolkit for building scientific workflows using visual pattern-based design with Google Blockly and executing them with Apache Airflow.

## Overview

SimBlock enables domain experts (scientists, researchers) to design complex workflows without writing code. It uses:

- **Google Blockly** for visual workflow design
- **Apache Airflow** for robust, distributed execution
- **Pattern-based approach** that encapsulates best practices in reusable components

This combination allows scientists to focus on the scientific process while ensuring workflows execute reliably.

## Features

- **Visual Workflow Design**: Drag-and-drop interface for building workflows
- **Pattern Library**: Pre-built patterns for simulation, data management, and analysis
- **Airflow Integration**: Automatic generation of Airflow DAGs
- **Distributed Execution**: Run workflows across multiple machines
- **Extensible Framework**: Easily add new patterns for custom needs

## Architecture

SimBlock consists of three main components:

1. **Blockly Frontend**: Web interface for visual workflow design
2. **API Server**: Handles pattern metadata and DAG deployment
3. **Airflow Backend**: Executes the generated workflows

## Getting Started

### Using Docker (Recommended)

The easiest way to start is with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/simblock.git
cd simblock

# Start all services
docker-compose up -d

# Access the UI at http://localhost:3000
# Access Airflow at http://localhost:8080
```

### Manual Installation

#### Prerequisites

- Node.js 18+
- Python 3.9+
- Apache Airflow 2.6+

#### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/simblock.git
cd simblock

# Install and start the frontend
cd blockly
npm install
npm start

# Install and start the API server
cd ../airflow/api
pip install -r requirements.txt
python app.py

# Setup Airflow separately (refer to Airflow documentation)
```

## Usage

1. **Design Your Workflow**:
   - Open the SimBlock UI at http://localhost:3000
   - Drag pattern blocks from the toolbox to the workspace
   - Connect blocks to form your workflow
   - Configure each block's parameters

2. **Generate DAG Code**:
   - Click "Generate Code" to create Airflow Python code
   - Review the generated code

3. **Deploy to Airflow**:
   - Download the DAG file or use the "Deploy" button
   - The DAG will appear in Airflow's UI

4. **Execute the Workflow**:
   - Trigger the DAG from Airflow's UI
   - Monitor execution in real time

## Pattern Library

SimBlock includes patterns in several categories:

### Simulation Patterns
- **Simulation Execution**: Run simulations with parameters
- **Parameter Sweep**: Run multiple simulations with varying parameters

### Data Patterns
- **Data Transfer**: Move data between locations
- **ETL Process**: Extract, transform, and load data
- **Data Validation**: Check data quality

### Analysis Patterns
- **Result Interpretation**: Process and visualize results
- **Model Calibration**: Iteratively calibrate models

## Documentation

- [Getting Started Guide](./docs/tutorials/getting_started.md)
- [Pattern Design Guide](./docs/patterns/pattern_design_guide.md)
- [API Reference](./docs/api/api_reference.md)

## Development

### Adding New Patterns

See the [Pattern Design Guide](./docs/patterns/pattern_design_guide.md) for instructions on adding new patterns to the library.

### Project Structure

```
simblock/
├── blockly/                # Frontend code
│   ├── src/
│   │   ├── blocks/         # Block definitions
│   │   ├── generators/     # Code generators
│   │   └── components/     # React components
├── airflow/
│   ├── api/                # API server
│   ├── dags/               # Example DAGs
│   └── operators/          # Custom operators
└── docs/                   # Documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Google Blockly](https://developers.google.com/blockly)
- [Apache Airflow](https://airflow.apache.org/)
- Scientific workflow researchers and practitioners