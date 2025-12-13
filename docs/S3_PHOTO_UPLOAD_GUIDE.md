# 📸 Upload Salon Photos to AWS S3

## Step 1: Create S3 Bucket (AWS Console)

1. Go to **AWS Console** → **S3**
2. Click **"Create bucket"**
3. Settings:
   - **Bucket name**: `stygo-salon-photos` (must be globally unique)
   - **Region**: `us-east-1` (or your preferred region)
   - **Block Public Access**: UNCHECK "Block all public access"
   - ⚠️ Acknowledge that objects can be public
4. Click **"Create bucket"**

## Step 2: Configure Bucket for Public Access

1. Open your new bucket
2. Go to **Permissions** tab
3. Scroll to **Bucket policy**
4. Click **Edit** and paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::stygo-salon-photos/*"
    }
  ]
}
```

5. Click **Save changes**

## Step 3: Get Your AWS Credentials

You need these for programmatic access:

1. Go to **IAM** → **Users** → Your user
2. **Security credentials** tab
3. **Create access key**
4. Choose **"Application running on AWS compute service"** or **"Other"**
5. Copy the **Access Key ID** and **Secret Access Key**

Add to your `.env`:
```
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=stygo-salon-photos
```

## Step 4: Prepare Your Photos

1. Create a folder for your photos:
   ```bash
   mkdir ~/Desktop/salon-photos
   ```

2. Save your 10 salon photos there and name them:
   - `salon1.jpg` - Éclat Elite Spa & Salon
   - `salon2.jpg` - Opalessence Spa Boutique
   - `salon3.jpg` - Pearl Esthetics & Atelier
   - `salon4.jpg` - The Atelier Salon & Spa
   - `salon5.jpg` - Luxe Noir Beauty Lounge
   - `salon6.jpg` - Serenity Suites Spa & Salon
   - `salon7.jpg` - Imperial Beauty Gallery
   - `salon8.jpg` - Velvet & Co. Salon
   - `salon9.jpg` - Maison de Beauté
   - `salon10.jpg` - Diamond Lux Salon & Spa

## Step 5: Run Upload Script

```bash
cd /Users/hagershahin/CS-490-GP-Backend
node scripts/upload-and-update-photos.js ~/Desktop/salon-photos
```

This will:
1. Upload all 10 photos to S3
2. Get the public URLs
3. Update your database with the URLs
4. Print all the URLs for reference

## Step 6: Verify Photos

Check your S3 bucket - you should see all photos uploaded!

Test a URL in your browser:
```
https://stygo-salon-photos.s3.us-east-1.amazonaws.com/salons/salon1.jpg
```

---

## 🚀 Quick Alternative: Upload via AWS CLI

If you have AWS CLI installed:

```bash
# Upload all photos at once
aws s3 cp ~/Desktop/salon-photos/ s3://stygo-salon-photos/salons/ --recursive --acl public-read

# List uploaded files
aws s3 ls s3://stygo-salon-photos/salons/
```

Then run the update script to put URLs in database:
```bash
node scripts/update-db-with-s3-urls.js
```

---

## 📝 Photo URLs Format

After upload, your photos will be accessible at:
```
https://stygo-salon-photos.s3.us-east-1.amazonaws.com/salons/salon1.jpg
https://stygo-salon-photos.s3.us-east-1.amazonaws.com/salons/salon2.jpg
...
```

Or with CloudFront (faster):
```
https://d1234567890.cloudfront.net/salons/salon1.jpg
```

