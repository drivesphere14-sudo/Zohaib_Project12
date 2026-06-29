# Git & Vercel Deployment Guide

## 🚀 Complete Post-Deployment Workflow

---

## 1️⃣ GIT WORKFLOW BEST PRACTICES

### Branch Strategy

```bash
# Main branches
main              # Production (deployed automatically)
develop           # Staging/Pre-production
```

### Development Workflow

```bash
# Step 1: Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/login-improvements

# Step 2: Make changes and commit
git add .
git commit -m "feat: improve login error messages"

# Step 3: Push to remote
git push origin feature/login-improvements

# Step 4: Create Pull Request on GitHub
# Go to GitHub → Create PR → develop branch

# Step 5: After PR merge
git checkout develop
git pull origin develop

# Step 6: Merge develop to main for production
git checkout main
git pull origin main
git merge develop
git push origin main
```

### Commit Message Convention

```
✨ feat:     New feature
🐛 fix:      Bug fix
📝 docs:     Documentation
🎨 style:    Code style (not functionality)
♻️  refactor: Code refactoring
⚡ perf:     Performance improvement
✅ test:     Test additions
🔧 chore:    Build/tooling/dependencies
```

**Examples:**
```bash
git commit -m "feat: add customer dashboard analytics"
git commit -m "fix: resolve login redirect issue"
git commit -m "docs: update README with deployment steps"
git commit -m "perf: optimize database queries for bookings"
```

---

## 2️⃣ VERCEL DEPLOYMENT SETUP

### Automatic Deployment Configuration

Your `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "env": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ],
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  }
}
```

### Deployment Triggers

| Branch | Auto Deploy | Preview | Production |
|--------|-------------|---------|------------|
| `main` | ✅ Yes | ❌ No | ✅ Yes (Live) |
| `develop` | ✅ Yes | ✅ Yes | ❌ No |
| `feature/*` | ✅ Yes | ✅ Yes | ❌ No |

---

## 3️⃣ ENVIRONMENT VARIABLES & SECRETS

### Vercel Dashboard Setup

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Click **Environment Variables**
3. Add variables for each environment:

#### Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DATABASE_URL (if needed)
API_SECRET_KEY
JWT_SECRET
```

**Example Setup:**
```
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
Environments: Production, Preview, Development
```

### Local .env.local (Never commit this!)

```bash
# .env.local (DO NOT COMMIT)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### .gitignore (Ensure this exists)

```
# Environment variables
.env
.env.local
.env.*.local

# Build artifacts
.next
out
dist
build

# Dependencies
node_modules

# Logs
npm-debug.log
yarn-debug.log

# IDE
.vscode
.idea
*.swp
```

---

## 4️⃣ MONITORING & LOGGING

### A. Vercel Analytics

1. **Vercel Dashboard** → Web Analytics
2. See real-time metrics:
   - Page views
   - User interactions
   - Core Web Vitals

### B. Error Tracking with Sentry

Install Sentry for error monitoring:

```bash
npm install @sentry/nextjs
```

Create `.sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_ENV,
  tracesSampleRate: 1.0,
})
```

### C. Server-side Logging

Create `lib/logger.ts`:
```typescript
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data)
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error)
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data)
  },
}
```

Usage in API routes:
```typescript
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    logger.info("Login attempt", { email: email })
    // ... login logic
    logger.info("Login successful", { userId: user.id })
  } catch (error) {
    logger.error("Login failed", error)
  }
}
```

---

## 5️⃣ STAGING & PRODUCTION ENVIRONMENTS

### Vercel Project Configuration

**Settings → Deployments**

```
Production Branch: main
Preview Branch:    develop

Preview branches will get unique preview URLs:
https://<project>-git-feature-xxxx.vercel.app
```

### Environment-specific Configuration

Create `lib/config.ts`:
```typescript
const config = {
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  isPreview: process.env.VERCEL_ENV === "preview",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}

export default config
```

Usage:
```typescript
if (config.isProd) {
  // Production-only logic
  logger.info("Running in production")
}
```

---

## 6️⃣ GIT WORKFLOW - DAY TO DAY

### Daily Development

```bash
# 1. Start your day - sync with develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/new-feature-name

# 3. Make changes
# Edit files...

# 4. Stage and commit
git add .
git commit -m "feat: add new feature"

# 5. Push to remote
git push origin feature/new-feature-name
```

### Creating Pull Request

1. Go to GitHub repository
2. Click "Pull Requests" tab
3. Click "New Pull Request"
4. Select:
   - Base: `develop`
   - Compare: `feature/new-feature-name`
5. Add description and create PR
6. Wait for CI checks ✅
7. Request code review
8. Merge when approved

### Merging to Production

```bash
# 1. Ensure develop is tested and stable
# 2. Create release branch
git checkout -b release/v1.0.0 develop

# 3. Update version in package.json
# vim package.json

# 4. Commit version update
git commit -am "chore: bump version to 1.0.0"

# 5. Merge to main
git checkout main
git pull origin main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main
git push origin v1.0.0

# 6. Merge back to develop
git checkout develop
git merge --no-ff release/v1.0.0
git push origin develop

# 7. Delete release branch
git branch -d release/v1.0.0
```

---

## 7️⃣ COMMON GIT COMMANDS

```bash
# Check status
git status

# View commit history
git log --oneline
git log --graph --oneline --all

# Undo changes
git restore <file>                    # Undo unstaged changes
git reset HEAD <file>                 # Unstage file
git reset --soft HEAD~1               # Undo last commit (keep changes)
git reset --hard HEAD~1               # Undo last commit (discard changes)

# Stash changes temporarily
git stash                              # Save changes
git stash pop                          # Apply saved changes

# View branches
git branch                            # Local branches
git branch -a                         # All branches (local + remote)

# Delete branches
git branch -d feature/old-feature     # Local
git push origin --delete feature/old-feature  # Remote

# Rename branch
git branch -m old-name new-name       # Rename locally
git push origin :old-name new-name    # Push to remote
```

---

## 8️⃣ VERCEL DEPLOYMENT CHECKLIST

Before pushing to main:

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Code lint passes: `npm run lint` (if configured)
- [ ] No console errors in dev mode
- [ ] Environment variables set in Vercel
- [ ] Feature tested on staging (develop branch)
- [ ] Code reviewed by team member
- [ ] Commit messages are descriptive

---

## 9️⃣ QUICK START - YOUR NEXT COMMIT

```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/post-deployment-improvements

# 2. Make your changes (already done in current session)
# The login fixes are already in your local code

# 3. Stage changes
git add .

# 4. Check what you're committing
git status
git diff --cached

# 5. Commit
git commit -m "feat: improve login flow and fix build issues
- Fix Turbopack/Webpack configuration for Next.js 16
- Add TypeScript type annotations for Supabase cookies
- Improve error handling in login API
- Optimize bundle splitting and cache control
- Fix middleware route protection"

# 6. Push to remote
git push origin feature/post-deployment-improvements

# 7. Create Pull Request on GitHub
# - Go to GitHub
# - Click "Compare & pull request"
# - Set base branch to "develop"
# - Add description
# - Create PR

# 8. After PR approved and merged, test on staging
git checkout develop
git pull origin develop

# 9. When ready for production
git checkout main
git merge develop
git push origin main
```

---

## 🔟 VERCEL CLI COMMANDS (Optional)

Install:
```bash
npm i -g vercel
```

Commands:
```bash
# Login to Vercel
vercel login

# Deploy current directory
vercel

# Deploy to production
vercel --prod

# View recent deployments
vercel list

# Check deployment logs
vercel logs

# Set environment variables
vercel env add DATABASE_URL
```

---

## 📋 SUMMARY - Next Steps

1. **Immediate (Now)**
   - ✅ Test login on localhost:3000
   - ✅ Commit current changes to feature branch
   - ✅ Create Pull Request to develop

2. **Test Phase (Day 1)**
   - ✅ Get code review
   - ✅ Merge PR to develop
   - ✅ Test on Vercel preview (develop deployment)
   - ✅ Verify all features work

3. **Production (Day 2-3)**
   - ✅ Create Pull Request: develop → main
   - ✅ Final review
   - ✅ Merge to main
   - ✅ Monitor Vercel live deployment
   - ✅ Check analytics and logs

4. **Ongoing**
   - ✅ Use git workflow for all future features
   - ✅ Monitor errors via Sentry/Vercel
   - ✅ Regular commits with good messages
   - ✅ Keep branches up to date

---

## 🆘 Troubleshooting

### Deployment failed on Vercel
```bash
# Check build locally first
npm run build

# Check environment variables in Vercel dashboard
# Ensure all NEXT_PUBLIC_* variables are set
# Check build logs in Vercel dashboard
```

### Merge conflicts
```bash
git merge develop
# Fix conflicts in editor
git add .
git commit -m "chore: resolve merge conflicts"
git push
```

### Need to undo pushed commit
```bash
git revert HEAD         # Creates new commit that undoes changes
git push origin main
```
