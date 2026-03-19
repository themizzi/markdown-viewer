---
description: Resolve GitHub pull request review comments and conversation threads using GitHub's GraphQL API
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

This skill provides workflows for resolving GitHub pull request review comments and conversation threads using GitHub's GraphQL API. It handles both minimizing individual comments and resolving entire review conversations.

## When to Use

Use this skill when:
- You've addressed review comments on a pull request
- You want to mark individual comments as outdated/resolved
- You need to resolve entire review conversation threads (marks them as complete)
- You're cleaning up after making code changes in response to feedback
- You want to distinguish between minimizing comments (hiding them) and resolving threads (marking conversations as addressed)

## Key Concepts

### Comments vs. Conversation Threads

GitHub PR reviews work in layers:

1. **Review Comments** - Individual code comments that can be minimized (hidden) with classifiers like SPAM, OUTDATED, etc.
2. **Review Threads** - Conversations grouping related comments together. Threads have a separate `isResolved` property that marks them as "addressed" in the UI (shows a checkmark).

When addressing review feedback:
1. **Reply to the comment** with an explanation of fixes made
2. **Minimize the comment** (optional) - marks it visually as OUTDATED
3. **Resolve the thread** - marks the entire conversation as complete with a checkmark ✅

The GitHub UI shows resolved threads with a checkmark even if comments aren't minimized.

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
3. Minimizes each comment using GraphQL's `minimizeComment` mutation
4. Reports results with success/failure status for each comment

**Note:** This command minimizes comments but does NOT resolve threads. See `/resolve-pr-threads` below for thread resolution.

**Requirements:**
- GitHub CLI (`gh`) must be installed and authenticated
- You must have permissions to resolve comments on the repository
- Comments must exist on the PR

### /resolve-pr-threads

Resolve all unresolved review conversation threads on a pull request.

**Usage:**
```
/resolve-pr-threads <pr-number> [<repo-owner>/<repo-name>]
```

**Example:**
```
/resolve-pr-threads 4
/resolve-pr-threads 4 themizzi/markdown-viewer
```

**What it does:**
1. Fetches all review threads from the specified PR
2. Filters for unresolved threads (`isResolved: false`)
3. Resolves each thread using GraphQL's `resolveReviewThread` mutation
4. Reports results with success/failure status for each thread
5. Returns the thread IDs and their new resolved status

**Note:** This marks entire conversations as complete with a checkmark ✅ in the GitHub UI, separate from minimizing individual comments.

**Requirements:**
- GitHub CLI (`gh`) must be installed and authenticated
- You must have permissions to resolve threads on the repository
- Threads must exist on the PR and be unresolved

### /resolve-specific-comments

Minimize specific review comments by their node IDs.

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
2. Minimizes each comment using the `minimizeComment` mutation with `OUTDATED` classifier
3. Reports success/failure for each comment

**Note:** This minimizes/hides comments but does NOT resolve their conversation threads. See `/resolve-pr-threads` for thread resolution.

**Node ID Format:**
- Review comment node IDs begin with `PRRC_` 
- Find them via: `gh api repos/<owner>/<repo>/pulls/<pr>/comments`

### /resolve-specific-threads

Resolve specific review conversation threads by their node IDs.

**Usage:**
```
/resolve-specific-threads <thread-id-1> [<thread-id-2> ...]
```

**Example:**
```
/resolve-specific-threads PRRT_kwDORq0PMc51mZSt PRRT_kwDORq0PMc51mZTB
```

**What it does:**
1. Takes one or more GitHub GraphQL node IDs for review threads
2. Resolves each thread using the `resolveReviewThread` mutation
3. Reports success/failure for each thread

**Thread ID Format:**
- Review thread node IDs begin with `PRRT_`
- Find them via GraphQL query:
```bash
gh api graphql -f query='
query {
  repository(owner: "OWNER", name: "REPO") {
    pullRequest(number: PR) {
      reviewThreads(first: 20) {
        nodes {
          id
          isResolved
        }
      }
    }
  }
}
'
```

## Implementation Details

### GraphQL Mutations

The skill uses these mutations:

**Minimize a comment:**
```graphql
mutation {
  minimizeComment(input: {classifier: OUTDATED, subjectId: "PRRC_..."}) {
    clientMutationId
  }
}
```

**Resolve a conversation thread:**
```graphql
mutation {
  resolveReviewThread(input: {threadId: "PRRT_..."}) {
    thread {
      id
      isResolved
    }
  }
}
```

### Classifier Options (for minimizeComment)

