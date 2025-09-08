--- 
description: Produce a Product Requirement Document (PRD) for a new application feature
argument-hint: Phase number | Feature number
---

## Context

Parse $ARGUMENTS to get the following values:

- [phase]: Phase number from $ARGUMENTS
- [feature]: Feature number from $ARGUMENTS

## Task

Create a Product Requirement Document (PRD) for a feature. Run the following steps sequentially to accomplish this: 

1. Review the @.claude/assets/feature_list.md check list and find feature number [feature] under phase number [phase]. That is the feature we will build next.
2. Invoke the product-manager to draft a Product Requirement Document (PRD) for this feature.
3. Save the PRD in the `.claude/assets/PRDs/review` directory.

