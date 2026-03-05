# 🔑 How to Get eBay Production Client Secret

## Step-by-Step Guide

### Step 1: Go to eBay Developer Portal
Visit: **https://developer.ebay.com/my/keys**

### Step 2: Switch to Production Environment
- Look at the **top right** of the page
- You'll see a toggle or dropdown that says "Sandbox" or "Production"
- **Click it** and select **"Production"**

### Step 3: Locate Your Keyset
You should now see your production keys. They look like this:

```
App ID (Client ID): TSTgroup-AutoStoc-PRD-cb45dba5a-d9e1765b
Cert ID (Client Secret): PRD-[HIDDEN - CLICK TO REVEAL]
```

### Step 4: Reveal the Client Secret
- Find the row that says **"Cert ID"** or **"Client Secret"**
- There should be a button that says:
  - **"Show"** or
  - **"View"** or
  - **"Reveal"** or
  - An eye icon 👁️

- **Click it** to reveal the secret
- It will look something like: `PRD-cb45dba5ac81a-70ff-4705-87ed-49a9`

### Step 5: Copy It
- **Select all the text** (the entire Cert ID/Client Secret)
- **Copy it** (Ctrl+C or Cmd+C)
- **Keep it safe** - don't share publicly!

---

## Visual Guide

### What You're Looking For:

```
Production Keys

┌─────────────────────────────────────────────────┐
│ App ID (Client ID)                              │
│ TSTgroup-AutoStoc-PRD-cb45dba5a-d9e1765b       │
│                                                  │
│ Cert ID (Client Secret)              [Show]     │ ← CLICK HERE
│ PRD-xxxxxxxxxxxxxxxxxxxxxxxxx                   │
│                                                  │
│ Dev ID                                          │
│ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx              │
└─────────────────────────────────────────────────┘
```

---

## Troubleshooting

### "I don't see Production keys"
**Solution**: 
1. Make sure you're logged into your eBay developer account
2. Check that you've created a production keyset
3. If not, click **"Create a keyset"** in production mode

### "I only see Sandbox keys"
**Solution**: 
- Look for the environment toggle (top right)
- Switch from "Sandbox" to "Production"

### "There's no Show/View button"
**Solution**: 
- The secret might already be visible
- Copy the entire string after "Cert ID:"
- It's usually around 40-50 characters long

### "I accidentally regenerated my keys"
**Solution**: 
- If you clicked "Regenerate", the old secret is now invalid
- Use the new one that's displayed
- Update all places where you used the old secret

---

## What to Do After You Find It

Once you have your Production Client Secret:

1. **Send me both**:
   ```
   App ID: TSTgroup-AutoStoc-PRD-cb45dba5a-d9e1765b
   Cert ID: [paste the secret here]
   ```

2. **I'll update Netlify** environment variables:
   - `VITE_EBAY_CLIENT_ID` = Your App ID
   - `VITE_EBAY_CLIENT_SECRET` = Your Cert ID
   - `VITE_EBAY_ENVIRONMENT` = production

3. **Deploy will happen automatically** (2-3 minutes)

4. **You can then test** with real eBay listings!

---

## Security Note

⚠️ **IMPORTANT**: 
- Never commit Client Secret to GitHub
- Never share it publicly
- Only share it with me in this private chat
- It's like a password for your eBay app

---

## Still Having Trouble?

If you can't find it, try:
1. Take a screenshot of your eBay developer keys page
2. Send it to me (make sure to hide/blur any visible secrets)
3. I'll guide you to exactly where to click

---

## Alternative Method: Using eBay Developer Console

If the keys page is different:

1. Go to: **https://developer.ebay.com/my/auth**
2. Look for **"User Tokens"** or **"OAuth Credentials"**
3. Select your production application
4. Look for **"Application Keys"** or **"Credentials"**
5. The Client Secret should be there

---

Let me know once you've found it! 🎯