- `SPAM` - Mark as spam
- `OUTDATED` - Mark as outdated
- `ABUSE` - Mark as abusive
- `OFF_TOPIC` - Mark as off-topic

The skill defaults to `OUTDATED` for review comment minimization.

## Workflow Example

**Scenario:** You've addressed 4 review comments on PR #4, posted replies explaining the fixes, and now want to mark them as resolved.

### Step 1: Post replies to the comments

For each review comment, post a reply explaining how you fixed the issue:

```
✅ **Fixed** in commit abc123

Explanation of the fix made...
```

### Step 2: Resolve the conversation threads

Once all replies are posted, resolve the threads to mark conversations as complete:

```bash
# Resolve all unresolved threads on PR #4
/resolve-pr-threads 4 themizzi/markdown-viewer

# Or resolve specific threads by ID
/resolve-specific-threads PRRT_kwDORq0PMc51mZSt PRRT_kwDORq0PMc51mZTB
```

### Step 3: Optionally minimize comments

If you want to visually hide the old review comments, minimize them:

```bash
# Minimize specific comments
/resolve-specific-comments PRRC_kwDORq0PMc6wn2YV PRRC_kwDORq0PMc6wn2Yy
```

### Step 4: Verify in GitHub UI

All resolved threads will show a checkmark ✅ in the conversation list, even if the individual comments aren't minimized. This clearly indicates that the feedback has been addressed.

### Real Example

From PR #4 (markdown-viewer):

```bash
# After posting replies to all 4 Copilot review comments
gh api graphql -f query='
query {
  repository(owner: "themizzi", name: "markdown-viewer") {
    pullRequest(number: 4) {
      reviewThreads(first: 20) {
        nodes {
          id
          isResolved
        }
      }
    }
  }
}
'

# Resolve the two unresolved threads (threads 3 & 4)
/resolve-specific-threads PRRT_kwDORq0PMc51mZTS PRRT_kwDORq0PMc51mZTj

# Verify resolution
gh api graphql -f query='
query {
  repository(owner: "themizzi", name: "markdown-viewer") {
    pullRequest(number: 4) {
      reviewThreads(first: 20) {
        nodes {
          id
          isResolved
        }
      }
    }
  }
}
'
# All 4 threads now show isResolved: true ✅
```

## Error Handling

### Comment Minimization Errors

- **Comment not found:** "comment with ID ... does not exist"
- **Insufficient permissions:** "You don't have permission to modify this comment"
- **Already minimized:** GraphQL will silently succeed (idempotent)
- **Invalid node ID:** GraphQL returns type error

### Thread Resolution Errors

- **Thread not found:** "review thread with ID ... does not exist"
- **Insufficient permissions:** "You don't have permission to resolve this thread"
- **Already resolved:** GraphQL will silently succeed (idempotent)
- **Invalid thread ID:** GraphQL returns type error

All errors are reported with the specific node ID so you can debug which item failed.

## Troubleshooting

### "isResolved still shows false after running /resolve-pr-threads"

**Possible causes:**
- Thread IDs are incorrect - verify using GraphQL query
- GitHub cache hasn't updated - wait a moment and refresh the PR page
- Wrong repository specified - verify owner and repo name

**Solution:**
```bash
# Verify current thread status
gh api graphql -f query='
query {
  repository(owner: "OWNER", name: "REPO") {
    pullRequest(number: PR) {
      reviewThreads(first: 20) {
        nodes {
          id
          isResolved
        }
      }
    }
  }
}
'

# Then resolve unresolved threads
/resolve-pr-threads PR OWNER/REPO
```

### Comments are minimized but thread isn't resolved

This is the correct behavior. Minimizing comments (with `minimizeComment`) and resolving threads (with `resolveReviewThread`) are separate operations:

- Use `/resolve-specific-comments` to minimize/hide comment text
- Use `/resolve-pr-threads` or `/resolve-specific-threads` to mark conversations as addressed ✅

## See Also

- GitHub Docs: [Minimizing comments](https://docs.github.com/en/graphql/reference/mutations#minimizecomment)
- GitHub Docs: [Resolving review threads](https://docs.github.com/en/graphql/reference/mutations#resolvereviewthread)
- GitHub CLI: [gh api](https://cli.github.com/manual/gh_api)
- GitHub API: [PR review threads](https://docs.github.com/en/graphql/reference/objects#pullrequestreviewthread)
- PR comments: `gh api repos/OWNER/REPO/pulls/PR_NUMBER/comments`
- PR review threads: GraphQL query above in Troubleshooting section
