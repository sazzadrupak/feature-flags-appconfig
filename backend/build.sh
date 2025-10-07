#!/bin/bash

echo "🏗️  Building TypeScript backend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Compiling TypeScript..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ TypeScript build completed successfully!"
    echo "📁 Compiled files are in the 'dist' directory"
else
    echo "❌ TypeScript build failed!"
    exit 1
fi

echo "🚀 Ready for SAM build and deployment!"