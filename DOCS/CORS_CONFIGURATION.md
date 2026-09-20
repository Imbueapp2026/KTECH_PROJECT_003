# CORS Configuration Guide

## Overview
This guide provides instructions for configuring Cross-Origin Resource Sharing (CORS) for the Avirat Jewelers project.

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature that restricts cross-origin HTTP requests. It's required when your frontend and backend are on different domains.

## Required CORS Configuration

### 1. Supabase API CORS

Configure CORS in your Supabase project to allow requests from your app domains.

#### Steps:

1. Log in to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Scroll to **"CORS allowed origins"**
4. Add your domains:

**Development:**
```
http://localhost:3000
http://localhost:3001
```

**Production:**
```
https://your-public-domain.com
https://your-admin-domain.com
```

5. Click **"Save"**

### 2. Supabase Storage CORS

Configure CORS for storage buckets to allow file uploads and downloads.

#### Steps:

1. Navigate to **Storage** → **Settings**
2. Scroll to **"CORS configuration"**
3. Add the following JSON configuration:

```json
[
  {
    "origin": "http://localhost:3000",
    "methods": ["GET", "HEAD", "OPTIONS"],
    "maxAge": 3600
  },
  {
    "origin": "http://localhost:3001",
    "methods": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
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

### 3. Next.js API Routes CORS

Next.js API routes handle CORS automatically for same-origin requests. For cross-origin requests, you may need to add CORS headers.

#### Public App API Routes

The public app APIs are designed to be called from the same origin, so no additional CORS configuration is needed in the code.

#### Admin App API Routes

The admin app APIs are called from the same origin (admin dashboard), so no additional CORS configuration is needed in the code.

### 4. Firebase CORS

Firebase handles CORS automatically. No additional configuration is needed.

## Testing CORS Configuration

### Test Supabase API CORS

```bash
# Test from public app domain
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-project.supabase.co/rest/v1/products

# Test from admin app domain
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-project.supabase.co/rest/v1/products
```

### Test Storage CORS

```bash
# Test storage access
curl -I https://your-project.supabase.co/storage/v1/object/public/product-images/test.jpg
```

## Common CORS Issues

### Issue: "No 'Access-Control-Allow-Origin' header is present"

**Cause:** Origin not included in Supabase CORS configuration

**Solution:** Add your domain to Supabase CORS allowed origins

### Issue: "CORS policy: Method is not allowed"

**Cause:** HTTP method not included in CORS configuration

**Solution:** Ensure the required methods (GET, POST, PUT, DELETE) are included in storage CORS configuration

### Issue: "CORS policy: Request header field is not allowed"

**Cause:** Custom headers not included in CORS configuration

**Solution:** Add required headers to CORS configuration if using custom headers

### Issue: Preflight request fails

**Cause:** OPTIONS method not allowed or CORS misconfiguration

**Solution:** Ensure OPTIONS method is included in CORS configuration

## Deployment-Specific Configuration

### Vercel

Vercel handles CORS automatically for API routes. No additional configuration needed.

### Custom Domains

If using custom domains, ensure:

1. DNS is properly configured
2. SSL certificates are valid
3. Domains are added to Supabase CORS configuration
4. Domains are added to Storage CORS configuration

## Security Considerations

### Best Practices

- **Only allow specific origins**: Don't use `*` for production
- **Limit allowed methods**: Only include methods your app actually uses
- **Set appropriate maxAge**: Cache preflight requests for reasonable time (3600s = 1 hour)
- **Use HTTPS in production**: Always use HTTPS for production domains
- **Regularly review CORS configuration**: Remove unused origins

### Development vs Production

**Development:**
- Allow `localhost` origins
- Allow all methods for testing
- Shorter maxAge for easier debugging

**Production:**
- Only allow specific production domains
- Restrict methods to what's actually needed
- Longer maxAge for better performance

## Monitoring CORS Issues

### Browser Console

Check browser console for CORS errors:
- Network tab shows failed requests
- Console shows CORS error messages

### Server Logs

Check Supabase logs for CORS-related errors:
- Navigate to **Logs** in Supabase dashboard
- Filter for CORS-related errors

## Troubleshooting Checklist

- [ ] Domain added to Supabase API CORS allowed origins
- [ ] Domain added to Supabase Storage CORS configuration
- [ ] Required methods included in CORS configuration
- [ ] Custom headers included if needed
- [ ] SSL certificate valid for HTTPS domains
- [ ] DNS properly configured for custom domains
- [ ] No typos in domain names
- [ ] CORS configuration saved and applied

## Additional Resources

- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Supabase CORS Documentation](https://supabase.com/docs/guides/api/cors)
- [Next.js API Routes CORS](https://nextjs.org/docs/api-routes/introduction)
