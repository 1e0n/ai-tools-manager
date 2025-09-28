# ATM - AI Tools Manager

🔧 A command-line interface for managing npm-installed AI development tools.

## Features

- **Install Tools**: Install AI development tools that aren't currently installed
- **Query Tools**: Check installed tools, their versions, and available updates
- **Update Tools**: Update installed tools to their latest versions
- **Uninstall Tools**: Remove installed tools from your system

## Installation

### Option 1: From NPM (Recommended)
```bash
npm install -g ai-tools-manager
atm
```

### Option 2: From Source
1. Clone or download this project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Install globally:
   ```bash
   npm install -g .
   ```

### Option 3: Using Install Script
**Linux/macOS:**
```bash
curl -sSL https://your-domain.com/install.sh | bash
```

**Windows:**
```bat
powershell -c "iwr https://your-domain.com/install.bat -outf install.bat; .\install.bat"
```

## Usage

Run the ATM tool:
```bash
npm start
```

Or directly:
```bash
node bin/atm.js
```

### Making ATM globally available

To use `atm` command from anywhere in your system:

1. Install globally in the project directory:
   ```bash
   npm install -g .
   ```

2. Now you can use `atm` from any directory:
   ```bash
   atm
   ```

## Supported Tools

The following AI development tools are supported:

- **Claude Code** - Anthropic's official CLI for Claude AI
- **Qwen Code** - Qwen AI development tools
- **Code Buddy** - Tencent AI code assistant
- **Gemini CLI** - Google Gemini AI command line interface
- **Auggie** - AI-powered code augmentation tool
- **Crush** - Charmland development tool
- **Codex** - OpenAI Codex CLI tool
- **iFlow** - iFlow AI development CLI

## Configuration

Tools are configured in `src/tools-config.json`. Each tool entry contains:

- `name`: Display name for the tool
- `package`: NPM package name for installation
- `description`: Brief description of the tool

To add new tools, edit the configuration file and add new entries to the `tools` array.

## Distribution

### Publishing to NPM
```bash
# Login to npm
npm login

# Publish
npm publish
```

For detailed distribution guide, see [DISTRIBUTION.md](DISTRIBUTION.md).

## Requirements

- Node.js >= 14.0.0
- npm (for package management)

## License

MIT