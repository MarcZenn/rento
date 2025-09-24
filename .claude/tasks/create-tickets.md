# /create-tickets Task

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

When this task is invoked:

## Critical: Archon Access

If you are unable to access Archon notify the user and ask them to check the MCP server connection. 
Wait for the user to tell you to either try to reconnect or to exit this task prematurely. If reconnect is successful continue with task.

## Processing Flow: Run the following steps sequentially

<!-- 1. **List TDDs** - List all of the **tdd.md files stored in the Archon Rento project and ask the user to select one -->
1. **List TDDs** - List all of the **tdd.md files stored in the `.claude/docs` directory and ask the user to select one
2. **Read Selected TDD** - Review and understand the selected TDD in its entirety. If there are any areas of the selected TDD that are unclear or ambigous for your purposes prompt the user to clarify.
3. **Define Dev Work** - With a clear understanding of the technical design and implementation oultined in the selected TDD, begin to break up the work into simple and manageable development tasks. Think of these tasks as Jira tickets.
4. **Create Archon Todo Tasks** - Add each development task into the Archon Rento project under the tasks Todo list. 

## Task Creation Guidelines

When creating the development tasks, ALWAYS:

- Prioritze tasks by order of dependency. This means implementation of a task should not depend on implementatin of a later task. Number each task by this order and include the number in the title of the task.
- Keep frontend development tasks separate from backend development tasks. Create separate tasks for instances where the backend and frontend need to integrate.
- Be thorough. Make sure the tasks you create capture the entirety of development/engineering work required to fully implement the feature outlined in the TDD.
- Stay within the boundaries of the TDD. DO NOT create tasks in Archon that go beyond the scope of the feature outlined in the TDD.
- Make sure each tasks is detailed, specific and technical. A dumb dev should be able to look at each ticket and implement in the codebase without confusion or need for self interpretation
- If there are any aspects of the TDD that cannot be addressed by the dev agent such as creating a AWS account, create a separate task and assign it to the user. 