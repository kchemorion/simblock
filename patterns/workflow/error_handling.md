# Error Handling Pattern

## Description

The **Error Handling** pattern provides a robust mechanism for managing failures in workflow tasks. It enables workflows to detect, respond to, and recover from errors gracefully, ensuring reliability and resilience in scientific and data pipelines.

### When to Use

Use this pattern when you need to:
- Implement fault tolerance in critical workflows
- Provide graceful recovery mechanisms for task failures
- Execute alternative paths when primary tasks fail
- Capture and report detailed error information
- Implement custom retry logic beyond simple retries
- Preserve partial results despite task failures

## Block Interface

The Error Handling block has the following configuration options:

- **Protected Task**: The workflow step(s) to protect with error handling
- **On Failure Action**: What to do when an error occurs (retry, alert, alternative path, etc.)
- **Retry Count**: Number of retry attempts (if retry option selected)
- **Retry Delay**: Time between retry attempts
- **Failure Threshold**: Conditions that determine when to stop retrying
- **Error Notification**: Where to send error notifications

### Block Preview

```
┌───────────────────────────────────────────────────┐
│ Error Handler                                     │
├───────────────────────────────────────────────────┤
│ [Protected Task blocks go here]                   │
│                                                   │
├───────────────────────────────────────────────────┤
│ On failure [Retry] ▼                              │
│ Max attempts [3]  Delay [60] seconds              │
│ [✓] Send alert to [admin@example.com]             │
└───────────────────────────────────────────────────┘
```

## Block Implementation

### Block Definition (JavaScript)

```javascript
Blockly.Blocks['error_handling'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Error Handler");
    this.appendStatementInput("PROTECTED_TASK")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("On failure")
        .appendField(new Blockly.FieldDropdown([
            ["Retry", "RETRY"],
            ["Alert", "ALERT"],
            ["Alternative Path", "ALTERNATIVE"],
            ["Continue", "CONTINUE"],
            ["Fail Workflow", "FAIL"]
        ]), "FAILURE_ACTION");
    this.appendDummyInput()
        .appendField("Max attempts")
        .appendField(new Blockly.FieldNumber(3, 1, 10), "RETRY_COUNT")
        .appendField("Delay")
        .appendField(new Blockly.FieldNumber(60, 0), "RETRY_DELAY")
        .appendField("seconds");
    this.appendDummyInput()
        .appendField("Send alert to")
        .appendField(new Blockly.FieldTextInput("admin@example.com"), "ALERT_TARGET");
    this.appendStatementInput("ALTERNATIVE_PATH")
        .appendField("Alternative path")
        .setVisible(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("Handle errors that may occur in protected tasks.");
    this.setHelpUrl("");
    
    // Update visibility of fields based on failure action
    this.setOnChange(function(changeEvent) {
      if (changeEvent.name === 'FAILURE_ACTION') {
        this.updateFields(changeEvent.newValue);
      }
    });
  },
  
  updateFields: function(action) {
    // Show/hide fields based on selected action
    const showRetry = action === 'RETRY';
    const showAlternative = action === 'ALTERNATIVE';
    
    // Get inputs by name
    const retryFields = this.getInput("RETRY_FIELDS");
    const alternativePath = this.getInput("ALTERNATIVE_PATH");
    
    // Update visibility
    if (retryFields) {
      retryFields.setVisible(showRetry);
    }
    
    if (alternativePath) {
      alternativePath.setVisible(showAlternative);
    }
  }
};
```

### Code Generator (JavaScript)

```javascript
pythonGenerator['error_handling'] = function(block) {
  const failureAction = block.getFieldValue('FAILURE_ACTION');
  const retryCount = block.getFieldValue('RETRY_COUNT');
  const retryDelay = block.getFieldValue('RETRY_DELAY');
  const alertTarget = block.getFieldValue('ALERT_TARGET');
  
  // Get the code for the protected task
  const protectedTaskCode = pythonGenerator.statementToCode(block, 'PROTECTED_TASK');
  
  // Get the code for the alternative path (if used)
  let alternativePathCode = '';
  if (failureAction === 'ALTERNATIVE') {
    alternativePathCode = pythonGenerator.statementToCode(block, 'ALTERNATIVE_PATH');
  }
  
  // Generate code differently based on failure action
  let code = '';
  
  // Common imports
  const imports = [
    'from airflow.operators.python import PythonOperator, BranchPythonOperator',
    'from airflow.operators.bash import BashOperator',
    'from airflow.operators.email import EmailOperator',
    'from airflow.sensors.external_task import ExternalTaskSensor',
    'from airflow.models.param import Param',
    'from airflow.utils.trigger_rule import TriggerRule',
    'from airflow.exceptions import AirflowException'
  ];
  
  // Extract task_id from protected code (a bit tricky in a general case, simplified here)
  // In a real implementation, you'd need more sophisticated parsing
  const taskIdMatch = protectedTaskCode.match(/task_id=['"](.*?)['"]/);
  const taskId = taskIdMatch ? taskIdMatch[1] : 'protected_task';
  
  // Add protected task with modified parameters based on failure action
  let modifiedProtectedTaskCode = protectedTaskCode;
  
  if (failureAction === 'RETRY') {
    // Add retry parameters to the task
    modifiedProtectedTaskCode = modifiedProtectedTaskCode.replace(
      /dag=dag,?\n/,
      `dag=dag,
    retries=${retryCount},
    retry_delay=timedelta(seconds=${retryDelay}),
