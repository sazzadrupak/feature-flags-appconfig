#!/bin/bash

echo "🏗️  Building Lambda Layer..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf nodejs node_modules

# Create the nodejs directory (required structure for Lambda layers)
echo "📁 Creating layer structure..."
mkdir -p nodejs

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Move node_modules to the correct location for Lambda layer
echo "📦 Moving dependencies to layer structure..."
mv node_modules nodejs/

# Verify the structure
echo "📋 Layer structure:"
find nodejs -maxdepth 2 -type d

echo "✅ Lambda layer build completed successfully!"
echo "📁 Layer files are ready in the 'nodejs' directory"
echo "🚀 Ready for SAM build and deployment!"