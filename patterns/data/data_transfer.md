# Data Transfer Pattern

## Description

The **Data Transfer** pattern moves or copies data between different storage locations. This pattern is essential for workflows that need to access data from various sources, transfer intermediate results between processing steps, or archive final outputs to designated storage.

### When to Use

Use this pattern when you need to:
- Move input data from a central repository to a processing environment
- Transfer simulation outputs to an analysis environment
- Back up data to archival storage
- Share results with other systems or users
- Distribute data across computational nodes
- Gather distributed results to a central location

## Block Interface

The Data Transfer block has the following configuration options:

- **Source Path**: The location of the source data (file path, URI, or object storage reference)
- **Destination Path**: The location where data should be transferred
- **Transfer Type**: The type of transfer (copy, move, etc.)
- **Transfer Protocol**: The protocol to use (local, S3, SFTP, HTTP, etc.)
- **Compression**: Optional compression during transfer
- **Verification**: Whether to verify the integrity of transferred data

### Block Preview

```
┌───────────────────────────────────────────────────────┐
│ Transfer data from [/path/or/URI]                     │
│ to [/path/or/URI]                                     │
│ using [Copy] ▼ via [Local] ▼                          │
│ [✓] compress  [✓] verify checksum                     │
└───────────────────────────────────────────────────────┘
```

## Block Implementation

### Block Definition (JavaScript)

```javascript
Blockly.Blocks['data_transfer'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Transfer data from")
        .appendField(new Blockly.FieldTextInput("/path/or/URI"), "SRC");
    this.appendDummyInput()
        .appendField("to")
        .appendField(new Blockly.FieldTextInput("/path/or/URI"), "DEST");
    this.appendDummyInput()
        .appendField("using")
        .appendField(new Blockly.FieldDropdown([
            ["Copy", "COPY"],
            ["Move", "MOVE"],
            ["Sync", "SYNC"]
        ]), "TRANSFER_TYPE")
        .appendField("via")
        .appendField(new Blockly.FieldDropdown([
            ["Local", "LOCAL"],
            ["S3", "S3"],
            ["SFTP", "SFTP"],
            ["HTTP", "HTTP"],
            ["GCS", "GCS"],
            ["HDFS", "HDFS"]
        ]), "TRANSFER_PROTOCOL");
    this.appendDummyInput()
        .appendField("compress")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "COMPRESS")
        .appendField("verify checksum")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "VERIFY");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Copy or move data from a source to a destination.");
    this.setHelpUrl("");
  }
};
```

### Code Generator (JavaScript)

```javascript
pythonGenerator['data_transfer'] = function(block) {
  const src = block.getFieldValue('SRC');
  const dest = block.getFieldValue('DEST');
  const transferType = block.getFieldValue('TRANSFER_TYPE');
  const transferProtocol = block.getFieldValue('TRANSFER_PROTOCOL');
  const compress = block.getFieldValue('COMPRESS') === 'TRUE';
  const verify = block.getFieldValue('VERIFY') === 'TRUE';
  
  // Choose the appropriate operator based on protocol
  let operatorType = '';
  let importStmt = '';
  let operatorCode = '';
  
  switch (transferProtocol) {
    case 'LOCAL':
      if (transferType === 'COPY' || transferType === 'MOVE') {
        operatorType = 'BashOperator';
        importStmt = 'from airflow.operators.bash import BashOperator';
        
        let command = '';
        if (transferType === 'COPY') {
          command = `cp -R ${compress ? '-z ' : ''}${src} ${dest}`;
        } else if (transferType === 'MOVE') {
          command = `mv ${src} ${dest}`;
        } else { // SYNC
          command = `rsync -avz ${src} ${dest}`;
        }
        
        if (verify) {
          command += ` && echo "Verifying transfer..." && `;
          if (transferType === 'MOVE') {
            command += `[[ -f "${dest}" ]] && echo "Verified!"`;
          } else {
            command += `diff -r ${src} ${dest} > /dev/null && echo "Verified!"`;
          }
        }
        
        operatorCode = `BashOperator(
    task_id='transfer_data',
    bash_command='${command}',
    dag=dag,
)`;
      }
      break;
      
    case 'S3':
      operatorType = 'S3FileTransferOperator';
      importStmt = 'from airflow.providers.amazon.aws.transfers.local_to_s3 import LocalFilesystemToS3Operator';
      
      if (src.startsWith('s3://') && !dest.startsWith('s3://')) {
        // S3 to Local
        importStmt = 'from airflow.providers.amazon.aws.transfers.s3_to_local import S3ToLocalFilesystemOperator';
        operatorCode = `S3ToLocalFilesystemOperator(
    task_id='transfer_data_s3_to_local',
    s3_key='${src.replace('s3://', '')}',
    local_path='${dest}',
    aws_conn_id='aws_default',
    verify=${verify ? 'True' : 'False'},
    dag=dag,
)`;
      } else if (!src.startsWith('s3://') && dest.startsWith('s3://')) {
        // Local to S3
        operatorCode = `LocalFilesystemToS3Operator(
    task_id='transfer_data_local_to_s3',
    filename='${src}',
    dest_key='${dest.replace('s3://', '')}',
    aws_conn_id='aws_default',
    verify=${verify ? 'True' : 'False'},
    ${compress ? "replace=True," : ""}
    dag=dag,
)`;
      } else {
        // S3 to S3
        importStmt = 'from airflow.providers.amazon.aws.transfers.s3_to_s3 import S3ToS3Operator';
        operatorCode = `S3ToS3Operator(
    task_id='transfer_data_s3_to_s3',
    source_bucket_key='${src.replace('s3://', '')}',
    dest_bucket_key='${dest.replace('s3://', '')}',
    aws_conn_id='aws_default',
    verify=${verify ? 'True' : 'False'},
    dag=dag,
)`;
      }
      break;
      
    // Additional protocols can be implemented similarly
    case 'GCS':
      // Google Cloud Storage implementation
      break;
      
    default:
      // Default to BashOperator for other protocols
      operatorType = 'BashOperator';
      importStmt = 'from airflow.operators.bash import BashOperator';
      operatorCode = `BashOperator(
    task_id='transfer_data',
    bash_command='echo "Custom transfer from ${src} to ${dest} via ${transferProtocol}"',
    dag=dag,
)`;
  }
  
  // Generate the final code
  const code = `