`
    );
    
    code = `
# Error Handler - Retry Logic
${imports.join('\n')}
from datetime import timedelta

# Protected task with retry configuration
${modifiedProtectedTaskCode}

# Error notification
${taskId}_failure_notification = EmailOperator(
    task_id='${taskId}_failure_notification',
    to='${alertTarget}',
    subject='Airflow Task Failure: {{ task_instance.task_id }}',
    html_content='''
        <h3>Task Failed Despite Retries</h3>
        <p>Task: {{ task_instance.task_id }}</p>
        <p>DAG: {{ task_instance.dag_id }}</p>
        <p>Execution Time: {{ task_instance.execution_date }}</p>
        <p>Error: {{ task_instance.error }}</p>
    ''',
    trigger_rule=TriggerRule.ONE_FAILED,
    dag=dag,
)

# Set dependencies
${taskId}_task >> ${taskId}_failure_notification

`;
  } else if (failureAction === 'ALERT') {
    code = `
# Error Handler - Alert Only
${imports.join('\n')}

# Protected task
${protectedTaskCode}

# Error notification
${taskId}_failure_notification = EmailOperator(
    task_id='${taskId}_failure_notification',
    to='${alertTarget}',
    subject='Airflow Task Failure: {{ task_instance.task_id }}',
    html_content='''
        <h3>Task Failed</h3>
        <p>Task: {{ task_instance.task_id }}</p>
        <p>DAG: {{ task_instance.dag_id }}</p>
        <p>Execution Time: {{ task_instance.execution_date }}</p>
        <p>Error: {{ task_instance.error }}</p>
    ''',
    trigger_rule=TriggerRule.ONE_FAILED,
    dag=dag,
)

# Set dependencies
${taskId}_task >> ${taskId}_failure_notification

`;
  } else if (failureAction === 'ALTERNATIVE') {
    code = `
# Error Handler - Alternative Path
${imports.join('\n')}

# Define a function to decide which path to take
def check_task_success(ti):
    """
    Check if the main task succeeded or failed
    """
    task_states = ti.xcom_pull(task_ids=['${taskId}_task'], key='task_status')
    if task_states and task_states[0] == 'success':
        return 'continue_normal_path'
    else:
        return 'start_alternative_path'

# Protected task with success/failure tracking
def protected_task_with_tracking(**kwargs):
    ti = kwargs['ti']
    try:
        # [Original task logic would go here]
        # ...extracted from the protected task code
        ${pythonGenerator.prefixLines(protectedTaskCode, '        ')}
        ti.xcom_push(key='task_status', value='success')
        return "Task succeeded"
    except Exception as e:
        ti.xcom_push(key='task_status', value='failed')
        ti.xcom_push(key='error_details', value=str(e))
        print(f"Task failed: {str(e)}")
        # We don't raise the exception to prevent Airflow from marking the task as failed
        return "Task failed but handled"

# Task to execute the protected code and track success/failure
${taskId}_task = PythonOperator(
    task_id='${taskId}_task',
    python_callable=protected_task_with_tracking,
    provide_context=True,
    dag=dag,
)

# Branch task to decide which path to take
path_decision = BranchPythonOperator(
    task_id='check_${taskId}_success',
    python_callable=check_task_success,
    provide_context=True,
    dag=dag,
)

# Task for normal path (if protected task succeeds)
continue_normal_path = BashOperator(
    task_id='continue_normal_path',
    bash_command='echo "Continuing normal execution path"',
    dag=dag,
)

# Tasks for alternative path (if protected task fails)
start_alternative_path = BashOperator(
    task_id='start_alternative_path',
    bash_command='echo "Starting alternative execution path"',
    dag=dag,
)

${pythonGenerator.prefixLines(alternativePathCode, '')}

