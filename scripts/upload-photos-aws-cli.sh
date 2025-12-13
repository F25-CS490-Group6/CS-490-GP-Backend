#!/bin/bash

# Upload Salon Photos to S3 using AWS CLI
# Usage: ./scripts/upload-photos-aws-cli.sh ~/Desktop/salon-photos

PHOTOS_DIR=${1:-"./photos"}
BUCKET_NAME="stygo-salon-photos"
REGION="us-east-1"

echo "========================================"
echo "📸 Uploading Salon Photos to S3"
echo "========================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found!"
    echo ""
    echo "Install with:"
    echo "  macOS: brew install awscli"
    echo "  Linux: sudo apt-get install awscli"
    echo ""
    exit 1
fi

# Check if directory exists
if [ ! -d "$PHOTOS_DIR" ]; then
    echo "❌ Directory not found: $PHOTOS_DIR"
    echo ""
    echo "Usage: ./scripts/upload-photos-aws-cli.sh ~/Desktop/salon-photos"
    echo ""
    exit 1
fi

echo "📁 Photos directory: $PHOTOS_DIR"
echo "🪣 S3 Bucket: $BUCKET_NAME"
echo ""

# Upload all photos
echo "📤 Uploading photos..."
aws s3 cp "$PHOTOS_DIR" "s3://$BUCKET_NAME/salons/" \
    --recursive \
    --acl public-read \
    --region $REGION \
    --exclude "*" \
    --include "*.jpg" \
    --include "*.jpeg" \
    --include "*.png" \
    --include "*.JPG" \
    --include "*.JPEG" \
    --include "*.PNG"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Upload complete!"
    echo ""
    echo "📋 Your photos are now at:"
    echo "https://$BUCKET_NAME.s3.$REGION.amazonaws.com/salons/salon1.jpg"
    echo "https://$BUCKET_NAME.s3.$REGION.amazonaws.com/salons/salon2.jpg"
    echo "... etc"
    echo ""
    echo "🔄 Now update your database with these URLs:"
    echo "node scripts/update-db-with-s3-urls.js"
    echo ""
else
    echo ""
    echo "❌ Upload failed!"
    echo ""
    echo "Make sure you have configured AWS CLI:"
    echo "  aws configure"
    echo ""
    exit 1
fi

