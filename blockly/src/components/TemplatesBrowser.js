import React, { useState } from 'react';

/**
 * Component for browsing and applying pre-built templates
 */
function TemplatesBrowser({ workspace }) {
  const [activeCategory, setActiveCategory] = useState('all');

  // Template categories
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'cfd', name: 'CFD Workflows' },
    { id: 'md', name: 'Molecular Dynamics' },
    { id: 'ml', name: 'Machine Learning' },
    { id: 'hpc', name: 'HPC Patterns' },
    { id: 'cloud', name: 'Cloud Patterns' },
    { id: 'systems', name: 'Systems Biology' }
  ];

  // Template definitions - in production, these would be loaded from the filesystem
  // For demo purposes, we're hardcoding them, but in a real implementation, 
  // we would scan the templates directory and load templates dynamically
  const templates = [
    {
      id: 'combine_systems_biology',
      name: 'COMBINE Systems Biology',
      category: 'systems',
      description: 'Systems biology simulation workflow using COMBINE standards with SBML model and OMEX archive.',
      complexity: 'Intermediate',
      imgSrc: null,
      xmlContent: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="workflow_trigger" x="20" y="20">
    <field name="TRIGGER_TYPE">MANUAL</field>
    <next>
      <block type="data_validation">
        <field name="INPUT_DATA">model.xml</field>
        <field name="VALIDATION_SCRIPT">validate_sbml.py</field>
        <next>
          <block type="environment_setup">
            <field name="ENV_NAME">systems_biology_env</field>
            <field name="SETUP_SCRIPT">setup_combine.sh</field>
            <next>
              <block type="container_execution">
                <field name="CONTAINER_NAME">sbml_simulation</field>
                <field name="IMAGE">opencobra/cobrapy:latest</field>
                <field name="COMMAND">python -m cobra.flux_analysis.parsimonious --sbml_path=/data/model.xml --output=/data/flux_solution.csv</field>
                <field name="PLATFORM">DOCKER</field>
                <next>
                  <block type="parameter_sweep">
                    <field name="PARAM_VAR">substrate</field>
                    <field name="PARAM_SOURCE">LIST</field>
                    <field name="PARAM_VALUES">"glucose", "fructose", "galactose", "mannose"</field>
                    <field name="PARALLEL">TRUE</field>
                    <statement name="DO">
                      <block type="container_execution">
                        <field name="CONTAINER_NAME">substrate_simulation</field>
                        <field name="IMAGE">systemsbiology/tellurium:latest</field>
                        <field name="COMMAND">python simulate_kinetics.py --model=/data/model.xml --substrate=$\{substrate\} --output=/data/results_$\{substrate\}.csv</field>
                        <field name="PLATFORM">DOCKER</field>
                      </block>
                    </statement>
                    <next>
                      <block type="data_transformation">
                        <field name="INPUT_DATA">/data/results_*.csv</field>
                        <field name="OUTPUT_FILE">combined_results.csv</field>
                        <field name="TRANSFORMATION_SCRIPT">combine_results.py</field>
                        <next>
                          <block type="data_visualization">
                            <field name="DATA_SOURCE">combined_results.csv</field>
                            <field name="VIZ_TYPE">LINE_PLOT</field>
                            <field name="X_AXIS">time</field>
                            <field name="Y_AXIS">concentration</field>
                            <field name="OUTPUT_FILE">substrate_comparison.svg</field>
                            <next>
                              <block type="container_execution">
                                <field name="CONTAINER_NAME">create_combine_archive</field>
                                <field name="IMAGE">icep/combine-archive:latest</field>
                                <field name="COMMAND">omex create -i /data/model.xml -i /data/combined_results.csv -i /data/substrate_comparison.svg -o /data/simulation_results.omex</field>
                                <field name="PLATFORM">DOCKER</field>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>`
    },
    {
      id: 'cfd_openfoam',
      name: 'OpenFOAM CFD Pipeline',
      category: 'cfd',
      description: 'Complete CFD simulation workflow using OpenFOAM with pre/post-processing.',
      complexity: 'Advanced',
      imgSrc: '/templates/cfd_openfoam.png',
      xmlContent: `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="workflow_trigger" x="20" y="20">
    <field name="TRIGGER_TYPE">SCHEDULED</field>
    <field name="SCHEDULE">0 0 * * *</field>
    <next>
      <block type="data_transfer">
        <field name="SOURCE">/input/mesh.msh</field>
        <field name="DESTINATION">/work/mesh.msh</field>
        <next>
          <block type="environment_setup">
            <field name="ENV_NAME">openfoam_env</field>
            <field name="SETUP_SCRIPT">setup_openfoam.sh</field>
            <next>
              <block type="cfd_simulation">
                <field name="NAME">pipe_flow</field>
                <field name="SOLVER">OPENFOAM</field>
                <field name="MESH">mesh.msh</field>
                <field name="CONFIG">pipe_flow.yaml</field>
                <field name="ITERATIONS">2000</field>
                <field name="CONVERGENCE">1e-6</field>
                <field name="TURBULENCE">K_EPSILON</field>
                <next>
                  <block type="checkpoint_restart">
                    <field name="SIM_NAME">pipe_flow</field>
                    <field name="FREQUENCY">30</field>
                    <field name="CHECKPOINT_DIR">/checkpoints</field>
                    <field name="MAX_CHECKPOINTS">5</field>
                    <field name="RESTART_MODE">NONE</field>
                    <next>
                      <block type="visualization">
                        <field name="DATA_SOURCE">results/*.vtu</field>
                        <field name="VIZ_TOOL">PARAVIEW</field>
                        <field name="OUTPUT_FORMAT">PNG</field>
                        <field name="OUTPUT_PATH">viz_output/</field>
                        <field name="VIZ_SCRIPT">visualize_flow.py</field>
                        <next>
                          <block type="data_transfer">
                            <field name="SOURCE">viz_output/</field>
                            <field name="DESTINATION">/output/viz_output/</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>
      `
    },
    {
      id: 'md_protein',
      name: 'Protein Folding Analysis',
      category: 'md',
      description: 'Molecular dynamics workflow for protein folding with multi-stage equilibration.',
      complexity: 'Intermediate',
      imgSrc: '/templates/md_protein.png',
      xmlContent: `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="workflow_trigger" x="20" y="20">
    <field name="TRIGGER_TYPE">MANUAL</field>
    <next>
      <block type="data_validation">
        <field name="INPUT_DATA">protein_data.pdb</field>
        <field name="VALIDATION_SCRIPT">validate_pdb.py</field>
        <next>
          <block type="environment_setup">
            <field name="ENV_NAME">gromacs_env</field>
            <field name="SETUP_SCRIPT">load_gromacs.sh</field>
            <next>
              <block type="molecular_dynamics">
                <field name="NAME">energy_minimization</field>
                <field name="ENGINE">GROMACS</field>
                <field name="TOPOLOGY">protein.top</field>
                <field name="PARAMS">em.mdp</field>
                <field name="TIMESTEP">2</field>
                <field name="SIM_TIME">0.1</field>
                <field name="ENSEMBLE">NVT</field>
                <next>
                  <block type="molecular_dynamics">
                    <field name="NAME">equilibration</field>
                    <field name="ENGINE">GROMACS</field>
                    <field name="TOPOLOGY">protein.top</field>
                    <field name="PARAMS">eq.mdp</field>
                    <field name="TIMESTEP">2</field>
                    <field name="SIM_TIME">1</field>
                    <field name="ENSEMBLE">NPT</field>
                    <next>
                      <block type="molecular_dynamics">
                        <field name="NAME">production</field>
                        <field name="ENGINE">GROMACS</field>
                        <field name="TOPOLOGY">protein.top</field>
                        <field name="PARAMS">md.mdp</field>
                        <field name="TIMESTEP">2</field>
                        <field name="SIM_TIME">50</field>
                        <field name="ENSEMBLE">NPT</field>
                        <next>
                          <block type="result_interpretation">
                            <field name="INPUT_DATA">production.xtc</field>
                            <field name="ANALYSIS_SCRIPT">analyze_trajectory.py</field>
                            <field name="OUTPUT_FILE">analysis_results.json</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>
      `
    },
    {
      id: 'parameter_sweep_hpc',
      name: 'HPC Parameter Sweep',
      category: 'hpc',
      description: 'Efficient parameter sweep optimized for high-performance computing systems.',
      complexity: 'Beginner',
      imgSrc: '/templates/param_sweep.png',
      xmlContent: `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="workflow_trigger" x="20" y="20">
    <field name="TRIGGER_TYPE">MANUAL</field>
    <next>
      <block type="resource_allocation">
        <field name="RESOURCE_TYPE">HPC</field>
        <field name="CPU_CORES">64</field>
        <field name="MEMORY">128</field>
        <field name="RUNTIME">4</field>
        <field name="QUEUE">normal</field>
        <next>
          <block type="parameter_sweep">
            <field name="PARAM_VAR">temperature</field>
            <field name="PARAM_SOURCE">RANGE</field>
            <field name="PARAM_VALUES">273..373..10</field>
            <field name="PARALLEL">TRUE</field>
            <statement name="DO">
              <block type="simulation_execution">
                <field name="SIM_NAME">temp_sim</field>
                <field name="CONFIG">base_config.yaml</field>
                <field name="OUTPUT_DIR">/output/temp_\${temperature}</field>
                <field name="TIMEOUT">1800</field>
                <field name="CONNECTION_ID">hpc_cluster</field>
              </block>
            </statement>
            <next>
              <block type="data_integration">
                <field name="DATA_SOURCES">/output/temp_*/results.csv</field>
                <field name="OUTPUT_FILE">integrated_results.csv</field>
                <field name="INTEGRATION_TYPE">MERGE</field>
                <next>
                  <block type="data_visualization">
                    <field name="DATA_SOURCE">integrated_results.csv</field>
                    <field name="VIZ_TYPE">LINE_PLOT</field>
                    <field name="X_AXIS">temperature</field>
                    <field name="Y_AXIS">reaction_rate</field>
                    <field name="OUTPUT_FILE">temperature_effect.png</field>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>
      `
    },
    {
      id: 'ml_surrogate',
      name: 'ML Surrogate Model',
      category: 'ml',
      description: 'Create and use a machine learning surrogate model to accelerate simulations.',
      complexity: 'Advanced',
      imgSrc: '/templates/ml_surrogate.png',
      xmlContent: `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="workflow_trigger" x="20" y="20">
    <field name="TRIGGER_TYPE">API</field>
    <next>
      <block type="monte_carlo_simulation">
        <field name="NAME">training_data_gen</field>
        <field name="ITERATIONS">100</field>
        <field name="BASE_CONFIG">base_config.yaml</field>
        <field name="SEED">42</field>
        <statement name="DO">
          <block type="simulation_execution">
            <field name="SIM_NAME">sim_\${iteration}</field>
            <field name="CONFIG">config_\${iteration}.yaml</field>
            <field name="OUTPUT_DIR">/output/sim_\${iteration}</field>
            <field name="TIMEOUT">3600</field>
            <field name="CONNECTION_ID">hpc_cluster</field>
          </block>
        </statement>
        <next>
          <block type="data_transformation">
            <field name="INPUT_DATA">/output/sim_*/results.csv</field>
            <field name="OUTPUT_FILE">training_data.csv</field>
            <field name="TRANSFORMATION_SCRIPT">prepare_ml_data.py</field>
            <next>
              <block type="ml_simulation">
                <field name="NAME">surrogate_model</field>
                <field name="METHOD">SURROGATE</field>
                <field name="MODEL_FILE">surrogate.h5</field>
                <field name="TRAINING_DATA">training_data.csv</field>
                <field name="VAL_RATIO">0.2</field>
                <field name="FRAMEWORK">TENSORFLOW</field>
                <next>
                  <block type="sensitivity_analysis">
                    <field name="MODEL">surrogate_model</field>
                    <field name="METHOD">SOBOL</field>
                    <field name="PARAMS">param1,param2,param3,param4</field>
                    <field name="SAMPLES">1000</field>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>
      `
    },
    {
      id: 'cloud_deployment',
      name: 'Scalable Cloud Deployment',
      category: 'cloud',
      description: 'Deploy simulations to cloud infrastructure with auto-scaling capability.',
      complexity: 'Intermediate',
      imgSrc: '/templates/cloud_deployment.png',
      xmlContent: `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="workflow_trigger" x="20" y="20">
    <field name="TRIGGER_TYPE">SCHEDULED</field>
    <field name="SCHEDULE">0 0 * * *</field>
    <next>
      <block type="container_execution">
        <field name="CONTAINER_IMAGE">simulation:latest</field>
        <field name="PLATFORM">KUBERNETES</field>
        <field name="RESOURCE_LIMITS">CPU=4,Memory=8Gi</field>
        <field name="COMMAND">python run_sim.py</field>
        <next>
          <block type="parallel_execution">
            <field name="PARALLEL_INSTANCES">5</field>
            <field name="MAX_CONCURRENT">3</field>
            <statement name="TASKS">
              <block type="simulation_execution">
                <field name="SIM_NAME">cloud_sim</field>
                <field name="CONFIG">config.yaml</field>
                <field name="OUTPUT_DIR">/output/sim_\${instance_id}</field>
                <field name="TIMEOUT">7200</field>
                <field name="CONNECTION_ID">aws_default</field>
              </block>
            </statement>
            <next>
              <block type="data_integration">
                <field name="DATA_SOURCES">/output/sim_*/results.csv</field>
                <field name="OUTPUT_FILE">integrated_results.csv</field>
                <field name="INTEGRATION_TYPE">AGGREGATE</field>
                <next>
                  <block type="notification">
                    <field name="CHANNEL">EMAIL</field>
                    <field name="RECIPIENTS">user@example.com</field>
                    <field name="SUBJECT">Cloud simulation completed</field>
                    <field name="MESSAGE">All simulations have completed. Results are available at: https://results.example.com/\${run_id}</field>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>
      `
    }
  ];

  // Function to load a template into the workspace
  const loadTemplate = (templateXml) => {
    if (workspace) {
      try {
        // Ask for confirmation before clearing workspace
        if (workspace.getAllBlocks(false).length > 0) {
          if (!window.confirm('Loading a template will replace your current workflow. Continue?')) {
            return;
          }
        }
        
        // Clear current workspace
        workspace.clear();
        
        // Load template XML
        const xml = Blockly.utils.xml.textToDom(templateXml);
        Blockly.Xml.domToWorkspace(xml, workspace);
        
        // Center the workspace view
        workspace.scrollCenter();
        
        // Refresh all blocks to ensure connections are properly rendered
        workspace.getAllBlocks(false).forEach(block => {
          if (block.type.includes('simulation') || block.type.includes('container')) {
            // For simulation blocks, ensure they're updated with the latest connection info
            block.getField('CONNECTION_ID')?.setValue('none');
          }
        });
        
        // Log success
        console.log('Template loaded successfully');
      } catch (error) {
        console.error('Error loading template:', error);
        alert('Failed to load template: ' + error.message);
      }
    }
  };

  // Filter templates by active category
  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === activeCategory);

  return (
    <div className="templates-browser">
      <h3>Workflow Templates</h3>
      <div className="templates-toolbar">
        <div className="template-categories">
          {categories.map(category => (
            <button 
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="templates-grid">
        {filteredTemplates.map(template => (
          <div className="template-card" key={template.id}>
            <div className="template-preview">
              <div className="template-placeholder">
                {/* Placeholder for template preview image */}
                {template.imgSrc ? 
                  <img src={template.imgSrc} alt={template.name} /> :
                  <div className="template-icon">{template.name.charAt(0)}</div>
                }
              </div>
            </div>
            <div className="template-info">
              <h4>{template.name}</h4>
              <div className="template-meta">
                <span className="template-category">{categories.find(c => c.id === template.category)?.name}</span>
                <span className="template-complexity">{template.complexity}</span>
              </div>
              <p className="template-description">{template.description}</p>
              <button 
                className="load-template-btn"
                onClick={() => loadTemplate(template.xmlContent)}
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplatesBrowser;