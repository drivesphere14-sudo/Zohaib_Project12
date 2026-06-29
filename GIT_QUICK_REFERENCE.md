# Quick Git Commands - Copy & Paste Ready

## 🚀 Right Now - Make Your First Commit

```bash
# 1. Check current branch and status
git branch
git status

# 2. Switch to develop and update
git checkout develop
git pull origin develop

# 3. Create feature branch
git checkout -b feature/fix-login-and-build

# 4. Stage all changes
git add .

# 5. Verify staging
git status

# 6. Commit with descriptive message
git commit -m "feat: fix build config and login flow issues

- Fix Turbopack configuration for Next.js 16
- Add TypeScript types for Supabase cookies
- Improve login API error handling
- Add caching headers for auth endpoints
- Add monitoring and logging setup
- Create Vercel deployment config"

# 7. Verify commit
git log --oneline -3

# 8. Push to GitHub
git push origin feature/fix-login-and-build
```

---

## 📱 On GitHub - Create Pull Request

1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO
2. Click "Pull Requests" tab
3. Click "New Pull Request"
4. Select: Base: `develop` ← Compare: `feature/fix-login-and-build`
5. Add title: "Fix build issues and improve login flow"
6. Click "Create Pull Request"
7. Wait for CI checks and review

---

## ✅ After PR Approved - Merge to Develop

```bash
# Option A: Merge from GitHub UI (recommended)
# - Click "Merge Pull Request" on GitHub
# - Select "Create a merge commit"
# - Delete branch after merging

# Option B: Merge from command line
git checkout develop
git pull origin develop
git merge feature/fix-login-and-build
git push origin develop

# Delete feature branch (optional)
git branch -d feature/fix-login-and-build
git push origin --delete feature/fix-login-and-build
```

---

## 🎯 When Ready for Production - Merge to Main

```bash
# Update main branch
git checkout main
git pull origin main

# Merge develop to main
git merge develop

# Push to main (this triggers production deployment)
git push origin main

# Optional: Create version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## 📊 Daily Development Flow

```bash
# Start day - sync with develop
git checkout develop
git pull origin develop

# Create feature branch for new work
git checkout -b feature/your-feature-name

# Throughout day...
git add .
git commit -m "feat: your message"

# Push to remote
git push origin feature/your-feature-name

# Create PR when done
# (This will show on GitHub automatically)

# After PR merged
git checkout develop
git pull origin develop
```

---

## 🔍 View History

```bash
# See recent commits (all branches)
git log --oneline --all

# See commits on current branch
git log --oneline -10

# See visual graph
git log --graph --oneline --all

# See commits by person
git log --oneline --author="Your Name"

# See commits with changes
git log -p --oneline -5
```

---

## 🔄 Sync Branches

```bash
# Update current branch with remote
git pull origin

# Fetch all changes without merging
git fetch origin

# See all branches (local and remote)
git branch -a
```

---

## ⚠️ Undo Changes

```bash
# Undo changes in a file (not yet staged)
git restore <filename>

# Unstage a file
git restore --staged <filename>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo pushed commit (creates new commit)
git revert HEAD
git push origin main
```

---

## 🌿 Branch Management

```bash
# List branches
git branch              # Local only
git branch -a           # All (local + remote)

# Delete branch
git branch -d feature/old-branch      # Local
git push origin --delete feature/old-branch  # Remote

# Rename branch
git branch -m old-name new-name

# Switch branch
git checkout branch-name
git switch branch-name    # Newer syntax

# Create and switch
git checkout -b new-branch
git switch -c new-branch
```

---

## 💾 Stash (Temporary Save)

```bash
# Save current changes temporarily
git stash

# See stashed changes
git stash list

# Restore most recent stash
git stash pop

# Restore specific stash
git stash apply stash@{0}

# Clear all stashes
git stash clear
```

---

## 🐛 Debugging

```bash
# See what would happen before merging
git merge --no-commit --no-ff branch-name

# Cancel merge
git merge --abort

# See diff between branches
git diff develop..main

# Show blame (who changed what line)
git blame <filename>

# Search commit messages
git log --grep="login" --oneline
```

---

## 🔑 Common Commands Cheat Sheet

```bash
# Setup (first time)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git clone https://github.com/username/repo.git

# Daily workflow
git status                    # What changed?
git add .                     # Stage changes
git commit -m "message"       # Commit
git push origin branch-name   # Push to remote

# Syncing
git pull origin              # Get latest from remote
git fetch origin             # Download latest without merging

# Branching
git branch -a                # See all branches
git checkout -b feature-x    # Create new branch
git checkout main            # Switch to main
git merge feature-x          # Merge feature-x into current

# Viewing history
git log                       # Full commit history
git log --oneline            # Compact history
git show HEAD                # Show last commit
```

---

## 📋 Before Each Push

✅ Checklist:
- [ ] Run locally: `npm run dev`
- [ ] Build works: `npm run build`
- [ ] No errors in console
- [ ] Changes are intentional: `git diff`
- [ ] Commit message is clear
- [ ] Pushing to correct branch

---

## 🆘 Need Help?

```bash
# Get help on any command
git help <command>
git help commit

# Example:
git help push

# Online resources:
# - https://git-scm.com/
# - https://github.com/git-tips/tips
# - https://ohshitgit.com/ (for mistakes!)
```

---

## 🚀 Your Current Status

You're ready to:
1. ✅ Commit your changes
2. ✅ Create Pull Request
3. ✅ Deploy to Vercel

Just run the commands in the "Right Now" section above!