# Data Transfer Task
${importStmt}
transfer_data_task = ${operatorCode}

`;
  
  return code;
};
```

## Generated Airflow Code

The pattern generates different Airflow operators based on the selected transfer protocol and options:

### Local File Transfer (using BashOperator)

```python
# Data Transfer Task
from airflow.operators.bash import BashOperator
transfer_data_task = BashOperator(
    task_id='transfer_data',
    bash_command='cp -R /data/input/dataset.csv /data/processing/ && echo "Verifying transfer..." && diff -r /data/input/dataset.csv /data/processing/ > /dev/null && echo "Verified!"',
    dag=dag,
)
```

### S3 Transfer (using AWS Operators)

```python
# Data Transfer Task
from airflow.providers.amazon.aws.transfers.local_to_s3 import LocalFilesystemToS3Operator
transfer_data_task = LocalFilesystemToS3Operator(
    task_id='transfer_data_local_to_s3',
    filename='/data/results/analysis.csv',
    dest_key='project/results/analysis.csv',
    aws_conn_id='aws_default',
    verify=True,
    dag=dag,
)
```

### S3 to S3 Transfer

```python
# Data Transfer Task
from airflow.providers.amazon.aws.transfers.s3_to_s3 import S3ToS3Operator
transfer_data_task = S3ToS3Operator(
    task_id='transfer_data_s3_to_s3',
    source_bucket_key='source-bucket/input/dataset.csv',
    dest_bucket_key='destination-bucket/input/dataset.csv',
    aws_conn_id='aws_default',
    verify=True,
    dag=dag,
)
```

## Examples

### Example 1: Preprocessing Pipeline

```
[Data Transfer: Raw → Processing] → [ETL Process] → [Data Transfer: Processing → Analysis]
```

This workflow transfers raw data to a processing environment, performs ETL, and then transfers the processed data to an analysis environment.

### Example 2: Distributed Simulation with Result Collection

```
[Parameter Sweep: Models] → [Data Transfer: Config → Worker Nodes] → [Simulation Execution]
                                                                     → [Data Transfer: Results → Central Storage]
```

This workflow distributes configurations to worker nodes, runs simulations, and collects results to central storage.

## Best Practices

1. **Error Handling**: Add error handling and retry mechanisms for transfers, especially for remote protocols.
2. **Connection Management**: Use Airflow connections to store credentials securely.
3. **Verification**: Enable checksum verification for critical data.
4. **Compression**: Use compression for large data transfers over networks.
5. **Credentials**: Never hardcode credentials in the workflow; use connection objects instead.
6. **Idempotency**: Ensure transfers are idempotent to allow for safe retries.
7. **Logging**: Include sufficient logging to track transfer progress and troubleshoot issues.

## Advanced Features

### Smart Transfer Selection

The pattern can automatically select the optimal transfer method based on source and destination URIs:

```javascript
// Automatic protocol detection based on URI scheme
function detectProtocol(uri) {
  if (uri.startsWith('s3://')) return 'S3';
  if (uri.startsWith('gs://')) return 'GCS';
  if (uri.startsWith('hdfs://')) return 'HDFS';
  if (uri.startsWith('http://') || uri.startsWith('https://')) return 'HTTP';
  if (uri.startsWith('sftp://')) return 'SFTP';
  return 'LOCAL';
}

// Update transfer protocol based on source and destination
const srcProtocol = detectProtocol(src);
const destProtocol = detectProtocol(dest);
const transferProtocol = srcProtocol !== destProtocol ? `${srcProtocol}_TO_${destProtocol}` : srcProtocol;
```

### Distributed Transfers

For large data transfers, the pattern can generate code that uses distributed transfer tools:

```python
# Large file transfer using distributed approach
distributed_transfer_task = BashOperator(
    task_id='distributed_transfer',
    bash_command='parallel-transfer --source-dir /huge/dataset --dest-dir /archive/dataset --num-workers 10',
    dag=dag,
)
```

## Related Patterns

- [Data Validation](data_validation.md) - Verify data quality after transfer
- [ETL Process](etl_process.md) - Process data after transfer
- [Incremental Processing](incremental_processing.md) - Only transfer and process new data
- [Checkpointing](../workflow/checkpointing.md) - Save transfer state for resumable transfers
- [Error Handling](../workflow/error_handling.md) - Handle transfer failures