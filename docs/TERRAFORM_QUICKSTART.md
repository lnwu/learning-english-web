# Terraform IaC - Quick Start Guide

Get your automated deployment pipeline up and running in 30 minutes.

## 🎯 What This Sets Up

After following this guide, you'll have:

✅ **Infrastructure as Code** - All infrastructure defined in Terraform  
✅ **Encrypted Secrets** - Sensitive data stored in Google Cloud Secret Manager  
✅ **Automated Deployment** - Push to master → automatic Vercel deployment  
✅ **Zero Manual Config** - No manual Vercel environment variable setup  
✅ **Secure CI/CD** - GitHub Actions with minimal credentials  

## 📋 Prerequisites (5 minutes)

### Required Accounts
- [ ] Google Cloud account (with billing enabled)
- [ ] Firebase project (or will create one)
- [ ] Vercel account
- [ ] GitHub repository access (admin/owner)

### Required Tools
```bash
# Check if tools are installed
which gcloud || echo "Install: https://cloud.google.com/sdk/docs/install"
which vercel || echo "Install: npm install -g vercel"
which gh || echo "Install: https://cli.github.com/"
which terraform || echo "Install: https://www.terraform.io/downloads"
which openssl || echo "Should be pre-installed on macOS/Linux"
```

## 🚀 Option 1: Automated Setup (Recommended)

**Time: ~20 minutes**

### Step 1: Run Setup Script

```bash
cd learning-english
./scripts/setup-infrastructure.sh
```

The script will:
1. ✓ Enable Google Cloud APIs
2. ✓ Create service account with proper permissions
3. ✓ Generate NextAuth secret
4. ✓ Collect Vercel and Firebase credentials
5. ✓ Create `terraform.tfvars` file
6. ✓ Set GitHub Secrets automatically
7. ✓ Initialize Terraform

### Step 2: Review and Apply

```bash
cd terraform

# Review what will be created
terraform plan

# Create infrastructure
terraform apply
```

Type `yes` when prompted.

### Step 3: Trigger Deployment

```bash
cd ..
git add .
git commit -m "feat: Enable automated deployment"
git push origin master
```

**Done!** 🎉 Monitor deployment at: https://github.com/lnwu/learning-english/actions

---

## 🛠️ Option 2: Manual Setup

**Time: ~30 minutes**

See the comprehensive guide: [docs/INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)

---

## 🔍 Verify Setup

### Check GitHub Secrets
```bash
gh secret list
```

Expected output: 15 secrets

### Check Terraform State
```bash
cd terraform
terraform show
```

### Check Vercel Deployment
```bash
vercel ls
```

---

## 📊 How It Works

```
┌─────────────────────────────────────────┐
│  Developer pushes to master branch      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  GitHub Actions Workflow Triggers       │
│  1. Runs linters and tests              │
│  2. Builds Next.js application          │
│  3. Applies Terraform configuration     │
│  4. Deploys to Vercel                   │
└──────────────┬──────────────────────────┘
               │
               ├──────────────┐
               ▼              ▼
┌──────────────────┐  ┌──────────────────┐
│ Google Cloud     │  │ Vercel           │
│ Secret Manager   │  │ Production       │
│ (Encrypted)      │  │ Deployment       │
└──────────────────┘  └──────────────────┘
```

---

## 🔐 Security Features

1. **Encrypted Secrets**: All sensitive data in Secret Manager
2. **Least Privilege**: Service accounts with minimal permissions
3. **No Manual Config**: Secrets injected automatically
4. **Audit Trail**: All changes tracked in Terraform state
5. **Secret Rotation**: Easy to update via GitHub Secrets

---

## 🔄 Day-to-Day Workflow

### Making Code Changes
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Commit and push
git commit -m "feat: Add new feature"
git push origin feature/new-feature

# Create PR → Terraform plan runs automatically
# Merge PR → Automatic deployment to production
```

### Updating Secrets
```bash
# Update in GitHub Secrets
gh secret set AUTH_SECRET --body "$(openssl rand -base64 32)"

# Trigger deployment
git commit --allow-empty -m "chore: Rotate auth secret"
git push origin master
```

### Updating Infrastructure
```bash
cd terraform

# Make changes to .tf files
vim main.tf

# Review changes
terraform plan

# Apply changes
terraform apply

# Commit
git add terraform/
git commit -m "infra: Update infrastructure"
git push origin master
```

---

## 🚨 Common Issues & Solutions

### Issue: "API not enabled"
```bash
gcloud services enable secretmanager.googleapis.com
gcloud services enable firebase.googleapis.com
```

### Issue: "Permission denied"
Check service account has correct roles:
```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions-deploy@*"
```

### Issue: Vercel deployment fails
1. Check token is valid: Create new token at https://vercel.com/account/tokens
2. Verify project ID: `vercel projects list`
3. Update GitHub secret: `gh secret set VERCEL_TOKEN --body "new-token"`

### Issue: Terraform state lock
```bash
# Force unlock if you're sure no other process is running
terraform force-unlock LOCK_ID
```

---

## 📚 Additional Resources

### Detailed Guides
- **[Infrastructure Setup Guide](./docs/INFRASTRUCTURE_SETUP.md)** - Complete step-by-step guide
- **[GitHub Secrets Reference](./docs/GITHUB_SECRETS.md)** - All secrets explained
- **[Terraform README](./terraform/README.md)** - Terraform details

### External Documentation
- [Terraform Docs](https://www.terraform.io/docs)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## ✅ Success Checklist

- [ ] All 15 GitHub Secrets configured
- [ ] Terraform applies without errors
- [ ] GitHub Actions workflow completes successfully
- [ ] Application deploys to Vercel
- [ ] Google OAuth works in production
- [ ] Firebase features work correctly
- [ ] Can make changes and auto-deploy

---

## 🎓 What You've Learned

After this setup, you now have:

1. **Infrastructure as Code** using Terraform
2. **Secret Management** with Google Cloud Secret Manager
3. **CI/CD Pipeline** with GitHub Actions
4. **Automated Deployment** to Vercel
5. **Best Practices** for secure cloud infrastructure

---

## 🆘 Need Help?

1. **Check the troubleshooting sections** in the detailed guides
2. **Review GitHub Actions logs** for deployment errors
3. **Verify all secrets are set**: `gh secret list`
4. **Check Terraform plan**: `terraform plan`
5. **Open an issue** with error details

---

## 🚀 Next Steps

After successful setup:

1. **Set up staging environment**
   - Create separate Vercel project
   - Use different Firebase project
   - Configure staging secrets

2. **Implement monitoring**
   - Set up Google Cloud Monitoring
   - Configure Vercel analytics
   - Add error tracking

3. **Add automated tests**
   - Unit tests in CI/CD
   - E2E tests before deployment
   - Performance testing

4. **Set up backups**
   - Firestore backup schedule
   - Terraform state backup
   - Documentation backup

---

## 📈 Cost Estimates

Expected monthly costs (for small projects):

- **Google Cloud**: Free tier covers most usage (~$0-5/month)
  - Secret Manager: 6 secrets × $0.06/month = $0.36
  - Firebase: Free tier (generous limits)
  
- **Vercel**: Free for hobby projects, Pro starts at $20/month

- **GitHub Actions**: Free for public repos, 2000 min/month for private

**Total**: ~$0-25/month for small to medium traffic

---

## 🎉 Congratulations!

You now have a production-ready, automated deployment pipeline using infrastructure as code best practices!

**Happy coding!** 🚀
