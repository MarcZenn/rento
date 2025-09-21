# /create-tdd Task

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

When this task is invoked:

## Critical: Archon Access

If you are unable to access Archon notify the user and ask them to check the MCP server connection. 
Wait for the user to tell you to either try to reconnect or to exit this task prematurely. If reconnect is successful continue with this task.

## Processing Flow: Run the following steps sequentially

1. **Re-document Project** - Check the datestamp in the `brownfield-architecture.md` document. If the date is more than a month old run task document-project.md otherwise just go on to the next step.
2. **Review Current Project** - Review and understand the `brownfield-architecture.md` document.
3. **Find PDRD** - List all **frd.md files in `.claude/docs` directory and ask the user to select one
4. **Read Selected FRD** - Review and understand the FRD in its entirety. If there are any areas of the FRD that are unclear or ambigous for your purposes ask the user to clarify.
5. **Run task** - Run task create-doc.md with template `tdd-tmpl.yaml` for the selected FRD



