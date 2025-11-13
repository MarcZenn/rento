# /create-tdd Task

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

When this task is invoked:

## Processing Flow: Run the following steps sequentially

1. **Re-document Project** - Check the Changelog datestamp in the `@/.claude/documentation/architecture.md`  document. If the most recent date is more than 3 days old, prompt the user to run task document-project.md and exit this task. Otherwise, simply move on to the next step.
2. **Review Current Project** - Review and understand the `@/.claude/documentation/architecture.md` document in its entirety.
3. **Receive FRD** - Prompt the user to provide you with a Feature Requirements Document (FRD). This is the document you will need to create a Technical Design Document.
4. **Understand FRD** - Review and understand the FRD in its entirety. If there are any areas of the FRD that are unclear or ambigous for your purposes ask the user to clarify.
5. **Run task** - Run task create-doc.md with template `tdd-tmpl.yaml` for the provided FRD.



