# GitHub Actions Workflow Troubleshooting Guide

## Quick Fix (Try This First!)

### Option A: Clear Cache and Retry (90% Success Rate)

1. **Open GitHub Actions:**
   ```
   https://github.com/tpgordon8/baker-schedule-calculator/actions
   ```

2. **Clear Cache:**
   - Go to: Settings → Actions → General → Caches
   - Find cache entries starting with `node_modules-` or `npm-`
   - Click "🗑️ Delete" on each npm cache entry
   - Wait for confirmation

3. **Retry Workflow:**
   - Return to Actions tab
   - Find the most recent "Test & Quality Assurance" run that failed
   - Click: "Re-run failed jobs"
   - Wait 5-10 minutes for workflow to complete
   - Check if all jobs pass ✅

---

## If Still Failing: Check Detailed Logs

### Step 1: Find the Failed Run

1. Go to: https://github.com/tpgordon8/baker-schedule-calculator/actions
2. Click on "Test & Quality Assurance" workflow (left sidebar)
3. Find the most recent failed run (usually at top)
4. Click the run title to open it

### Step 2: Expand the Failing Job

- Look for the red ❌ badge next to "Code Quality & Build"
- Click to expand that job
- Scroll through the steps and find which step has ❌

### Step 3: Read the Error Message

Look for one of these patterns:

#### **Error Pattern 1: "npm ERR!"**
```
npm ERR! code XXXX
npm ERR! ...description...
```
→ **Solution:** Node/npm version mismatch. See "Node Version Fix" below.

#### **Error Pattern 2: "Error: ENOENT: no such file"**
```
Error: ENOENT: no such file or directory
```
→ **Solution:** File missing. Likely npm ci didn't complete. Try cache clear again.

#### **Error Pattern 3: "Error: Command failed"**
```
Error: eslint: Command not found
```
→ **Solution:** npm ci failed silently. Clear cache and retry.

#### **Error Pattern 4: "Unexpected token" or syntax error**
```
SyntaxError: Unexpected token...
```
→ **Solution:** Check .eslintrc.cjs or workflow YAML syntax. Unlikely but possible.

---

## Solution: Update Node.js Version

If you see Node/npm version errors, try updating the workflow to use a newer Node LTS:

### Quick Patch (Edit in GitHub)

1. Go to: `.github/workflows/test.yml` in main branch
2. Find line with: `node-version: '18'`
3. Change to: `node-version: '20'` (or '22')
4. Click "Commit changes"
5. Workflow will auto-trigger with new Node version

### Or Via Command Line

```bash
cd /home/user/baker-schedule-calculator

# Update workflow to use Node 20
sed -i "s/node-version: '18'/node-version: '20'/g" .github/workflows/test.yml

# Commit and push
git add .github/workflows/test.yml
git commit -m "Fix: Update Node.js to version 20 LTS for better compatibility"
git push origin main
```

---

## Solution: Regenerate package-lock.json

If the issue is package compatibility:

```bash
cd /home/user/baker-schedule-calculator

# Clean up
rm -rf node_modules package-lock.json

# Regenerate with current environment
npm install

# Commit
git add package-lock.json
git commit -m "Fix: Regenerate package-lock.json for better compatibility"
git push origin main
```

**Note:** This only needed if Node version fix doesn't work.

---

## Complete Workflow Status Check

After any fix, verify the workflow by checking all job statuses:

### Expected Results (All Should Have ✅)

```
✅ Code Quality & Build
   ├─ Checkout code
   ├─ Setup Node.js
   ├─ Install dependencies
   ├─ Run ESLint
   ├─ Build application
   └─ Upload build artifacts

✅ Unit Tests (Vitest)
   ├─ Checkout code
   ├─ Setup Node.js
   ├─ Install dependencies
   ├─ Run unit tests
   └─ Upload test coverage

✅ E2E Tests (Desktop Chrome)
   ├─ ... (similar structure)
   └─ Upload Playwright report

✅ E2E Tests (Mobile Android)
   ├─ ... (similar structure)
   └─ Upload Playwright report

✅ E2E Tests (Mobile iOS Simulator)
   ├─ ... (similar structure)
   └─ Upload Playwright report

✅ Test Results Summary
   └─ Check test status
```

If any job shows ❌, click it to see detailed error logs.

---

## Debugging Tips

### Enable Verbose npm Output

If npm ci is failing silently, add verbose logging:

```bash
# Edit .github/workflows/test.yml
# Change "npm ci" line to "npm ci --verbose"
```

### Test Locally with Exact GitHub Environment

Simulate GitHub Actions locally:

```bash
# Clean slate
rm -rf node_modules package-lock.json

# Use exact npm version GitHub Actions would use
npm install -g npm@9

# Install
npm ci

# Run quality checks
npm run lint
npm run build
```

### Check Network Connectivity

GitHub Actions might have network issues downloading dependencies:

```bash
# In GitHub Actions logs, look for:
# "Error: getaddrinfo ENOTFOUND"
# "Error: connect ETIMEDOUT"
# "Error: 403 Forbidden"
```

These indicate network/firewall issues, not code problems.

---

## Nuclear Option: Rebuild from Scratch

If nothing works, rebuild the workflow:

```bash
# 1. Backup current workflow
cp .github/workflows/test.yml .github/workflows/test.yml.backup

# 2. Start with minimal workflow
cat > .github/workflows/test.yml << 'EOF'
name: Quality Gate

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
EOF

# 3. Commit and test
git add .github/workflows/test.yml
git commit -m "Fix: Minimal workflow to isolate issue"
git push origin main

# 4. Once minimal workflow passes, gradually add back test jobs
```

---

## Support Resources

### GitHub Actions Docs
- Status checks and required checks: https://docs.github.com/en/actions/managing-workflow-runs
- Caching dependencies: https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows

### Node.js LTS Versions
- Node 18 LTS: Supported until April 2025
- Node 20 LTS: Supported until April 2026 ✅ (Recommended)
- Node 22: Latest, supported until April 2027

### Common GitHub Actions Issues
- https://github.com/actions/setup-node/issues (search for similar issues)
- https://github.com/npm/npm/issues (npm-specific problems)

---

## Checklist: Verification After Fix

- [ ] Cleared GitHub Actions cache
- [ ] Retried workflow manually
- [ ] Checked detailed error logs in GitHub Actions
- [ ] Confirmed all 5 jobs completed (quality, unit-tests, e2e-desktop, e2e-mobile, e2e-ios)
- [ ] All jobs show ✅ status
- [ ] "Test Results Summary" job shows "✅ All tests passed!"

---

## Still Having Issues?

If the workflow still fails after trying these steps:

1. **Collect the exact error message** from GitHub Actions logs
2. **Screenshot** the failing step with the error
3. **Check** if error occurs in:
   - Setup Node.js step → Node/npm version issue
   - Install dependencies (npm ci) → Cache/network issue  
   - Run ESLint step → Code issue (unlikely, passes locally)
   - Build step → Build configuration issue

4. **Report** with:
   - Exact error message text
   - Screenshot of the failing step
   - Which job failed (quality, unit-tests, e2e-desktop, etc.)

---

**Last Updated:** 2026-04-06  
**Workflow File:** `.github/workflows/test.yml`  
**Project:** baker-schedule-calculator