# Error notification
${taskId}_failure_notification = EmailOperator(
    task_id='${taskId}_failure_notification',
    to='${alertTarget}',
    subject='Airflow Task Failure: Alternative Path Activated',
    html_content='''
        <h3>Task Failed - Using Alternative Path</h3>
        <p>Task: {{ task_instance.task_id }}</p>
        <p>DAG: {{ task_instance.dag_id }}</p>
        <p>Execution Time: {{ task_instance.execution_date }}</p>
        <p>Error: {{ ti.xcom_pull(task_ids=['${taskId}_task'], key='error_details') }}</p>
    ''',
    trigger_rule=TriggerRule.ONE_FAILED,
    dag=dag,
)

# Set dependencies
${taskId}_task >> path_decision
path_decision >> continue_normal_path
path_decision >> start_alternative_path
${taskId}_task >> ${taskId}_failure_notification

`;
  } else if (failureAction === 'CONTINUE') {
    code = `
# Error Handler - Continue on Failure
${imports.join('\n')}

# Protected task with ignore failures
${modifiedProtectedTaskCode.replace(
      /dag=dag,?\n/,
      `dag=dag,
    depends_on_past=False,
    ignore_first_depends_on_past=True,
`
    )}

# Log failure but allow workflow to continue
${taskId}_log_failure = PythonOperator(
    task_id='${taskId}_log_failure',
    python_callable=lambda **kwargs: print(f"Task {kwargs['task_instance'].task_id} failed but workflow continues"),
    trigger_rule=TriggerRule.ONE_FAILED,
    provide_context=True,
    dag=dag,
)

# Set dependencies
${taskId}_task >> ${taskId}_log_failure

`;
  } else { // FAIL
    code = `
# Error Handler - Fail Workflow
${imports.join('\n')}

# Protected task with no special handling - failures will cascade through the workflow
${protectedTaskCode}

`;
  }
  
  return code;
};
```

## Generated Airflow Code

The pattern generates different Airflow code based on the selected error handling strategy:

### Retry Strategy

```python
# Error Handler - Retry Logic
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.bash import BashOperator
from airflow.operators.email import EmailOperator
from airflow.sensors.external_task import ExternalTaskSensor
from airflow.models.param import Param
from airflow.utils.trigger_rule import TriggerRule
from airflow.exceptions import AirflowException
from datetime import timedelta

# Protected task with retry configuration
process_data_task = PythonOperator(
    task_id='process_data',
    python_callable=process_data_function,
    op_kwargs={'input_path': '/data/input/dataset.csv'},
    dag=dag,
    retries=3,
    retry_delay=timedelta(seconds=60),
)

# Error notification
process_data_failure_notification = EmailOperator(
    task_id='process_data_failure_notification',
    to='admin@example.com',
    subject='Airflow Task Failure: {{ task_instance.task_id }}',
    html_content='''
        <h3>Task Failed Despite Retries</h3>
        <p>Task: {{ task_instance.task_id }}</p>
        <p>DAG: {{ task_instance.dag_id }}</p>
        <p>Execution Time: {{ task_instance.execution_date }}</p>
        <p>Error: {{ task_instance.error }}</p>
    ''',
    trigger_rule=TriggerRule.ONE_FAILED,
    dag=dag,
)

# Set dependencies
process_data_task >> process_data_failure_notification
```

### Alternative Path Strategy

