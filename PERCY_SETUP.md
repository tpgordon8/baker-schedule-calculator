# Percy Visual Regression Testing Setup

## Overview

Percy.io automatically detects visual regressions in your web app by comparing screenshots across builds.

**Free Tier:** 5,000 snapshots/month (sufficient for this project)

## Setup Instructions

### 1. Create Percy Account

1. Go to https://percy.io
2. Sign up with GitHub account
3. Authorize Percy to access your repositories
4. Create project for `baker-schedule-calculator`

### 2. Get Percy Token

1. Go to Percy project settings
2. Copy the **Project Token**
3. Add to GitHub Actions secrets:
   ```bash
   Settings → Secrets and variables → Actions → New repository secret
   Name: PERCY_TOKEN
   Value: <your-token>
   ```

### 3. Run Baseline Setup

First run establishes baseline screenshots:

```bash
# Build the app first
npm run build

# Start dev server
npm run dev  # in another terminal

# Run visual tests with Percy
PERCY_TOKEN=<your-token> npm run test:visual
```

### 4. Verify in Percy Dashboard

- Go to https://percy.io/projects
- View the baseline build
- All snapshots should show as "New"
- Approve baseline build

## How It Works

### Automatic Detection

Every PR and push triggers Percy to:

1. Run visual regression tests
2. Take new screenshots
3. Compare against baseline
4. Highlight any pixel-level changes

### Example Flow

```
Developer pushes code
    ↓
GitHub Actions runs tests
    ↓
Percy compares new screenshots vs baseline
    ↓
Percy comment added to PR with changes
    ↓
Developer reviews changes in Percy UI
    ↓
Approve or request changes
    ↓
Build succeeds or fails accordingly
```

## Test Files

### `tests/e2e/visual/baseline-setup.spec.js`
- Creates initial baseline screenshots
- Run once per environment
- Update when intentionally changing UI

### `tests/e2e/visual/layout-regression.spec.js`
- Runs on every commit
- Detects accidental layout shifts
- Tests responsive designs

## Running Locally

### With Percy (requires token)

```bash
PERCY_TOKEN=<token> npm run test:visual
```

### Without Percy (just Playwright)

```bash
npm run test:e2e
```

## CI/CD Integration

Percy is integrated into GitHub Actions workflow:

```yaml
- name: Run visual tests
  run: npm run test:visual
  env:
    PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

## Common Tasks

### View All Builds

```
https://percy.io/tpgordon8/baker-schedule-calculator/builds
```

### Approve Changes

1. Open PR in Percy dashboard
2. Review screenshot changes
3. Click "Approve" or "Reject"
4. Build status updates

### Update Baseline

After intentional UI changes:

1. Approve new screenshots in Percy
2. This becomes the new baseline
3. Future comparisons use this as reference

### Debug Visual Diffs

```bash
# Run specific test with Percy debugging
PERCY_DEBUG=1 npm run test:visual -- baseline-setup
```

## Snapshot Limits

**Free Tier:** 5,000 snapshots/month

Current usage estimate:
- 5 baseline snapshots
- 5 regression test snapshots
- 60 total (5 × 3 projects)
- Per build = ~65 snapshots
- Monthly budget allows ~76 builds

To optimize:
- Run only on main branch and PRs
- Skip on non-visual changes
- Use Percy to skip unchanged files

## Troubleshooting

### "PERCY_TOKEN not found"

```bash
# Option 1: Set environment variable
export PERCY_TOKEN=<your-token>

# Option 2: Pass as argument
PERCY_TOKEN=<token> npm run test:visual

# Option 3: Create .env file (don't commit!)
echo "PERCY_TOKEN=<token>" > .env.local
```

### Tests timeout with Percy

Percy can slow down tests. Increase timeout:

```bash
PERCY_TIMEOUT=30000 npm run test:visual
```

### Screenshots look wrong

1. Clear Percy cache
2. Re-run baseline setup
3. Check Percy dashboard for rendering issues

## Integration with GitHub Actions

The workflow automatically:

1. Runs tests
2. Captures screenshots
3. Submits to Percy
4. Posts results to PR
5. Blocks merge if violations found

**No manual action needed** - Percy handles everything!

## Best Practices

✅ **Do:**
- Review every diff in Percy
- Approve intentional changes
- Keep baselines updated
- Use meaningful snapshot names

❌ **Don't:**
- Ignore Percy comments on PRs
- Approve without reviewing
- Leave hundreds of snapshots
- Commit PERCY_TOKEN to git

## Security

**Sensitive data warning:**
- Never commit PERCY_TOKEN to git
- Only store in GitHub Secrets
- Environment variables are masked in logs
- Percy builds are private by default

## Resources

- [Percy Documentation](https://docs.percy.io/)
- [Playwright Integration](https://docs.percy.io/docs/playwright)
- [Percy CLI](https://docs.percy.io/docs/cli-overview)
- [Best Practices](https://docs.percy.io/docs/visual-testing-best-practices)
