[English](README.md) | [中文](README_zh.md)

# ATM - AI Tools Manager

🔧 A command-line interface for managing npm-installed AI development tools.

## Features

- **Install Tools**: Install AI development tools that aren't currently installed
- **Query Tools**: Check installed tools, their versions, and available updates
- **Update Tools**: Update installed tools to their latest versions
- **Uninstall Tools**: Remove installed tools from your system
- **Multi-language Support**: Automatically detects system language (Chinese/English)
- **Auto Update Check**: Checks for newer versions on startup and offers to open the repository

## Installation

### From Git Repository

1. Clone the repository:
   ```bash
   git clone https://github.com/1e0n/ai-tools-manager.git
   cd ai-tools-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install globally:
   ```bash
   npm install -g .
   ```

4. Verify installation:
   ```bash
   atm
   ```

## Usage

Run the ATM tool:
```bash
atm
```

The application will present an interactive menu where you can:
- Install new AI tools
- Query installed tools and check for updates
- Update existing tools to latest versions
- Uninstall tools you no longer need

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
- **OpenCode** - AI coding agent, built for the terminal
- **Copilot CLI** - GitHub Copilot CLI brings the power of Copilot coding agent directly to your terminal

## Configuration

Tools are configured in `src/tools-config.json`. Each tool entry contains:

- `name`: Display name for the tool
- `package`: NPM package name for installation
- `description`: Brief description of the tool

To add new tools, edit the configuration file and add new entries to the `tools` array.

## Localization

ATM supports multiple languages and automatically detects your system language:

- **Chinese (zh)**: 中文界面，自动检测中文系统环境
- **English (en)**: English interface, default fallback language

### Language Detection

The application automatically detects your system language from environment variables:
- `LANG`
- `LC_ALL`
- `LC_MESSAGES`

If your system language is not supported, it defaults to English.

### Supported Languages

Currently supported languages:
- `zh` - 简体中文 (Simplified Chinese)
- `en` - English

### Manual Language Override

You can manually set the language by modifying the environment variable:

```bash
# Force English
LANG=en_US.UTF-8 atm

# Force Chinese
LANG=zh_CN.UTF-8 atm
```

## Advanced Usage

### Disable Version Check

If you want to disable the automatic version check on startup:

```bash
ATM_SKIP_VERSION_CHECK=true atm
```

This can be useful for automated scripts or if you're experiencing network issues.

## Requirements

- Node.js >= 14.0.0
- npm (for package management)
- Git (for cloning the repository)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT