# Simplified GitHub Actions Workflow

- ✅ Manual workflow trigger for both environments
- ✅ Full validation before deployment
- ✅ RDS snapshot creation before migrations
- ✅ GitHub issue creation on failure
- ✅ Rollback instructions in issues

---

## 🚀 How to Use

### Single Manual Process for Both Environments

**To run migrations in DEVELOPMENT:**
```
1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Deploy Database Migrations"
4. Click "Run workflow"
5. Select environment: development
6. Click "Run workflow"
```

**To run migrations in PRODUCTION:**
```
Same steps, but select: production
```

---

## 📋 What Happens When You Click "Run Workflow"

### For BOTH Development and Production:

```
1. Validate Migration Files
   ✓ TypeScript compilation check
   ✓ SQL file syntax validation

2. Configure AWS Credentials
   ✓ Use OIDC for temporary credentials
   ✓ Different IAM role per environment

3. Verify AWS Account
   ✓ Ensure connected to correct account
   ✓ Fail if mismatch

4. Create RDS Snapshot
   ✓ Timestamped snapshot name
   ✓ WAIT for snapshot to complete
   ✓ Save snapshot ID for rollback

5. Check Current Migration Status
   ✓ Show which migrations are pending

6. Run Migrations
   ✓ Execute npm run db:migrate:dev|prod
   ✓ CI=true, AUTO_CONFIRM=true

7. Verify Success
   ✓ Check database health
   ✓ Show final migration status

8. On Failure:
   ✓ Create GitHub issue
   ✓ Include snapshot ID
   ✓ Include rollback command
```

---

## ⏱️ Timing

Both environments follow the same process:

```
Click button → 10s → Validate → 1min → Snapshot → 5-8min → Migrate → 1min → Complete

Total: ~8-10 minutes
```

The main time is waiting for the snapshot to complete (necessary for safety).

---

## 🎯 Benefits of Manual-Only Approach

### Control
- ✅ Full control over when migrations run
- ✅ No surprises from automatic deployments
- ✅ Deliberate, conscious decision for each deployment

### Consistency
- ✅ Same process for dev and prod
- ✅ Both create snapshots and wait
- ✅ Easier to understand (no branch-based logic)

### Safety
- ✅ Always creates snapshots before migrating
- ✅ Waits for snapshot completion
- ✅ Creates GitHub issues on failure
- ✅ No accidental deployments

### Simplicity
- ✅ Less workflow code to maintain
- ✅ No Slack integration to configure
- ✅ Fewer secrets to manage
- ✅ Single, straightforward flow

---

## 🚨 On Failure

If a migration fails, GitHub automatically creates an issue:

**Development Failure:**
```
Title: ⚠️ Development Migration Failed

Body:
- Workflow run link
- Branch that was deployed
- Who triggered it
- Snapshot ID for rollback
- Rollback command ready to copy/paste

Labels: database, development, migration-failure
```

**Production Failure:**
```
Title: 🚨 Production Migration Failed

Body:
- Workflow run link
- Snapshot ID for rollback
- Rollback command ready to copy/paste
- Tagged team members

Labels: critical, database, production
```

---

## 🔄 Rollback Process

If a migration fails, the GitHub issue includes the exact command:

**Development:**
```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier development-rento-postgres-restored \
  --db-snapshot-identifier dev-pre-migration-20250128-143022 \
  --profile rento-development-sso
```

**Production:**
```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier production-rento-postgres-restored \
  --db-snapshot-identifier prod-pre-migration-20250128-143022 \
  --profile rento-production-sso
```

The snapshot ID is automatically captured and included in the issue.

---

## 📊 Workflow File Structure

```yaml
name: Deploy Database Migrations

on:
  workflow_dispatch:        # Manual trigger only
    inputs:
      environment:
        type: choice
        options:
          - development
          - production

jobs:
  validate-migrations:      # Always runs first
    - Check TypeScript
    - Check SQL files

  deploy-to-development:    # Only if environment=development
    needs: validate-migrations
    - AWS auth
    - Create snapshot (WAIT)
    - Run migrations
    - Create issue if failed

  deploy-to-production:     # Only if environment=production
    needs: validate-migrations
    - AWS auth
    - Create snapshot (WAIT)
    - Run migrations
    - Create issue if failed
```

---

## 🎮 Typical Usage Pattern

### Development Workflow

```
Developer:
1. Create migration locally
2. Test: npm run db:migrate:local
3. Commit and push to any branch
4. Create PR for review

Team Lead/Developer:
5. After PR approval → Merge
6. Go to GitHub Actions
7. Click "Run workflow"
8. Select "development"
9. Watch it deploy (~8-10 min)
10. Verify in dev environment

(No automatic deployments)
```

### Production Workflow

```
After testing in dev:

Team Lead:
1. Go to GitHub Actions
2. Click "Run workflow"
3. Select "production"
4. Click "Run workflow"
5. Wait ~8-10 minutes
6. Check GitHub for any failure issues
7. Verify in prod environment
8. Done!
```

---

## 🔍 Monitoring

### Where to Check Progress

```
GitHub Repository
    ↓
Actions tab
    ↓
See "Deploy Database Migrations" runs
    ↓
Click on a run to see:
    • Real-time logs
    • Each step's status
    • Timing information
    • Any error messages
```

### Notification Methods

1. **GitHub UI** - Watch the Actions tab
2. **Email** - GitHub can email you on workflow completion
3. **GitHub Issues** - Created automatically on failure
4. **GitHub Mobile App** - Get push notifications

To enable email notifications:
```
GitHub Settings → Notifications → Actions
✓ Send notifications for failed workflows
```

---

## 💡 Pro Tips

### 1. Label Your PRs
When merging migrations, add a label like `has-migration` so you know to run the workflow.

### 2. Review Before Running
Before clicking "Run workflow":
- Review the migration SQL files
- Check the migration status locally first
- Ensure no one else is running migrations

### 3. Watch the Logs
Don't just click and leave. Watch the workflow logs to catch any issues early.

### 4. Verify Afterwards
After successful deployment:
```bash
# Check what got applied
npm run db:migrate:dev:status
# or
npm run db:migrate:prod:status
```

### 5. Document Large Migrations
For complex migrations, add a comment in the workflow run explaining what it does.
