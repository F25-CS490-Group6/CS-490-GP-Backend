# AWS S3 Setup for File Uploads

This guide explains how to set up AWS S3 for persistent file storage.

## Prerequisites

1. An AWS account
2. AWS CLI installed (optional, for bucket creation)

## Step 1: Create an S3 Bucket

### Option A: Using AWS Console

1. Go to AWS S3 Console: https://s3.console.aws.amazon.com/
2. Click "Create bucket"
3. Bucket name: `stygo-uploads` (or choose your own)
4. Region: `us-east-2` (same as your EC2)
5. Uncheck "Block all public access" (we need public read for images)
6. Acknowledge the warning about public access
7. Click "Create bucket"

### Option B: Using AWS CLI

```bash
aws s3 mb s3://stygo-uploads --region us-east-2
```

## Step 2: Configure Bucket Policy

Add this bucket policy to allow public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::stygo-uploads/*"
        }
    ]
}
```

To add the policy:
1. Go to your bucket in S3 Console
2. Click "Permissions" tab
3. Scroll to "Bucket policy"
4. Click "Edit" and paste the policy above
5. Save changes

## Step 3: Configure CORS

Add this CORS configuration to allow uploads from your frontend:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://main.d9mc2v9b3gxgw.amplifyapp.com",
            "https://yourdomain.com"
        ],
        "ExposeHeaders": ["ETag"]
    }
]
```

## Step 4: Create IAM User for S3 Access

1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Click "Users" → "Add users"
3. Username: `stygo-s3-user`
4. Select "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search for and select `AmazonS3FullAccess` (or create a custom policy for tighter security)
8. Click through to create the user
9. **IMPORTANT**: Save the Access Key ID and Secret Access Key

## Step 5: Add Environment Variables

Add these to your EC2 `.env` file:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-2
AWS_S3_BUCKET=stygo-uploads
```

## Step 6: Restart the Application

```bash
pm2 restart all
```

## File Structure in S3

Uploaded files will be organized as:
- `salons/salon-{timestamp}-{random}.{ext}` - Salon profile pictures
- `services/service-{timestamp}-{random}.{ext}` - Service before/after photos
- `gallery/gallery-{timestamp}-{random}.{ext}` - Salon gallery photos

## Troubleshooting

### Images not loading
- Check bucket policy allows public read
- Verify CORS is configured
- Check the image URL is using HTTPS

### Upload fails
- Verify IAM credentials are correct
- Check the bucket name matches
- Ensure the bucket region matches

### Permission denied
- Verify the IAM user has S3 permissions
- Check the bucket policy is correct

## Security Notes

For production, consider:
1. Using a more restrictive IAM policy (only allow specific bucket access)
2. Setting up CloudFront CDN for better performance
3. Enabling S3 versioning for backup
4. Setting up lifecycle rules to manage old files

