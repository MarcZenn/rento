# /create-tdd Task

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

When this task is invoked:

## Critical: Archon Access

If you are unable to access Archon notify the user and ask them to check the MCP server connection. 
Wait for the user to tell you to either try to reconnect or to exit this task prematurely. If reconnect is successful continue with this task.

## Processing Flow: Run the following steps sequentially

<!-- TODO:: Once Archon has migrated docs uncomment step below -->
<!-- 1. **List FRDs** - List all of the FRD files stored in the Archon Rento project and ask the user to select one -->
1. **Find PDRD** - List all frd.md files in /docs directory and ask the user to select one
2. **Read Selected FRD** - Review and understand the FRD in its entirety. If there are any areas of the FRD that are unclear or ambigous for your purposes ask the user to clarify.
3. **Run task** - Run task create-doc.md with template tdd-tmpl.yaml for the selected FRD



