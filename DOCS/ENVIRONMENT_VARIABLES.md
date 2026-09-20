# Environment Variables Setup Guide

## Overview
This guide documents all required environment variables for the Avirat Jewelers project.

## Public App Environment Variables

Create a `.env.local` file in `apps/public/` with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Storage URL (optional, defaults to Supabase storage)
NEXT_PUBLIC_STORAGE_URL=https://your-project-ref.supabase.co/storage/v1/object/public
```

### Required Variables

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY**: Your Supabase anon/public key (safe to expose in client code)

### Optional Variables

- **NEXT_PUBLIC_STORAGE_URL**: Base URL for storage bucket access (defaults to Supabase storage)

## Admin App Environment Variables

Create a `.env.local` file in `apps/admin/` with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY=your-service-account-private-key

# Storage URL (optional)
NEXT_PUBLIC_STORAGE_URL=https://your-project-ref.supabase.co/storage/v1/object/public
```

### Required Variables

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY**: Your Supabase anon/public key
- **SUPABASE_SECRET_KEY**: Your Supabase service role key (NEVER expose in client code)
- **NEXT_PUBLIC_FIREBASE_API_KEY**: Firebase API key
- **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**: Firebase auth domain
- **NEXT_PUBLIC_FIREBASE_PROJECT_ID**: Firebase project ID
- **FIREBASE_ADMIN_PROJECT_ID**: Firebase project ID (for admin SDK)
- **FIREBASE_ADMIN_CLIENT_EMAIL**: Firebase service account email
- **FIREBASE_ADMIN_PRIVATE_KEY**: Firebase service account private key

### Optional Variables

- **NEXT_PUBLIC_STORAGE_URL**: Base URL for storage bucket access

## Getting Your Keys

### Supabase Keys

1. Log in to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **service_role key**: `SUPABASE_SECRET_KEY` (admin app only)

### Firebase Keys

1. Log in to Firebase Console
2. Navigate to **Project Settings** → **General**
3. Copy the following:
   - **API Key**: `NEXT_PUBLIC_FIREBASE_API_KEY`
   - **Auth Domain**: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - **Project ID**: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

4. For Firebase Admin SDK:
   - Navigate to **Project Settings** → **Service Accounts**
   - Click **Generate New Private Key**
   - Save the JSON file securely
   - Extract the following values:
     - `project_id`: `FIREBASE_ADMIN_PROJECT_ID`
     - `client_email`: `FIREBASE_ADMIN_CLIENT_EMAIL`
     - `private_key`: `FIREBASE_ADMIN_PRIVATE_KEY`

## Security Notes

### Critical Security Rules

- **NEVER commit `.env.local` files to version control**
- **NEVER expose `SUPABASE_SECRET_KEY` in client-side code**
- **NEVER expose Firebase service account private key in client-side code**
- **NEVER share service role keys or private keys in public repositories**
- **ALWAYS use service role keys only in server-side code (API routes, server actions)**

### Key Permissions

- **Anon/Public Key**: Safe for client-side use, RLS-enforced access
- **Service Role Key**: Bypasses RLS, use only in server-side admin operations
- **Firebase Admin SDK**: Full admin privileges, use only in server-side code

## Environment-Specific Configuration

### Development

```bash
# apps/public/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=dev-anon-key

# apps/admin/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=dev-anon-key
SUPABASE_SECRET_KEY=dev-service-role-key
NEXT_PUBLIC_FIREBASE_API_KEY=dev-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dev-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dev-project-id
FIREBASE_ADMIN_PROJECT_ID=dev-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=dev-service-account@dev-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Production

```bash
# apps/public/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=prod-anon-key

# apps/admin/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=prod-anon-key
SUPABASE_SECRET_KEY=prod-service-role-key
NEXT_PUBLIC_FIREBASE_API_KEY=prod-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prod-project-id
FIREBASE_ADMIN_PROJECT_ID=prod-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=prod-service-account@prod-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Validation

The apps include environment variable validation:

### Public App
- Checks for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` on initialization
- Throws error if missing

### Admin App
- Checks for all required Supabase and Firebase variables
- Throws descriptive error messages if missing

## Deployment

### Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each variable with its value
4. Redeploy to apply changes

### Other Platforms

Follow your hosting platform's environment variable configuration process to add the required variables.

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` file exists in the correct app directory
- Verify variable names match exactly (case-sensitive)
- Restart development server after adding variables

### "Missing Firebase environment variables"
- Ensure all Firebase variables are set in admin app
- Verify Firebase project is configured correctly
- Check that service account private key is properly formatted (include newlines)

### Service role key not working
- Verify you're using the service role key, not the anon key
- Ensure service role key is only used in server-side code
- Check that RLS policies allow service role access

### CORS errors
- Verify CORS configuration in Supabase Storage settings
- Ensure your domain is added to allowed origins
- Check that storage buckets are marked as public
