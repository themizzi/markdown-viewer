---
description: Resolve GitHub pull request review comments as outdated after making fixes
mode: all
model: openai/gpt-4-turbo
temperature: 0.2
permission:
  bash: allow
  webfetch: deny
  task: deny
  edit: allow
  read: allow
  glob: allow
  grep: allow
  write: allow
---

# Resolve PR Review Comments Skill

This skill provides workflows for resolving GitHub pull request review comments using GitHub's GraphQL API.

## When to Use

Use this skill when:
- You've addressed review comments on a pull request
- You want to mark comments as outdated/resolved
- You're cleaning up after making code changes in response to feedback

## Available Commands

### /resolve-pr-comments

Resolve all open review comments on a pull request as outdated.

**Usage:**
```
/resolve-pr-comments <pr-number> [<repo-owner>/<repo-name>]
```

**Example:**
```
/resolve-pr-comments 4
/resolve-pr-comments 4 themizzi/markdown-viewer
```

**What it does:**
1. Fetches all review comments from the specified PR
2. Filters for unresolved comments (not already marked as outdated)
3. Resolves each comment using GraphQL's `minimizeComment` mutation
4. Reports results with success/failure status for each comment

**Requirements:**
- GitHub CLI (`gh`) must be installed and authenticated
- You must have permissions to resolve comments on the repository
- Comments must exist on the PR

### /resolve-specific-comments

Resolve specific review comments by their node IDs.

**Usage:**
```
/resolve-specific-comments <node-id-1> [<node-id-2> ...]
```

**Example:**
```
/resolve-specific-comments PRRC_kwDORq0PMc6wn2YV PRRC_kwDORq0PMc6wn2Yy
```

**What it does:**
1. Takes one or more GitHub GraphQL node IDs for review comments
2. Resolves each comment using the `minimizeComment` mutation with `OUTDATED` classifier
3. Reports success/failure for each comment

**Node ID Format:**
- Review comment node IDs begin with `PRRC_` 
- Find them via: `gh api repos/<owner>/<repo>/pulls/<pr>/comments`

## Implementation Details

### GraphQL Mutation

The skill uses this mutation to resolve comments:

```graphql
mutation {
  minimizeComment(input: {classifier: OUTDATED, subjectId: "PRRC_..."}) {
    clientMutationId
  }
}
```

### Classifier Options

- `SPAM` - Mark as spam
- `OUTDATED` - Mark as resolved/outdated
- `ABUSE` - Mark as abusive
- `OFF_TOPIC` - Mark as off-topic

The skill defaults to `OUTDATED` for review comment resolution.

## Workflow Example

**Scenario:** You've addressed 4 review comments on PR #4 and want to mark them as resolved.

```bash
# 1. Get the comment node IDs
gh api repos/themizzi/markdown-viewer/pulls/4/comments | jq '.[] | {id: .node_id, body: .body[0:50]}'

# 2. Resolve them
/resolve-specific-comments PRRC_kwDORq0PMc6wn2YV PRRC_kwDORq0PMc6wn2Yy PRRC_kwDORq0PMc6wn2ZE PRRC_kwDORq0PMc6wn2Za

# 3. Verify in GitHub UI - comments should show as "Resolved"
```

## Error Handling

The skill handles these errors:

- **Comment not found:** "comment with ID ... does not exist"
- **Insufficient permissions:** "You don't have permission to modify this comment"
- **Already resolved:** GraphQL will silently succeed (idempotent)
- **Invalid node ID:** GraphQL returns type error

All errors are reported with the specific node ID so you can debug which comment failed.

## See Also

- GitHub Docs: [Minimizing comments](https://docs.github.com/en/graphql/reference/mutations#minimizecomment)
- GitHub CLI: [gh api](https://cli.github.com/manual/gh_api)
- PR comments: `gh api repos/OWNER/REPO/pulls/PR_NUMBER/comments`
