#!/bin/bash
# Claude Code Router Setup Script for Setas de la Peña
# Usage: bash scripts/setup-ccr.sh

set -e

echo "🚀 Claude Code Router Setup for Setas de la Peña"
echo "=================================================="
echo ""

# Check for Node.js if using CLI installation
if ! command -v node &> /dev/null && ! command -v npm &> /dev/null; then
    echo "⚠️  Node.js not found. Skipping CLI installation."
    echo "📦 Please install CCR manually:"
    echo "   Option 1: Download desktop app from https://github.com/musistudio/claude-code-router/releases"
    echo "   Option 2: Install CLI with: npm install -g @musistudio/claude-code-router"
    echo "   Option 3: Use Docker: docker compose up -d --build"
    echo ""
else
    echo "✓ Node.js found at: $(command -v node)"
    read -p "Install Claude Code Router CLI? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Installing @musistudio/claude-code-router..."
        npm install -g @musistudio/claude-code-router
        echo "✓ CCR CLI installed"
        echo ""
    fi
fi

# Create docs directory if it doesn't exist
mkdir -p docs

# Check if documentation files exist
echo "📚 Setting up documentation..."
if [ ! -f "docs/claude-code-router-integration.md" ]; then
    echo "ℹ️  Full integration guide: docs/claude-code-router-integration.md"
fi

if [ ! -f "docs/ccr-quick-start.md" ]; then
    echo "ℹ️  Quick start guide: docs/ccr-quick-start.md"
fi

if [ ! -f "docs/ccr-settings-template.json" ]; then
    echo "ℹ️  Settings template: docs/ccr-settings-template.json"
fi

echo ""
echo "🔑 API Keys Setup"
echo "================"
echo ""
echo "You'll need API keys for at least one provider."
echo "You can add them in the CCR UI, but here's what you need:"
echo ""

read -p "Do you have an Anthropic API key? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Get your key at: https://console.anthropic.com/keys"
    echo "You'll enter it in CCR UI → Providers → Add Provider"
    echo ""
fi

read -p "Do you have an OpenAI API key (optional)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Get your key at: https://platform.openai.com/api-keys"
    echo "You'll enter it in CCR UI → Providers → Add Provider"
    echo ""
fi

# Check if .claude directory exists
if [ -d ".claude" ]; then
    echo "✓ .claude directory found"

    # Check for settings.json
    if [ ! -f ".claude/settings.json" ]; then
        read -p "Create .claude/settings.json for model routing? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Creating .claude/settings.json with model routing config..."
            cat > .claude/settings.json << 'EOF'
{
  "modelRouting": {
    "enabled": true,
    "gateway": "http://127.0.0.1:3456"
  },
  "tracking": {
    "enableCostTracking": true,
    "enableTokenTracking": true
  },
  "environment": {
    "ANTHROPIC_API_ENDPOINT": "http://127.0.0.1:3456"
  }
}
EOF
            echo "✓ Created .claude/settings.json"
            echo "  Update with your specific settings later"
        fi
    else
        echo "✓ .claude/settings.json already exists"
        echo "  You can merge settings from docs/ccr-settings-template.json if needed"
    fi
else
    echo "⚠️  .claude directory not found"
    echo "  This is usually created automatically by Claude Code"
fi

echo ""
echo "📋 Next Steps"
echo "============="
echo ""
echo "1. Start Claude Code Router:"
echo "   • Desktop app: Launch from Applications"
echo "   • CLI: ccr ui"
echo "   • Docker: docker compose up -d --build"
echo ""
echo "2. In CCR UI:"
echo "   • Go to Providers → Add Provider"
echo "   • Add your Anthropic API key"
echo "   • (Optional) Add OpenAI key as fallback"
echo "   • Click Server → Start"
echo ""
echo "3. Test it:"
echo "   export ANTHROPIC_API_ENDPOINT=http://127.0.0.1:3456"
echo "   claude"
echo "   # Ask Claude a question"
echo "   # Check CCR Logs tab to see the request"
echo ""
echo "4. Optimize costs:"
echo "   • Review CCR Analytics tab"
echo "   • Set up routing rules in CCR Routing tab"
echo "   • See docs/claude-code-router-integration.md for examples"
echo ""
echo "📖 Documentation"
echo "==============="
echo "• Quick start (10 min):  docs/ccr-quick-start.md"
echo "• Full guide:           docs/claude-code-router-integration.md"
echo "• Settings template:    docs/ccr-settings-template.json"
echo "• CCR official docs:    https://ccrdesk.top"
echo "• CCR GitHub:           https://github.com/musistudio/claude-code-router"
echo ""
echo "✅ Setup script complete!"
