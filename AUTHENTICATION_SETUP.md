# 🔐 Authentication Setup Guide

## What's Been Added

✅ **Login Page** - Secure email/password authentication  
✅ **Protected Routes** - Admin panel requires login  
✅ **User Sessions** - Automatic session management  
✅ **Logout Functionality** - Sign out button in sidebar  
✅ **Row Level Security** - Database policies require authentication  

---

## Step 1: Run SQL Setup in Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Open SQL Editor**
3. **Copy and run** `supabase-auth-setup.sql`
4. **Verify**: You should see "Authentication policies created!"

This enables Row Level Security (RLS) so only authenticated users can access data.

---

## Step 2: Enable Email Authentication

1. **In Supabase Dashboard** → **Authentication** → **Providers**
2. **Enable "Email"** provider (should already be on)
3. **Settings** → **Email Auth**:
   - **Confirm email**: ON (recommended for production)
   - **Secure email change**: ON
   - **Secure password change**: ON

---

## Step 3: Configure Email Templates (Optional)

**Authentication** → **Email Templates**

Customize:
- Confirmation email
- Magic link email
- Password reset email

---

## Step 4: Create Your Admin Account

### Option A: Via Supabase Dashboard (Recommended)
1. **Authentication** → **Users** → **Add User**
2. Enter your email
3. Set a strong password
4. **Auto confirm user**: ✅ (check this box)
5. Click **Create User**

### Option B: Via App Signup
1. Wait for Netlify deploy (2-3 minutes)
2. Go to https://tstgroupstock.netlify.app
3. You'll see the login page
4. Click "Don't have an account? Sign up"
5. Enter email and password
6. Check your email for confirmation link
7. Click link to confirm

---

## Step 5: Enable 2FA (Two-Factor Authentication)

### For Your Account:
1. **After logging in**, go to **Settings** page
2. Look for **Security** section (coming soon!)
3. Or manually enable in Supabase:
   - **Authentication** → **Your user** → **Edit**
   - Set up Time-based One-Time Password (TOTP)

### For All Users (Force 2FA):
In Supabase Dashboard:
- **Authentication** → **Settings**
- **Multi-Factor Authentication**
- Enable **Require MFA for all users**

---

## Step 6: Test Authentication

1. **Visit**: https://tstgroupstock.netlify.app
2. **You should see** the login page (not the dashboard)
3. **Sign in** with your credentials
4. **You should now see** the full admin panel
5. **Try logging out** using the button in the sidebar
6. **Verify** you're redirected back to login

---

## Security Features Implemented

### ✅ Password Protection
- Minimum 6 characters
- Secure hashing via Supabase
- Password reset flow available

### ✅ Session Management
- Automatic token refresh
- Secure HTTP-only cookies
- Sessions expire after inactivity

### ✅ Database Security
- Row Level Security (RLS) enabled
- Only authenticated users can access data
- Policies enforce at database level

### ✅ Protected Routes
- All admin pages require login
- Automatic redirect to login if not authenticated
- eBay OAuth callback still works without auth

---

## Adding 2FA (Two-Factor Authentication)

### Current Status
- Supabase supports TOTP-based 2FA
- Can be enabled per-user or globally
- Requires phone authenticator app (Google Authenticator, Authy, etc.)

### To Enable:
1. **In Supabase Dashboard**:
   - Authentication → Users → Select user → Factors
   - Add TOTP factor
2. **Or via API** (we can build a UI for this)

Would you like me to build a 2FA enrollment page in Settings?

---

## Emergency Access

### If You Get Locked Out:
1. **Supabase Dashboard** → **Authentication** → **Users**
2. Find your user
3. **Reset password** or **Delete user** and recreate

### Disable Auth (Emergency Only):
In Supabase SQL Editor:
```sql
-- Temporarily allow all access (DANGEROUS!)
DROP POLICY IF EXISTS "Authenticated users can manage skus" ON skus;
CREATE POLICY "Allow all on skus" ON skus FOR ALL USING (true);
-- Repeat for other tables...
```

---

## Testing Checklist

Before production:
- [ ] Can create account
- [ ] Email confirmation works
- [ ] Can log in
- [ ] Can access all pages
- [ ] Can log out
- [ ] Cannot access dashboard without login
- [ ] Sessions persist after refresh
- [ ] Password reset works (optional)

---

## What's Next

Once authentication is tested:
1. ✅ Add production eBay credentials
2. ✅ Test with real eBay listings
3. ✅ Monitor for 24 hours
4. 🚀 Launch!

---

## Need Help?

Common issues:
- **"Invalid credentials"**: Check email/password carefully
- **"Email not confirmed"**: Check spam folder or use dashboard to confirm
- **"Redirect loop"**: Clear browser cache and cookies
- **Can't access after login**: Check browser console for errors

Let me know if you need the 2FA enrollment UI or any other security features!
