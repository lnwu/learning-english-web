# Google Cloud Storage Quick Reference

Quick comparison and setup commands for all Google Cloud storage options.

## TL;DR - Recommendations

### 🏆 Best Choice: Firebase Firestore

**Why?**
- Free tier: 1GB storage, 50K reads/day, 20K writes/day
- Real-time sync across devices
- No backend server needed
- Setup time: ~45 minutes
- Monthly cost: $0

**Quick Setup:**
```bash
npm install firebase
```

See [FIREBASE_IMPLEMENTATION_GUIDE.md](./FIREBASE_IMPLEMENTATION_GUIDE.md) for step-by-step instructions.

### 🥈 Alternative: Google Cloud Storage

**Why?**
- Good for file storage (backups, exports)
- Free tier: 5GB storage, 5K writes/month
- Requires backend API
- Setup time: ~60 minutes
- Monthly cost: $0 (within free tier)

**When to use:** Storing backup files, exporting vocabulary lists

See [GOOGLE_CLOUD_STORAGE_OPTIONS.md](./GOOGLE_CLOUD_STORAGE_OPTIONS.md#option-2-google-cloud-storage) for details.

### ❌ Not Recommended: Cloud SQL

**Why?**
- NO FREE TIER - Minimum $9/month
- Overkill for simple key-value storage
- More complex setup

**Only use if:** You have budget and need complex SQL queries

## Quick Comparison

| Feature | Firestore | Cloud Storage | Cloud SQL |
|---------|-----------|---------------|-----------|
| **Cost** | **FREE** ✅ | **FREE** ✅ | **$9/mo** ❌ |
| **Setup Time** | **45 min** ✅ | 60 min | 90 min |
| **Real-time Sync** | **YES** ✅ | NO | NO |
| **Backend Needed** | **NO** ✅ | YES | YES |
| **Best For** | **Web apps** ✅ | Files/backups | Complex apps |

## Free Tier Limits

### Firestore (Recommended)
```
Storage:         1 GB
Reads per day:   50,000
Writes per day:  20,000
Deletes per day: 20,000
```

**Is it enough?** Yes! Even with 50 users, you'll stay within limits.

### Cloud Storage
```
Storage:              5 GB
Writes per month:     5,000
Reads per month:      50,000
Network egress:       1 GB
```

**Is it enough?** Yes for backups, but requires backend API.

### Cloud SQL
```
Free tier: NONE
Minimum cost: ~$9/month
```

**Skip this** for personal projects.

## Installation Commands

### Firestore
```bash
npm install firebase
```

### Cloud Storage
```bash
npm install @google-cloud/storage
```

### Cloud SQL
```bash
npm install pg  # for PostgreSQL
# or
npm install mysql2  # for MySQL
```

## Environment Variables Needed

### Firestore
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Cloud Storage
```bash
GCP_PROJECT_ID=...
GCP_BUCKET_NAME=...
GCP_CLIENT_EMAIL=...
GCP_PRIVATE_KEY=...
```

### Cloud SQL
```bash
DB_HOST=...
DB_PORT=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
```

## Quick Setup Links

- **Firestore**: https://console.firebase.google.com/
- **Cloud Storage**: https://console.cloud.google.com/storage
- **Cloud SQL**: https://console.cloud.google.com/sql

## Cost Monitoring

Set up billing alerts to stay within free tier:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Billing** → **Budgets & alerts**
3. **Create budget** → Set to $0
4. Add alerts at 50%, 90%, 100%

## Migration Path

Current: **localStorage** (browser only)
→ Migrate to: **Firestore** (cloud sync)

**Migration script provided** in implementation guide!

## Code Examples

### Current (localStorage)
```typescript
// Save
localStorage.setItem("words", JSON.stringify(words));

// Load
const words = JSON.parse(localStorage.getItem("words") || "[]");
```

### New (Firestore)
```typescript
// Save
await addDoc(collection(db, "users", userId, "words"), {
  word,
  translation,
});

// Load (real-time)
onSnapshot(collection(db, "users", userId, "words"), (snapshot) => {
  snapshot.forEach(doc => {
    const data = doc.data();
    // Use data
  });
});
```

## Next Steps

1. Choose Firestore (recommended)
2. Follow [FIREBASE_IMPLEMENTATION_GUIDE.md](./FIREBASE_IMPLEMENTATION_GUIDE.md)
3. Complete setup in ~45 minutes
4. Enjoy cloud sync! 🎉

## Support Resources

- **Firestore Docs**: https://firebase.google.com/docs/firestore
- **Firebase Console**: https://console.firebase.google.com/
- **Stack Overflow**: Search "firebase firestore nextjs"
- **Firebase Community**: https://firebase.google.com/community

## FAQs

**Q: Will I be charged?**
A: No, if you stay within free tier limits (very generous for personal apps).

**Q: Can I switch later?**
A: Yes, but migration requires effort. Start with Firestore.

**Q: What if I exceed free tier?**
A: Set up billing alerts. For personal use, unlikely to exceed.

**Q: Is my data secure?**
A: Yes, Firestore security rules ensure users can only access their own data.

**Q: What about GDPR compliance?**
A: Firestore is GDPR compliant. Choose EU region if needed.

## Summary

✅ **Use Firestore** - Best for this project
📁 **Use Cloud Storage** - Only for file backups
❌ **Skip Cloud SQL** - Too expensive for personal use

**Estimated monthly cost**: **$0** (free tier)

Ready to implement? See [FIREBASE_IMPLEMENTATION_GUIDE.md](./FIREBASE_IMPLEMENTATION_GUIDE.md)!
