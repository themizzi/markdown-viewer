---
description: Handle GitHub PR review comments end-to-end: fetch, implement fixes, reply, and resolve threads via gh GraphQL
mode: all
model: openai/gpt-4-turbo
temperature: 0.1
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

# GitHub PR Comment Resolution Skill

Use this skill when you need to process code review comments on a pull request and complete the full loop:
1) inspect comments,
2) implement fixes,
3) reply on each comment,
4) resolve each review thread.

## Goals

- Never miss a review thread.
- Reply with clear change notes for each comment.
- Mark every addressed thread as resolved (`isResolved: true`).
- Verify final thread state after updates.

## Required Tooling

- `gh` CLI authenticated against the target repo.
- Push access to PR branch.

## Recommended Workflow

### 1) Load all review threads and comments

```bash
gh api graphql -f query='query($owner:String!, $repo:String!, $number:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$number) {
      id
      reviewThreads(first:100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first:20) {
            nodes {
              id
              body
              url
              author { login }
            }
          }
        }
      }
    }
  }
}' -f owner=OWNER -f repo=REPO -F number=PR
```

Track each unresolved thread ID (`PRRT_...`) and the root review comment ID (`PRRC_...`).

### 2) Implement requested fixes

- Update code files.
- Run targeted verification first; then run broader checks as needed.
- Commit and push changes to the PR branch.

### 3) Reply to each review comment

For each code review comment (`pulls/comments/<id>`), post a reply with what changed.

```bash
gh api repos/OWNER/REPO/pulls/PR/comments/COMMENT_ID/replies \
  -f body='Implemented: <what changed>. Verified with: <tests/checks>.'
```

Notes:
- Use the numeric `COMMENT_ID` from REST (`gh api repos/.../pulls/PR/comments`).
- Reply once per thread unless additional clarification is needed.

### 4) Resolve each review thread (GraphQL)

Resolve by thread node ID (`PRRT_...`):

```bash
gh api graphql -f query='mutation($threadId:ID!) {
  resolveReviewThread(input:{threadId:$threadId}) {
    thread {
      id
      isResolved
    }
  }
}' -f threadId=PRRT_THREAD_ID
```

### 5) Verify all threads are resolved

```bash
gh api graphql -f query='query($owner:String!, $repo:String!, $number:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$number) {
      reviewThreads(first:100) {
        nodes {
          id
          path
          isResolved
        }
      }
    }
  }
}' -f owner=OWNER -f repo=REPO -F number=PR
```

Expected: every addressed thread shows `isResolved: true`.

## Fast Commands Reference

### List review comments (REST, includes numeric IDs)

```bash
gh api repos/OWNER/REPO/pulls/PR/comments
```

### List review threads (GraphQL, includes thread node IDs)

Use the query in step 1.

### Reply to a comment

```bash
gh api repos/OWNER/REPO/pulls/PR/comments/COMMENT_ID/replies -f body='...'
```

### Resolve a thread

Use the mutation in step 4.

## Common Pitfalls

- Confusing comment IDs with thread IDs:
  - Comment reply endpoint uses numeric `COMMENT_ID`.
  - Thread resolution mutation uses GraphQL node ID `PRRT_...`.
- Reply endpoint path must include PR number:
  - Correct: `repos/OWNER/REPO/pulls/PR/comments/COMMENT_ID/replies`
- Resolving thread without pushing fix first:
  - Always push code changes before reply/resolve.

## Completion Checklist

- [ ] All requested code changes implemented.
- [ ] Branch pushed.
- [ ] Each review comment has a reply.
- [ ] Each targeted thread resolved.
- [ ] Final verification query confirms `isResolved: true`.
