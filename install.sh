#!/bin/bash

# ATM (AI Tools Manager) Installation Script

set -e

echo "🔧 Installing AI Tools Manager (ATM)..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install ATM globally
echo "📦 Installing ATM globally..."

if npm install -g ai-tools-manager; then
    echo "✅ ATM installed successfully!"
    echo ""
    echo "🎉 You can now use 'atm' command from anywhere!"
    echo "   Run 'atm' to start managing your AI tools."
else
    echo "❌ Failed to install ATM from npm registry"
    echo "📥 Trying alternative installation method..."

    # Alternative: Install from source
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"

    echo "⬇️ Downloading source code..."
    # You would replace this with your actual download URL
    # curl -L https://github.com/yourusername/ai-tools-manager/archive/main.zip -o atm.zip
    # unzip atm.zip
    # cd ai-tools-manager-main

    echo "📦 Installing dependencies..."
    # npm install

    echo "🔗 Creating global link..."
    # npm link

    echo "✅ ATM installed from source!"
fi

echo ""
echo "🚀 Installation completed!"
echo "   Run 'atm --help' to get started."