const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs').promises;
const { PackageManager } = require('./package-manager');
const { VersionChecker } = require('./version-checker');
const i18n = require('./i18n');

class ATM {
  constructor() {
    this.packageManager = new PackageManager();
    this.versionChecker = new VersionChecker();
    this.toolsConfig = null;
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, 'tools-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.toolsConfig = JSON.parse(configData);
    } catch (error) {
      console.error(chalk.red(i18n.t('config.loadError')), error.message);
      process.exit(1);
    }
  }

  async checkForUpdates() {
    try {
      const spinner = ora(i18n.t('version.checking')).start();
      const updateInfo = await this.versionChecker.checkForUpdates();
      spinner.stop();

      if (updateInfo.error) {
        // 静默处理错误，不打扰用户
        return;
      }

      if (updateInfo.hasUpdate) {
        console.log(chalk.yellow.bold(`\n${i18n.t('version.updateAvailable')}`));
        console.log(chalk.gray(i18n.t('version.currentVersion', updateInfo.currentVersion)));
        console.log(chalk.green(i18n.t('version.latestVersion', updateInfo.latestVersion)));
        console.log('');

        const { shouldUpdate } = await inquirer.prompt([
          {
            type: 'list',
            name: 'shouldUpdate',
            message: i18n.t('version.updatePrompt'),
            choices: [
              { name: i18n.t('version.openRepository'), value: true },
              { name: i18n.t('version.skipUpdate'), value: false }
            ]
          }
        ]);

        if (shouldUpdate) {
          const opened = await this.versionChecker.openRepository();
          if (opened) {
            console.log(chalk.green(i18n.t('version.repositoryOpened')));
          } else {
            console.log(chalk.yellow(i18n.t('version.repositoryOpenFailed', updateInfo.repositoryUrl)));
          }
          console.log('');
        }
      }
    } catch (error) {
      // 静默处理错误，不影响主程序运行
    }
  }

  async start() {
    console.log(chalk.cyan.bold(`\n${i18n.t('app.title')}\n`));

    await this.loadConfig();

    // 检查更新（非阻塞，可通过环境变量禁用）
    if (process.env.ATM_SKIP_VERSION_CHECK !== 'true') {
      await this.checkForUpdates();
    }

    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: i18n.t('menu.whatToDo'),
          choices: [
            { name: i18n.t('menu.install'), value: 'install' },
            { name: i18n.t('menu.query'), value: 'query' },
            { name: i18n.t('menu.update'), value: 'update' },
            { name: i18n.t('menu.uninstall'), value: 'uninstall' },
            { name: i18n.t('menu.exit'), value: 'exit' }
          ]
        }
      ]);

      if (action === 'exit') {
        console.log(chalk.green(`\n${i18n.t('app.goodbye')}\n`));
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
        console.error(chalk.red(i18n.t('app.error') + ':'), error.message);
      }

      console.log('\n' + i18n.t('app.separator') + '\n');
    }
  }

  async handleInstall() {
    const spinner = ora(i18n.t('install.checking')).start();

    const availableTools = [];
    for (const tool of this.toolsConfig.tools) {
      const isInstalled = await this.packageManager.isPackageInstalled(tool.package);
      if (!isInstalled) {
        availableTools.push(tool);
      }
    }

    spinner.stop();

    if (availableTools.length === 0) {
      console.log(chalk.yellow(i18n.t('install.allInstalled')));
      return;
    }

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: i18n.t('install.selectToInstall'),
        choices: availableTools.map(tool => ({
          name: `${tool.name} (${tool.package})`,
          value: tool,
          short: tool.name
        }))
      }
    ]);

    if (selectedTools.length === 0) {
      console.log(chalk.yellow(i18n.t('install.noneSelected')));
      return;
    }

    for (const tool of selectedTools) {
      const installSpinner = ora(i18n.t('install.installing', tool.name)).start();
      const result = await this.packageManager.installPackage(tool.package);

      if (result.success) {
        installSpinner.succeed(chalk.green(i18n.t('install.success', tool.name)));
      } else {
        installSpinner.fail(chalk.red(i18n.t('install.failed', tool.name, result.error)));
      }
    }
  }

  async handleQuery() {
    const spinner = ora(i18n.t('query.checking')).start();

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
      console.log(chalk.yellow(i18n.t('query.noneInstalled')));
      return;
    }

    console.log(chalk.cyan.bold(`\n${i18n.t('query.installedTools')}\n`));

    for (const tool of installedTools) {
      const versionInfo = tool.currentVersion ? `v${tool.currentVersion}` : i18n.t('query.unknownVersion');
      const updateInfo = tool.hasUpdate
        ? chalk.yellow(` ${i18n.t('query.updateAvailable', tool.latestVersion)}`)
        : chalk.green(` ${i18n.t('query.upToDate')}`);

      console.log(`${chalk.blue('•')} ${chalk.bold(tool.name)} ${chalk.gray(`(${tool.package})`)}`);
      console.log(`  ${chalk.gray(i18n.t('query.version'))} ${versionInfo}${updateInfo}`);
      console.log(`  ${chalk.gray(tool.description)}\n`);
    }
  }

  async handleUpdate() {
    const spinner = ora(i18n.t('update.checking')).start();

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
      console.log(chalk.green(i18n.t('update.allUpToDate')));
      return;
    }

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: i18n.t('update.selectToUpdate'),
        choices: updatableTools.map(tool => ({
          name: `${tool.name} (v${tool.currentVersion} → v${tool.latestVersion})`,
          value: tool,
          short: tool.name
        }))
      }
    ]);

    if (selectedTools.length === 0) {
      console.log(chalk.yellow(i18n.t('update.noneSelected')));
      return;
    }

    for (const tool of selectedTools) {
      const updateSpinner = ora(i18n.t('update.updating', tool.name)).start();
      const result = await this.packageManager.updatePackage(tool.package);

      if (result.success) {
        updateSpinner.succeed(chalk.green(i18n.t('update.success', tool.name)));
      } else {
        updateSpinner.fail(chalk.red(i18n.t('update.failed', tool.name, result.error)));
      }
    }
  }

  async handleUninstall() {
    const spinner = ora(i18n.t('uninstall.checking')).start();

    const installedTools = [];
    for (const tool of this.toolsConfig.tools) {
      const isInstalled = await this.packageManager.isPackageInstalled(tool.package);
      if (isInstalled) {
        installedTools.push(tool);
      }
    }

    spinner.stop();

    if (installedTools.length === 0) {
      console.log(chalk.yellow(i18n.t('uninstall.noneInstalled')));
      return;
    }

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: i18n.t('uninstall.selectToUninstall'),
        choices: installedTools.map(tool => ({
          name: `${tool.name} (${tool.package})`,
          value: tool,
          short: tool.name
        }))
      }
    ]);

    if (selectedTools.length === 0) {
      console.log(chalk.yellow(i18n.t('uninstall.noneSelected')));
      return;
    }

    const { confirmUninstall } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmUninstall',
        message: i18n.t('uninstall.confirm', selectedTools.length),
        default: false
      }
    ]);

    if (!confirmUninstall) {
      console.log(chalk.yellow(i18n.t('uninstall.cancelled')));
      return;
    }

    for (const tool of selectedTools) {
      const uninstallSpinner = ora(i18n.t('uninstall.uninstalling', tool.name)).start();
      const result = await this.packageManager.uninstallPackage(tool.package);

      if (result.success) {
        uninstallSpinner.succeed(chalk.green(i18n.t('uninstall.success', tool.name)));
      } else {
        uninstallSpinner.fail(chalk.red(i18n.t('uninstall.failed', tool.name, result.error)));
      }
    }
  }
}

module.exports = { ATM };