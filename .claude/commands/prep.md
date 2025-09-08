--- 
description: Produce one or more Technical Design Documents (TDDs) for a new application feature outlined in a Product Requirement Document (PRD)
---

## Task

Reference a Product Requirement Document (PRD) to create a Technical Design Document (TDD). Run the following steps sequentially to accomplish this: 

1. Invoke the technical-architect to review the Product Requirement Document (PRD) in the `.claude/assets/PRDs/review` directory. 
2. Next, invoke the technical-architect to draft a Technical Design Document (TDD). Depending on the work required to satisfy the PRD, the TDD should deliniate clearly between aspects that require frontend work, backend work or both.
3. Save the new Techinical Design Document in the `/.claude/assets/TDDs/review` directory.
4. Move the PRD in the `/.claude/assets/PRDs/review` directory to the `/.claude/assets/PRDs/pending` directory