```python
# Error Handler - Alternative Path
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.bash import BashOperator
from airflow.operators.email import EmailOperator
from airflow.sensors.external_task import ExternalTaskSensor
from airflow.models.param import Param
from airflow.utils.trigger_rule import TriggerRule
from airflow.exceptions import AirflowException

# Define a function to decide which path to take
def check_task_success(ti):
    """
    Check if the main task succeeded or failed
    """
    task_states = ti.xcom_pull(task_ids=['process_data_task'], key='task_status')
    if task_states and task_states[0] == 'success':
        return 'continue_normal_path'
    else:
        return 'start_alternative_path'

# Protected task with success/failure tracking
def protected_task_with_tracking(**kwargs):
    ti = kwargs['ti']
    try:
        # Original task logic
        data = pd.read_csv('/data/input/dataset.csv')
        processed_data = process_function(data)
        processed_data.to_csv('/data/output/processed.csv')
        ti.xcom_push(key='task_status', value='success')
        return "Task succeeded"
    except Exception as e:
        ti.xcom_push(key='task_status', value='failed')
        ti.xcom_push(key='error_details', value=str(e))
        print(f"Task failed: {str(e)}")
        # We don't raise the exception to prevent Airflow from marking the task as failed
        return "Task failed but handled"

# Task to execute the protected code and track success/failure
process_data_task = PythonOperator(
    task_id='process_data_task',
    python_callable=protected_task_with_tracking,
    provide_context=True,
    dag=dag,
)

# Branch task to decide which path to take
path_decision = BranchPythonOperator(
    task_id='check_process_data_success',
    python_callable=check_task_success,
    provide_context=True,
    dag=dag,
)

# Task for normal path (if protected task succeeds)
continue_normal_path = BashOperator(
    task_id='continue_normal_path',
    bash_command='echo "Continuing normal execution path"',
    dag=dag,
)

# Tasks for alternative path (if protected task fails)
start_alternative_path = BashOperator(
    task_id='start_alternative_path',
    bash_command='echo "Starting alternative execution path"',
    dag=dag,
)

# Alternative path tasks
use_backup_data_task = BashOperator(
    task_id='use_backup_data',
    bash_command='cp /data/backup/dataset.csv /data/output/processed.csv',
    dag=dag,
)

# Error notification
process_data_failure_notification = EmailOperator(
    task_id='process_data_failure_notification',
    to='admin@example.com',
    subject='Airflow Task Failure: Alternative Path Activated',
    html_content='''
        <h3>Task Failed - Using Alternative Path</h3>
        <p>Task: {{ task_instance.task_id }}</p>
        <p>DAG: {{ task_instance.dag_id }}</p>
        <p>Execution Time: {{ task_instance.execution_date }}</p>
        <p>Error: {{ ti.xcom_pull(task_ids=['process_data_task'], key='error_details') }}</p>
    ''',
    trigger_rule=TriggerRule.ONE_FAILED,
    dag=dag,
)

# Set dependencies
process_data_task >> path_decision
path_decision >> continue_normal_path
path_decision >> start_alternative_path
start_alternative_path >> use_backup_data_task
process_data_task >> process_data_failure_notification
```

## Examples

### Example 1: Robust Data Processing Pipeline

```
[Data Transfer] → [Error Handler: Data Validation] → [ETL Process]
                    ↓                                    ↑
                    ↓                                    ↑
                    ↓→ [Use Backup Data] ---------------↑
```

This workflow protects the Data Validation step with an error handler that uses backup data if validation fails.

### Example 2: Critical Simulation with Notification

```
[Parameter Setup] → [Error Handler: Simulation Execution] → [Result Analysis]
                                    ↓
                          [Email Alert to Team]
```

This workflow runs a simulation with error handling that sends emails to the team if the simulation fails.

## Best Practices

1. **Focus on Recovery**: Design error handlers that facilitate recovery, not just notifications.
2. **Targeted Protection**: Apply error handling to critical or error-prone tasks rather than everything.
3. **Meaningful Alerts**: Include actionable information in error notifications.
4. **Idempotent Tasks**: Ensure protected tasks are idempotent for safe retries.
5. **Cleanup on Failure**: Consider adding cleanup steps when switching to alternative paths.
6. **Conditional Retry Logic**: Use different retry counts/delays based on error types.
7. **Data Preservation**: Always try to preserve partial results or state for debugging.

## Advanced Features

### Error Classification

The pattern can be extended to handle different types of errors differently:

```python
def classified_error_handler(ti, **kwargs):
    try:
        # Original task logic
        result = some_function()
        return result
    except FileNotFoundError:
        # Missing file - use alternative data source
        ti.xcom_push(key='error_type', value='missing_file')
        return 'use_backup_data'
    except TimeoutError:
        # Timeout - retry with longer timeout
        ti.xcom_push(key='error_type', value='timeout')
        return 'retry_with_timeout'
    except Exception as e:
        # Generic error - alert and fail
        ti.xcom_push(key='error_type', value='other')
        ti.xcom_push(key='error_details', value=str(e))
        raise
```

### Circuit Breaker

For distributed systems, implement a circuit breaker pattern:

```python
def circuit_breaker(service_name, **kwargs):
    """
    Circuit breaker pattern - prevent cascading failures
    """
    ti = kwargs['ti']
    service_status = check_service_status(service_name)
    
    if service_status == 'down':
        # Circuit open - service is down, use fallback
        ti.xcom_push(key='circuit', value='open')
        return 'use_fallback'
    
    # Circuit closed - try the service
    try:
        result = call_service(service_name)
        ti.xcom_push(key='circuit', value='closed')
        return result
    except Exception as e:
        # Register failure, may open circuit on subsequent calls
        register_service_failure(service_name)
        raise
```

## Related Patterns

- [Checkpointing](checkpointing.md) - Save state for resumable workflows
- [Notification](notification.md) - Send alerts and messages about workflow status
- [Task Timeout](task_timeout.md) - Handle tasks that run too long
- [Branch Processing](branch_processing.md) - Create conditional execution paths
- [Pipeline Synchronization](synchronization.md) - Coordinate dependencies between tasks