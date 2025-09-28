const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs').promises;
const { PackageManager } = require('./package-manager');

class ATM {
  constructor() {
    this.packageManager = new PackageManager();
    this.toolsConfig = null;
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, 'tools-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.toolsConfig = JSON.parse(configData);
    } catch (error) {
      console.error(chalk.red('Error loading configuration:'), error.message);
      process.exit(1);
    }
  }

  async start() {
    console.log(chalk.cyan.bold('\n🔧 AI Tools Manager (ATM)\n'));

    await this.loadConfig();

    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '📦 Install tools', value: 'install' },
            { name: '🔍 Query tools', value: 'query' },
            { name: '⬆️  Update tools', value: 'update' },
            { name: '🗑️  Uninstall tools', value: 'uninstall' },
            { name: '❌ Exit', value: 'exit' }
          ]
        }
      ]);

      if (action === 'exit') {
        console.log(chalk.green('\nGoodbye! 👋\n'));
        break;
      }

      try {
        switch (action) {
          case 'install':
            await this.handleInstall();
            break;
          case 'query':
            await this.handleQuery();
            break;
          case 'update':
            await this.handleUpdate();
            break;
          case 'uninstall':
            await this.handleUninstall();
            break;
        }
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
      }

      console.log('\n' + '─'.repeat(50) + '\n');
    }
  }

  async handleInstall() {
    const spinner = ora('Checking installed packages...').start();

    const availableTools = [];
    for (const tool of this.toolsConfig.tools) {
      const isInstalled = await this.packageManager.isPackageInstalled(tool.package);
      if (!isInstalled) {
        availableTools.push(tool);
      }
    }

    spinner.stop();

    if (availableTools.length === 0) {
      console.log(chalk.yellow('All configured tools are already installed! ✨'));
      return;
    }

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: 'Select tools to install:',
        choices: availableTools.map(tool => ({
          name: `${tool.name} (${tool.package})`,
          value: tool,
          short: tool.name
        }))
      }
    ]);

    if (selectedTools.length === 0) {
      console.log(chalk.yellow('No tools selected for installation.'));
      return;
    }

    for (const tool of selectedTools) {
      const installSpinner = ora(`Installing ${tool.name}...`).start();
      const result = await this.packageManager.installPackage(tool.package);

      if (result.success) {
        installSpinner.succeed(chalk.green(`${tool.name} installed successfully!`));
      } else {
        installSpinner.fail(chalk.red(`Failed to install ${tool.name}: ${result.error}`));
      }
    }
  }

  async handleQuery() {
    const spinner = ora('Checking installed packages...').start();

    const installedTools = [];
    for (const tool of this.toolsConfig.tools) {
      const isInstalled = await this.packageManager.isPackageInstalled(tool.package);
      if (isInstalled) {
        const currentVersion = await this.packageManager.getPackageVersion(tool.package);
        const latestVersion = await this.packageManager.getLatestVersion(tool.package);

        installedTools.push({
          ...tool,
          currentVersion,
          latestVersion,
          hasUpdate: currentVersion && latestVersion && currentVersion !== latestVersion
        });
      }
    }

    spinner.stop();

    if (installedTools.length === 0) {
      console.log(chalk.yellow('No configured tools are currently installed.'));
      return;
    }

    console.log(chalk.cyan.bold('\n📋 Installed AI Tools:\n'));

    for (const tool of installedTools) {
      const versionInfo = tool.currentVersion ? `v${tool.currentVersion}` : 'Unknown version';
      const updateInfo = tool.hasUpdate ? chalk.yellow(` → v${tool.latestVersion} available`) : chalk.green(' (up to date)');

      console.log(`${chalk.blue('•')} ${chalk.bold(tool.name)} ${chalk.gray(`(${tool.package})`)}`);
      console.log(`  ${chalk.gray('Version:')} ${versionInfo}${updateInfo}`);
      console.log(`  ${chalk.gray('Description:')} ${tool.description}\n`);
    }
  }

  async handleUpdate() {
    const spinner = ora('Checking for updates...').start();

    const updatableTools = [];
    for (const tool of this.toolsConfig.tools) {
      const isInstalled = await this.packageManager.isPackageInstalled(tool.package);
      if (isInstalled) {
        const currentVersion = await this.packageManager.getPackageVersion(tool.package);
        const latestVersion = await this.packageManager.getLatestVersion(tool.package);

        if (currentVersion && latestVersion && currentVersion !== latestVersion) {
          updatableTools.push({
            ...tool,
            currentVersion,
            latestVersion
          });
        }
      }
    }

    spinner.stop();

    if (updatableTools.length === 0) {
      console.log(chalk.green('All installed tools are up to date! ✨'));
      return;
    }

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: 'Select tools to update:',
        choices: updatableTools.map(tool => ({
          name: `${tool.name} (v${tool.currentVersion} → v${tool.latestVersion})`,
          value: tool,
          short: tool.name
        }))
      }
    ]);

    if (selectedTools.length === 0) {
      console.log(chalk.yellow('No tools selected for update.'));
      return;
    }

    for (const tool of selectedTools) {
      const updateSpinner = ora(`Updating ${tool.name}...`).start();
      const result = await this.packageManager.updatePackage(tool.package);

      if (result.success) {
        updateSpinner.succeed(chalk.green(`${tool.name} updated successfully!`));
      } else {
        updateSpinner.fail(chalk.red(`Failed to update ${tool.name}: ${result.error}`));
      }
    }
  }

  async handleUninstall() {
    const spinner = ora('Checking installed packages...').start();

    const installedTools = [];
    for (const tool of this.toolsConfig.tools) {
      const isInstalled = await this.packageManager.isPackageInstalled(tool.package);
      if (isInstalled) {
        installedTools.push(tool);
      }
    }

    spinner.stop();

    if (installedTools.length === 0) {
      console.log(chalk.yellow('No configured tools are currently installed.'));
      return;
    }

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: 'Select tools to uninstall:',
        choices: installedTools.map(tool => ({
          name: `${tool.name} (${tool.package})`,
          value: tool,
          short: tool.name
        }))
      }
    ]);

    if (selectedTools.length === 0) {
      console.log(chalk.yellow('No tools selected for uninstallation.'));
      return;
    }

    const { confirmUninstall } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmUninstall',
        message: `Are you sure you want to uninstall ${selectedTools.length} tool(s)?`,
        default: false
      }
    ]);

    if (!confirmUninstall) {
      console.log(chalk.yellow('Uninstallation cancelled.'));
      return;
    }

    for (const tool of selectedTools) {
      const uninstallSpinner = ora(`Uninstalling ${tool.name}...`).start();
      const result = await this.packageManager.uninstallPackage(tool.package);

      if (result.success) {
        uninstallSpinner.succeed(chalk.green(`${tool.name} uninstalled successfully!`));
      } else {
        uninstallSpinner.fail(chalk.red(`Failed to uninstall ${tool.name}: ${result.error}`));
      }
    }
  }
}

module.exports = { ATM };