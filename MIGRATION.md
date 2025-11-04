# Migration Guide: localStorage to Database

If you were using a previous version of this application that stored words in localStorage, this guide will help you migrate your data to the new database-backed system.

## Why Migrate?

The new version offers:
- **Multi-device access:** Access your words from any device
- **Data persistence:** No risk of losing data when clearing browser cache
- **Better security:** User authentication with Google OAuth
- **Scalability:** No browser storage limits

## Prerequisites

1. Complete the setup in [SETUP.md](./SETUP.md) first
2. Have access to the browser where your old data is stored
3. Be signed in to the new application

## Migration Methods

### Method 1: Browser Console (Recommended)

This is the easiest method if you have both the old and new versions running.

1. **Export your localStorage data:**
   - Open the old version in your browser (or keep the current tab)
   - Open browser DevTools (F12 or right-click → Inspect)
   - Go to Console tab
   - Run this command:

   ```javascript
   // Export words to JSON
   const words = localStorage.getItem('words');
   console.log(words);
   copy(words); // Copies to clipboard
   ```

2. **Save the data:**
   - The words are now in your clipboard
   - Paste into a text file and save as `words-backup.json`

3. **Sign in to new version:**
   - Open the new application
   - Sign in with Google
   - Open DevTools Console

4. **Import the data:**
   ```javascript
   // Paste your words JSON here
   const oldWords = '[["hello","definition\\ntranslation"],["world","definition\\ntranslation"]]';
   
   // Parse and upload
   const words = JSON.parse(oldWords);
   
   async function migrateWords() {
     let succeeded = 0;
     let failed = 0;
     
     for (const [word, translation] of words) {
       try {
         const response = await fetch('/api/words', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ word, translation })
         });
         
         if (response.ok) {
           console.log(`✓ Migrated: ${word}`);
           succeeded++;
         } else {
           console.error(`✗ Failed: ${word}`, await response.text());
           failed++;
         }
       } catch (error) {
         console.error(`✗ Error: ${word}`, error);
         failed++;
       }
       
       // Small delay to avoid rate limiting
       await new Promise(resolve => setTimeout(resolve, 100));
     }
     
     console.log(`\nMigration complete!`);
     console.log(`Succeeded: ${succeeded}`);
     console.log(`Failed: ${failed}`);
     
     // Refresh the page to see your words
     window.location.reload();
   }
   
   migrateWords();
   ```

5. **Verify:**
   - The page will reload automatically
   - Check "View All Words" to see your migrated vocabulary
   - If some failed, you can re-run the migration (it will skip duplicates)

### Method 2: Manual Export/Import Script

If you prefer a script file:

1. **Create migration script:**

   Save as `migrate-words.html`:

   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <title>Word Migration Tool</title>
   </head>
   <body>
     <h1>Learning English - Migration Tool</h1>
     
     <h2>Step 1: Export from old version</h2>
     <button onclick="exportWords()">Export Words</button>
     <textarea id="exportData" rows="10" cols="80" placeholder="Exported data will appear here"></textarea>
     
     <h2>Step 2: Import to new version</h2>
     <p>Copy the exported data, sign in to the new app, then paste and import:</p>
     <textarea id="importData" rows="10" cols="80" placeholder="Paste exported data here"></textarea>
     <button onclick="importWords()">Import Words</button>
     <div id="status"></div>
     
     <script>
       function exportWords() {
         const words = localStorage.getItem('words');
         if (words) {
           document.getElementById('exportData').value = words;
           alert('Words exported! Copy the text above.');
         } else {
           alert('No words found in localStorage');
         }
       }
       
       async function importWords() {
         const data = document.getElementById('importData').value;
         if (!data) {
           alert('Please paste the exported data first');
           return;
         }
         
         const words = JSON.parse(data);
         const status = document.getElementById('status');
         status.innerHTML = '<p>Importing...</p>';
         
         let succeeded = 0;
         let failed = 0;
         
         for (const [word, translation] of words) {
           try {
             const response = await fetch('/api/words', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ word, translation })
             });
             
             if (response.ok) {
               status.innerHTML += `<p style="color: green">✓ ${word}</p>`;
               succeeded++;
             } else {
               status.innerHTML += `<p style="color: red">✗ ${word}: ${await response.text()}</p>`;
               failed++;
             }
           } catch (error) {
             status.innerHTML += `<p style="color: red">✗ ${word}: ${error.message}</p>`;
             failed++;
           }
           
           await new Promise(resolve => setTimeout(resolve, 100));
         }
         
         status.innerHTML += `<h3>Migration Complete!</h3>`;
         status.innerHTML += `<p>Succeeded: ${succeeded}, Failed: ${failed}</p>`;
       }
     </script>
   </body>
   </html>
   ```

2. **Use the tool:**
   - Open the HTML file in your browser
   - Click "Export Words" to get your data
   - Copy the exported text
   - Sign in to the new application
   - Go back to the tool, paste data, and click "Import"

### Method 3: Manual Entry

For small vocabularies (< 20 words):

1. Open old version and list all your words
2. Sign in to new version
3. Use "Add New Word" page to re-add each word
4. The app will fetch fresh definitions and translations

## Post-Migration

### Verify Data

1. Go to "View All Words" page
2. Compare count with your old version
3. Spot-check a few words for accuracy

### Clean Up

Once verified:

```javascript
// Optional: Clear old localStorage data
localStorage.removeItem('words');
```

## Troubleshooting

### "Failed to import word"

**Cause:** Word already exists or database connection issue

**Solution:**
- Check if word already exists in "View All Words"
- Verify you're signed in
- Check browser console for detailed error
- Try importing one word at a time to identify the issue

### "Authentication failed"

**Cause:** Session expired during migration

**Solution:**
- Refresh the page
- Sign in again
- Re-run the migration script

### "Rate limiting"

**Cause:** Too many requests too quickly

**Solution:**
- Increase the delay in the migration script (change 100 to 500):
  ```javascript
  await new Promise(resolve => setTimeout(resolve, 500));
  ```

### "Invalid word format"

**Cause:** Data corruption in localStorage

**Solution:**
- Manually inspect the exported JSON
- Fix any malformed entries
- Or manually re-add problematic words

## Data Format

Your localStorage data should look like this:

```json
[
  ["hello", "used as a greeting\n你好"],
  ["world", "the earth and all people\n世界"],
  ["book", "a written work\n书"]
]
```

Each word is an array with:
1. English word (string)
2. Translation (string with `\n` separator between English definition and Chinese translation)

## Backup Recommendations

Before migrating:

1. **Export to file:**
   ```javascript
   const words = localStorage.getItem('words');
   const blob = new Blob([words], { type: 'application/json' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = 'words-backup.json';
   a.click();
   ```

2. **Keep the backup file safe** until migration is verified

## Support

If you encounter issues during migration:

1. Check browser console for detailed errors
2. Try migrating a few words first to test
3. Save your localStorage backup before clearing
4. Open an issue on GitHub with:
   - Number of words you're trying to migrate
   - Error messages from console
   - Sample of your data format (without actual words if sensitive)

## Alternative: Fresh Start

If migration seems complex and you have a small vocabulary:

1. Don't migrate - start fresh
2. The new version has better word fetching
3. Rebuilding might give you better definitions
4. You'll learn the words better by re-adding them!

Remember: The migration is optional. You can always keep using both versions or gradually rebuild your vocabulary in the new system.
