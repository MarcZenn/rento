# /create-frd Task

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

When this task is invoked:

## Processing Flow: Run the following steps sequentially

1. **Receive Feature Description** - Ask the user to provide you with a new feature description. Once it is given, move on to next step.
2. **Understand Feature Description** - Review and understand the feature description in its entirety. If there are any aspects of the feature that are unclear or ambigous for your purposes prompt the user to clarify.
3. **Gather Additional Context** - Ask the user if there are any other supporting documents or information that you can use as additional context for the feature description. Once an answer is given, move on to the next step.
4. **Create FRD** - Run task create-doc.md and use template `frd-tmpl.yaml` to create a Feature Requirements Document for the selected feature.



