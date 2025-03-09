# SimBlockFlow Templates

This directory contains XML template files that define pre-built workflow patterns for common simulation scenarios. These templates can be loaded directly into the SimBlockFlow workspace to accelerate workflow creation.

## Adding New Templates

To add a new template:

1. Create a new XML file in this directory with a descriptive name (e.g., `parameter_sweep_hpc.xml`)
2. Use the Blockly XML format as shown in the existing templates
3. Test your template by loading it in SimBlockFlow
4. Update the `TemplatesBrowser.js` component to include your new template in the list

## Template Categories

Templates are organized by these categories:

- **CFD Workflows** - Computational Fluid Dynamics simulations
- **Molecular Dynamics** - Protein folding, material science, etc.
- **Machine Learning** - ML-enhanced simulations, surrogate models
- **HPC Patterns** - High-performance computing workflows
- **Cloud Patterns** - Cloud-based simulation deployments

## Best Practices

When creating templates:

1. Include a complete workflow with all necessary steps
2. Start with a trigger block (workflow_trigger)
3. Add proper data movement (data_transfer) blocks
4. Include environment setup blocks where appropriate
5. End with results interpretation or visualization blocks
6. Use descriptive names for all blocks and fields
7. Use relative paths where possible for better portability

## Example Structure

A typical simulation template should have this general structure:

```
<workflow_trigger>
  <data_transfer/preparation>
    <environment_setup>
      <simulation_blocks>
        <checkpoint/restart>
      <post_processing>
        <visualization>
        <result_interpretation>
    <notification/reporting>
```

## Future Improvements

- Dynamic template loading from filesystem
- Template versioning and compatibility checking
- User-contributed template repository
- Template tagging and advanced search