# /create-frd Task

When this command is used, execute the following task:

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

When this task is invoked:

## Critical: Archon Access

If you are unable to access Archon notify the user and ask them to check the MCP server connection. 
Wait for the user to tell you to either try to reconnect or to exit this task prematurely. If reconnect is successful continue with this task.

## Processing Flow: Run the following steps sequentially

1. **Find PDRD** - List all of the PDRD files stored in the Archon Rento project and ask the user to select one
2. **Read Selected PDRD** - Review and understand the PDRD in its entirety. If there are any areas of the PDRD that are unclear or ambigous for your purposes prompt the user to clarify.
3. **List Features** - List all of the features outlined in the PDRD as a simple selectable list to the user and ask the user to select one and only one. The list should only display the feature names.
4. **Run task** - Run task create-doc.md with template frd-tmpl.yaml for the selected feature. An {{feature_name}}-frd.md file should ultimately be created and stored in Archon for the selected feature only.



