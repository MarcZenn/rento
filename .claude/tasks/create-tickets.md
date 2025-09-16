# /create-tickets Task

When this command is used, execute the following task:

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

When this task is invoked:

## Critical: Archon Access

If you are unable to access Archon notify the user and ask them to check the MCP server connection. 
Wait for the user to tell you to either try to reconnect or to exit this task prematurely. If reconnect is successful continue with this task.

## Processing Flow: Run the following steps sequentially

1. **List TDDs** - List all of the TDD files stored in the Archon Rento project and ask the user to select one
2. **Read Selected TDD** - Review and understand the selected TDD in its entirety. If there are any areas of the selected TDD that are unclear or ambigous for your purposes prompt the user to clarify.
3. **Define Dev Work** - Once you have a clear understanding of the technical design and implementation of the feature oultined in the selected TDD begin, to break up the work into simple and managable development tasks.
4. **Create Archon Todo Tasks** - Add each development task into the Archon Rento project under the tasks todo list. 

## Detailed Task Requirements

When creating the development tasks, Always:

- Keep frontend development tasks separate from backend development tasks. Create separate tasks for instances where the backend and frontend need to integrate.
- Be thorough. Make sure the tasks you create completely capture the entirety of development/engineering work required to fully implement the feature outlined in the TDD.
- Stay within the boundaries of the TDD. DO NOT create tasks in Archon that go beyond the scope of the feature outlined in the TDD.
- Make sure each tasks is detailed, specific and technical. A dumb dev should be able to look at each ticket and implement in the codebase without confusion or need for self interpretation


