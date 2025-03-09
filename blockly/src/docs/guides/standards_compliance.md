# Standards Compliance Guide for SimBlockFlow

This guide explains how to create workflows that comply with scientific standards, with special focus on COMBINE standards for systems biology.

## Introduction to Standardized Workflows

Scientific workflows benefit from standardization in several ways:

- **Reproducibility**: Standards ensure workflows can be reproduced by others
- **Interoperability**: Standard formats enable tools to work together
- **Longevity**: Standards reduce dependency on specific software versions
- **Validation**: Standards provide a framework for validating results
- **Sharing**: Standards facilitate sharing and publication of workflows

## Supported Standards in SimBlockFlow

SimBlockFlow supports several important standards:

1. **COMBINE** (COmputational Modeling in BIology NEtwork)
   - SBML (Systems Biology Markup Language)
   - SED-ML (Simulation Experiment Description Markup Language)
   - OMEX (Open Modeling EXchange format)

2. **Climate and Weather**
   - CF (Climate and Forecast) Conventions
   - CMIP (Coupled Model Intercomparison Project) standards

3. **Materials Science**
   - CIF (Crystallographic Information File)
   - OPTIMADE (Open Databases Integration for Materials Design)

4. **General Scientific**
   - CWL (Common Workflow Language)
   - RO-Crate (Research Object Crate)

## Implementing COMBINE-Compliant Workflows

### 1. SBML Model Preparation

SBML (Systems Biology Markup Language) is the standard for representing systems biology models.

1. Create or import an SBML model (usually an XML file with .xml or .sbml extension)
2. Use the Data Validation block to validate the SBML model:
   ```
   data_validation:
     INPUT_DATA: model.xml
     VALIDATION_SCRIPT: validate_sbml.py
   ```
3. Make any necessary corrections to ensure the model is valid SBML

### 2. Simulation Setup with SED-ML

SED-ML (Simulation Experiment Description Markup Language) defines how to run simulations on a model.

1. Create a SED-ML file defining:
   - Which model to use
   - Simulation algorithm
   - Tasks to execute
   - Output to capture

2. Use container execution with COMBINE-compatible tools:
   ```
   container_execution:
     CONTAINER_NAME: sedml_simulation
     IMAGE: biosimulators/tellurium:latest
     COMMAND: python -m biosimulators_utils.simulator exec-sedml model.xml sed_description.xml
   ```

### 3. Creating COMBINE Archives

COMBINE archives (OMEX) package models, simulations, and results together.

1. After running simulations, collect all relevant files:
   - SBML models
   - SED-ML files
   - Simulation results
   - Visualizations
   - Documentation

2. Use the container execution block to create the COMBINE archive:
   ```
   container_execution:
     CONTAINER_NAME: create_omex
     IMAGE: icep/combine-archive:latest
     COMMAND: omex create -i model.xml -i simulation.sedml -i results.csv -o archive.omex
   ```

3. The resulting .omex file can be shared and used by any COMBINE-compatible tool

## Example: Complete COMBINE-Compliant Workflow

The "COMBINE Systems Biology" template in SimBlockFlow implements a complete standards-compliant workflow:

1. **Data Validation**: Validates an SBML model
2. **Environment Setup**: Prepares the COMBINE tools environment
3. **Simulation Execution**: Runs flux balance analysis using COBRA
4. **Parameter Sweep**: Examines different substrates using Tellurium
5. **Data Integration**: Combines results from different simulations
6. **Visualization**: Creates standardized visualizations of results
7. **COMBINE Archive Creation**: Packages everything into an OMEX archive

This workflow produces a fully compliant COMBINE archive that can be:
- Published in model repositories
- Shared with collaborators
- Used for reproducible research
- Cited in publications

## Best Practices for Standards Compliance

1. **Validation**: Always validate models against the relevant standard
2. **Metadata**: Include comprehensive metadata with models and simulations
3. **Versioning**: Specify which version of the standard you are using
4. **Tool Selection**: Use tools that explicitly support the relevant standards
5. **Documentation**: Document any standard extensions or customizations
6. **Identifiers**: Use standard identifiers (e.g., MIRIAM URIs in systems biology)
7. **Testing**: Test workflows with different standard-compliant tools

## Standards-Compliant Publishing

When your workflow is complete, you can publish it through:

1. **WorkflowHub**: Use the WorkflowHub tab to export as RO-Crate
2. **BioModels**: For systems biology models (COMBINE archives)
3. **GitHub**: With appropriate metadata and documentation
4. **Domain Repositories**: Field-specific repositories like ModelDB

## Checking Standards Compliance

SimBlockFlow provides several ways to check standards compliance:

1. **Validation Blocks**: Data validation blocks with standard-specific validation
2. **Linting Tools**: Container-based linting for standard formats
3. **Conversion Tests**: Test conversion between equivalent representations