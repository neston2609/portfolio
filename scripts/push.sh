#!/usr/bin/env bash
# Daily-driver "stage everything, commit, push" helper.
#
# Usage:
#   ./scripts/push.sh "your commit message"
#   ./scripts/push.sh                      # prompts for the message
#   ./scripts/push.sh --amend              # amend the last commit (no message change), push --force-with-lease
#   ./scripts/push.sh -n                   # dry run (show what would happen, no writes)
#
# Safety:
#   - Refuses to run on detached HEAD.
#   - Refuses to push to main/master without explicit ALLOW_MAIN_PUSH=1.
#   - Uses --force-with-lease (never plain --force) when amending.
#   - Never skips hooks (--no-verify).

set -euo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "error: not inside a git repository" >&2; exit 1
}

dry_run=0
amend=0
msg=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--dry-run) dry_run=1; shift ;;
    --amend)      amend=1; shift ;;
    -h|--help)    sed -n '2,18p' "$0"; exit 0 ;;
    *)            msg="$1"; shift ;;
  esac
done

branch=$(git symbolic-ref --short HEAD 2>/dev/null) || {
  echo "error: detached HEAD — checkout a branch first" >&2; exit 1
}

remote=$(git config --get "branch.${branch}.remote" 2>/dev/null || echo "origin")
git remote get-url "$remote" >/dev/null 2>&1 || {
  echo "error: no remote named '$remote' configured" >&2; exit 1
}

# Block accidental main/master pushes unless explicitly allowed.
if [[ "$branch" == "main" || "$branch" == "master" ]] && [[ "${ALLOW_MAIN_PUSH:-0}" != "1" ]]; then
  echo "→ branch is '$branch'."
  read -r -p "Push directly to '$branch'? Type 'yes' to confirm: " confirm
  [[ "$confirm" == "yes" ]] || { echo "aborted"; exit 1; }
fi

echo "→ branch:  $branch"
echo "→ remote:  $remote ($(git remote get-url "$remote"))"
echo
echo "→ working tree status:"
git status --short

has_changes=0
[[ -n "$(git status --porcelain)" ]] && has_changes=1
has_unpushed=0
git fetch --quiet "$remote" "$branch" 2>/dev/null || true
if git rev-parse --quiet --verify "${remote}/${branch}" >/dev/null 2>&1; then
  [[ -n "$(git rev-list "${remote}/${branch}..HEAD" 2>/dev/null)" ]] && has_unpushed=1
else
  has_unpushed=1   # branch not on remote yet
fi

if [[ $has_changes -eq 0 && $has_unpushed -eq 0 && $amend -eq 0 ]]; then
  echo "✓ nothing to commit and nothing to push"
  exit 0
fi

if [[ $has_changes -eq 1 ]]; then
  if [[ $dry_run -eq 1 ]]; then
    echo "→ [dry-run] would: git add -A"
  else
    git add -A
  fi
  echo
  echo "→ files staged for commit:"
  git diff --cached --stat || true
fi

# Commit step (only if something is staged or we're amending).
# In dry-run we use the working-tree status as the "would-be-staged" proxy.
staged_any=0
if [[ $dry_run -eq 1 ]]; then
  [[ $has_changes -eq 1 ]] && staged_any=1
else
  [[ -n "$(git diff --cached --name-only)" ]] && staged_any=1
fi

if [[ $amend -eq 1 ]]; then
  if [[ $dry_run -eq 1 ]]; then
    echo "→ [dry-run] would: git commit --amend --no-edit"
  else
    git commit --amend --no-edit
  fi
elif [[ $staged_any -eq 1 ]]; then
  if [[ -z "$msg" ]]; then
    echo
    echo "Enter commit message (end with a blank line, Ctrl-C to abort):"
    msg=""
    while IFS= read -r line; do
      [[ -z "$line" && -n "$msg" ]] && break
      msg+="${line}"$'\n'
    done
  fi
  if [[ -z "${msg// /}" ]]; then
    echo "error: empty commit message" >&2; exit 1
  fi
  if [[ $dry_run -eq 1 ]]; then
    echo "→ [dry-run] would commit with message:"
    printf '    %s\n' "$msg"
  else
    git commit -m "$msg"
  fi
fi

# Push step
push_args=("$remote" "$branch")
if [[ $amend -eq 1 ]]; then
  push_args=(--force-with-lease "$remote" "$branch")
fi

if [[ $dry_run -eq 1 ]]; then
  echo "→ [dry-run] would: git push ${push_args[*]}"
  exit 0
fi

git push "${push_args[@]}"
echo "✓ pushed $branch to $remote"
