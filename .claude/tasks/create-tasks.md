# /create-tasks Task

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

When this task is invoked:


## Processing Flow: Run the following steps sequentially

1. **Receive TDD** - Ask the user to provide a Technical Requirements Document (TDD). This is the document you will need to create actionable tasks.
2. **Understand TDD** - Review and understand the provided TDD in its entirety. If there are any areas of the selected TDD that are unclear or ambigous for your purposes prompt the user to clarify.
3. **Define Dev Work** - With a clear understanding of the technical design and implementation oultined in the provided TDD, begin to break up the work into simple and manageable development tasks.
4. **Create Tasks** - Create a new markdown file with the name of the feature and outline all of tasks in it. Add this file to the `@/.claude/docs/tdds` directory. 

## Critical: Task Creation Guidelines

When creating the development tasks, ALWAYS:

- Prioritze tasks by order of dependency. This means implementation of a task should not depend on implementatin of a later task. Number each task by this order and include the number in the title of the task.
- Keep frontend development tasks separate from backend development tasks. Create separate tasks for instances where the backend and frontend need to integrate.
- Be thorough. Make sure the tasks you create capture the entirety of development/engineering work required to fully implement the feature outlined in the TDD.
- Stay within the boundaries of the TDD. DO NOT create tasks in Archon that go beyond the scope of the feature outlined in the TDD.
- Make sure each tasks is detailed, specific and technical. A dumb dev should be able to look at each ticket and implement in the codebase without confusion or need for self interpretation. Include code examples, mockups, diagrams, and/or charts for any task that requires it. 
- If there are any aspects of the TDD that cannot be addressed by the dev agent such as creating a AWS account, create a separate task and assign it to the user. 