# /locale Task

When this command is used, execute the following task:

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

## Processing Flow: Run the following steps sequentially

1. **Review supported languages:** Take a look at the i18n resources within the codebase and identify which languages are currently supported.
2. **Review the codebase:** Scan through the codebase and identify UI/front-end components containing text that has not yet been translated. 
3. **Translate:** Write translations for the previously identified components containing text that has not yet been translated and update the codebase to support those translations in the UI. Ensure you only translate into the languages currently supported in the application. If you come across potential i18n implementation improvements such as improvements in language switching logic, state management, loading logic, locale detection, formatting and optimization make the appropriate changes in the codebase.
4. **Translate:** Ask the user to review the new changes