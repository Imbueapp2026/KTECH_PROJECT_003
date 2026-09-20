# Supabase Storage Bucket Setup Guide

## Overview
This guide provides instructions for creating and configuring Supabase Storage buckets for the Avirat Jewelers project.

## Required Buckets

### 1. product-images
- **Purpose**: Store product images (1-4 images per product)
- **Public Access**: Read (public can view images)
- **Write Access**: Admin only (via service role)
- **File Types**: jpg, jpeg, png, webp, svg
- **Max File Size**: 5MB per image

### 2. category-icons
- **Purpose**: Store category icons (optional, for custom icons)
- **Public Access**: Read (public can view icons)
- **Write Access**: Admin only (via service role)
- **File Types**: svg, png, webp
- **Max File Size**: 500KB per icon

## Setup Instructions

### Step 1: Create Buckets via Supabase Dashboard

1. Log in to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** button
4. For each bucket:

#### Create product-images bucket:
- **Name**: `product-images`
- **Public bucket**: Checked (public read access)
- **File size limit**: 5242880 (5MB in bytes)
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`
- Click **"Create bucket"**

#### Create category-icons bucket:
- **Name**: `category-icons`
- **Public bucket**: Checked (public read access)
- **File size limit**: 512000 (500KB in bytes)
- **Allowed MIME types**: `image/svg+xml`, `image/png`, `image/webp`
- Click **"Create bucket"**

### Step 2: Configure Bucket Policies

After creating buckets, configure RLS policies for proper access control.

#### product-images Bucket Policies

1. Navigate to **Storage** → **product-images**
2. Click **"Policies"** tab
3. Create the following policies:

**Policy: Public Read**
- **Policy name**: `public_read`
- **Allowed operation**: `SELECT`
- **Target roles**: `anon`, `authenticated`
- **Policy definition**: `true`
- Click **"Save"**

**Policy: Admin Write**
- **Policy name**: `admin_write`
- **Allowed operation**: `INSERT`, `UPDATE`, `DELETE`
- **Target roles**: `service_role`
- **Policy definition**: `true`
- Click **"Save"**

#### category-icons Bucket Policies

1. Navigate to **Storage** → **category-icons**
2. Click **"Policies"** tab
3. Create the following policies:

**Policy: Public Read**
- **Policy name**: `public_read`
- **Allowed operation**: `SELECT`
- **Target roles**: `anon`, `authenticated`
- **Policy definition**: `true`
- Click **"Save"**

**Policy: Admin Write**
- **Policy name**: `admin_write`
- **Allowed operation**: `INSERT`, `UPDATE`, `DELETE`
- **Target roles**: `service_role`
- **Policy definition**: `true`
- Click **"Save"**

### Step 3: Configure CORS (Optional but Recommended)

If your apps run on different domains, configure CORS for the storage buckets.

1. Navigate to **Storage** → **Settings**
2. Scroll to **"CORS configuration"**
3. Add your app domains:
   ```
   [
     {
       "origin": "http://localhost:3000",
       "methods": ["GET", "HEAD", "OPTIONS"],
       "maxAge": 3600
     },
     {
       "origin": "http://localhost:3001",
       "methods": ["GET", "HEAD", "OPTIONS"],
       "maxAge": 3600
     },
     {
       "origin": "https://your-public-domain.com",
       "methods": ["GET", "HEAD", "OPTIONS"],
       "maxAge": 3600
     },
     {
       "origin": "https://your-admin-domain.com",
       "methods": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
       "maxAge": 3600
     }
   ]
   ```
4. Click **"Save"**

## Verification

After setup, verify the following:

### Bucket Creation
- ✓ `product-images` bucket exists
- ✓ `category-icons` bucket exists
- ✓ Both buckets are marked as public

### Policy Configuration
- ✓ Public read policy exists for both buckets
- ✓ Admin write policy exists for both buckets
- ✓ Policies are active

### File Upload Test
1. Navigate to **Storage** → **product-images**
2. Click **"Upload"** button
3. Upload a test image
4. Verify upload succeeds
5. Copy the public URL and test in browser

## Storage URL Format

Once buckets are created, files can be accessed via:

```
https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/BUCKET_NAME/FILE_PATH
```

Examples:
- Product image: `https://xxx.supabase.co/storage/v1/object/public/product-images/abc123/image1.jpg`
- Category icon: `https://xxx.supabase.co/storage/v1/object/public/category-icons/rings/icon.svg`

## Environment Variables

Update your environment variables with the storage URL:

### Public App (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
NEXT_PUBLIC_STORAGE_URL=https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public
```

### Admin App (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_service_role_key
NEXT_PUBLIC_STORAGE_URL=https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public
```

## Troubleshooting

### Bucket Not Accessible
- Verify bucket is marked as public
- Check RLS policies are correctly configured
- Ensure you're using the correct project reference

### Upload Fails
- Check file size limits
- Verify MIME type is allowed
- Ensure service role key is being used for admin uploads
- Check CORS configuration if uploading from browser

### 403 Forbidden
- Verify RLS policies are active
- Check that service role is being used for write operations
- Ensure bucket is public for read operations

### CORS Errors
- Verify CORS configuration includes your domain
- Check that methods are correctly specified
- Ensure maxAge is set appropriately

## Security Notes

- **Never expose service role key in client-side code**
- Use service role key only in server-side API routes
- Public buckets allow anyone to read files - ensure no sensitive data is stored
- Implement file validation in your upload endpoints (size, type, dimensions)
- Consider implementing virus scanning for uploaded files in production

## Next Steps

After storage buckets are set up:
1. Update the image upload endpoint in admin app to use the new buckets
2. Update product creation flow to upload images to `product-images` bucket
3. Update category management to optionally upload custom icons to `category-icons` bucket
4. Test the complete upload flow end-to-end
