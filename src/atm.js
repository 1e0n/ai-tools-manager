const inquirer = require('inquirer');

// Create custom list prompt without English hints
class CustomListPrompt extends inquirer.prompt.prompts.list {
  render() {
    // Render question
    let message = this.getQuestion();

    if (this.firstRender) {
      // Don't add the "(Use arrow keys)" hint - leave empty
    }

    // Render choices or answer depending on the state
    if (this.status === 'answered') {
      message += require('chalk').cyan(this.opt.choices.getChoice(this.selected).short);
    } else {
      const choicesStr = this.listRender(this.opt.choices, this.selected);
      const indexPosition = this.opt.choices.indexOf(
        this.opt.choices.getChoice(this.selected)
      );
      const realIndexPosition =
        this.opt.choices.reduce((acc, value, i) => {
          // Dont count lines past the choice we are looking at
          if (i > indexPosition) {
            return acc;
          }

          // Skip choice object if disabled or separator
          if (value.type === 'separator' || value.disabled) {
            return acc;
          }

          // Calculate lines taken up by string
          let l = value.name || value;
          if (typeof l === 'string') {
            // Calculate lines taken up by string
            l = l.split('\n');
            return acc + l.length;
          }
          return acc + 1;
        }, 0) - 1;
      message +=
        '\n' + this.paginator.paginate(choicesStr, realIndexPosition, this.opt.pageSize);
    }

    this.firstRender = false;

    this.screen.render(message);
  }

  listRender(choices, pointer) {
    let output = '';
    let separatorOffset = 0;
    const chalk = require('chalk');
    const figures = require('figures');

    choices.forEach((choice, i) => {
      if (choice.type === 'separator') {
        separatorOffset++;
        output += '  ' + choice + '\n';
        return;
      }

      if (choice.disabled) {
        separatorOffset++;
        output += '  - ' + choice.name;
        output += ` (${
          typeof choice.disabled === 'string' ? choice.disabled : 'Disabled'
        })`;
        output += '\n';
        return;
      }

      const isSelected = i - separatorOffset === pointer;
      let line = (isSelected ? figures.pointer + ' ' : '  ') + choice.name;
      if (isSelected) {
        line = chalk.cyan(line);
      }

      output += line + ' \n';
    });

    return output.replace(/\n$/, '');
  }
}

// Create custom checkbox prompt without English hints
class CustomCheckboxPrompt extends inquirer.prompt.prompts.checkbox {
  render() {
    // Render question
    let message = this.getQuestion();

    if (this.firstRender) {
      // Don't add the English hints - leave empty for international compatibility
    }

    // Render choices or answer depending on the state
    if (this.status === 'answered') {
      const selection = this.opt.choices
        .where(function (choice) {
          return choice.checked && !choice.disabled;
        })
        .map(function (choice) {
          return choice.short;
        });
      message += require('chalk').cyan(selection.join(', '));
    } else {
      const choicesStr = this.renderChoices(this.opt.choices, this.pointer);
      const indexPosition = this.opt.choices.indexOf(
        this.opt.choices.getChoice(this.pointer)
      );
      const realIndexPosition =
        this.opt.choices.reduce((acc, value, i) => {
          // Dont count lines past the choice we are looking at
          if (i > indexPosition) {
            return acc;
          }
          // Skip choice object if disabled or separator
          if (value.type === 'separator' || value.disabled) {
            return acc;
          }
          // Calculate lines taken up by string
          let l = value.name || value;
          if (typeof l === 'string') {
            l = l.split('\n');
            return acc + l.length;
          }
          return acc + 1;
        }, 0) - 1;

      message +=
        '\n' + this.paginator.paginate(choicesStr, realIndexPosition, this.opt.pageSize);
    }

    this.firstRender = false;

    this.screen.render(message);
  }

  renderChoices(choices, pointer) {
    let output = '';
    let separatorOffset = 0;
    const chalk = require('chalk');
    const figures = require('figures');

    choices.forEach((choice, i) => {
      if (choice.type === 'separator') {
        separatorOffset++;
        output += '  ' + choice + '\n';
        return;
      }

      if (choice.disabled) {
        separatorOffset++;
        output += '  - ' + choice.name;
        output += ` (${
          typeof choice.disabled === 'string' ? choice.disabled : 'Disabled'
        })`;
        output += '\n';
        return;
      }

      const isSelected = i - separatorOffset === pointer;
      const checkbox = choice.checked ? figures.radioOn : figures.radioOff;
      let line = (isSelected ? figures.pointer + ' ' : '  ') + checkbox + ' ' + choice.name;
      if (isSelected) {
        line = chalk.cyan(line);
      }

      output += line + ' \n';
    });

    return output.replace(/\n$/, '');
  }
}

inquirer.registerPrompt('customList', CustomListPrompt);
inquirer.registerPrompt('customCheckbox', CustomCheckboxPrompt);
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
    // Cache for tool installation status
    this.installedTools = [];
    this.uninstalledTools = [];
    // Cache for version information
    this.versionCache = new Map(); // Map<packageName, {currentVersion, latestVersion}>
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

  async initializeToolsCache() {
    const spinner = ora(i18n.t('app.initializing')).start();

    for (const tool of this.toolsConfig.tools) {
      const isInstalled = await this.packageManager.isPackageInstalled(tool.package);
      if (isInstalled) {
        this.installedTools.push(tool);
      } else {
        this.uninstalledTools.push(tool);
      }
    }

    spinner.stop();
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
            type: 'customList',
            name: 'shouldUpdate',
            message: `${i18n.t('version.updatePrompt')} ${i18n.t('prompts.useArrowKeys')}`,
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

    // 初始化工具缓存
    await this.initializeToolsCache();

    // 检查更新（非阻塞，可通过环境变量禁用）
    if (process.env.ATM_SKIP_VERSION_CHECK !== 'true') {
      await this.checkForUpdates();
    }

    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'customList',
          name: 'action',
          message: `${i18n.t('menu.whatToDo')} ${i18n.t('prompts.useArrowKeys')}`,
          choices: [
            { name: i18n.t('menu.install'), value: 'install' },
            { name: i18n.t('menu.query'), value: 'query' },
            { name: i18n.t('menu.update'), value: 'update' },
            { name: i18n.t('menu.uninstall'), value: 'uninstall' },
            { name: i18n.t('menu.exit'), value: 'exit' }
          ],
          pageSize: 10
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
    if (this.uninstalledTools.length === 0) {
      console.log(chalk.yellow(i18n.t('install.allInstalled')));
      return;
    }

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'customCheckbox',
        name: 'selectedTools',
        message: `${i18n.t('install.selectToInstall')} ${i18n.t('prompts.pressSpace')}`,
        choices: this.uninstalledTools.map(tool => ({
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
        // Cache version info for newly installed tool while spinner is still showing
        installSpinner.text = i18n.t('install.installing', tool.name) + ' - ' + i18n.t('query.checking');
        const currentVersion = await this.packageManager.getPackageVersion(tool.package);
        const latestVersion = await this.packageManager.getLatestVersion(tool.package);
        this.versionCache.set(tool.package, { currentVersion, latestVersion });

        installSpinner.succeed(chalk.green(i18n.t('install.success', tool.name)));
        // Move tool from uninstalled to installed list
        this.uninstalledTools = this.uninstalledTools.filter(t => t.package !== tool.package);
        this.installedTools.push(tool);
      } else {
        installSpinner.fail(chalk.red(i18n.t('install.failed', tool.name, result.error)));
      }
    }
  }

  async handleQuery() {
    if (this.installedTools.length === 0) {
      console.log(chalk.yellow(i18n.t('query.noneInstalled')));
      return;
    }

    const spinner = ora(i18n.t('query.checking')).start();

    // Fetch version info for tools that don't have cached data
    for (const tool of this.installedTools) {
      if (!this.versionCache.has(tool.package)) {
        const currentVersion = await this.packageManager.getPackageVersion(tool.package);
        const latestVersion = await this.packageManager.getLatestVersion(tool.package);
        this.versionCache.set(tool.package, { currentVersion, latestVersion });
      }
    }

    spinner.stop();

    console.log(chalk.cyan.bold(`\n${i18n.t('query.installedTools')}\n`));

    for (const tool of this.installedTools) {
      const versionData = this.versionCache.get(tool.package);
      const currentVersion = versionData?.currentVersion;
      const latestVersion = versionData?.latestVersion;
      const hasUpdate = currentVersion && latestVersion && currentVersion !== latestVersion;

      const versionInfo = currentVersion ? `v${currentVersion}` : i18n.t('query.unknownVersion');
      const updateInfo = hasUpdate
        ? chalk.yellow(` ${i18n.t('query.updateAvailable', latestVersion)}`)
        : chalk.green(` ${i18n.t('query.upToDate')}`);

      console.log(`${chalk.blue('•')} ${chalk.bold(tool.name)} ${chalk.gray(`(${tool.package})`)}`);
      console.log(`  ${chalk.gray(i18n.t('query.version'))} ${versionInfo}${updateInfo}`);
      console.log(`  ${chalk.gray(tool.description)}\n`);
    }
  }

  async handleUpdate() {
    if (this.installedTools.length === 0) {
      console.log(chalk.yellow(i18n.t('query.noneInstalled')));
      return;
    }

    const spinner = ora(i18n.t('update.checking')).start();

    // Fetch version info for tools that don't have cached data
    const updatableTools = [];
    for (const tool of this.installedTools) {
      if (!this.versionCache.has(tool.package)) {
        const currentVersion = await this.packageManager.getPackageVersion(tool.package);
        const latestVersion = await this.packageManager.getLatestVersion(tool.package);
        this.versionCache.set(tool.package, { currentVersion, latestVersion });
      }

      const versionData = this.versionCache.get(tool.package);
      const currentVersion = versionData?.currentVersion;
      const latestVersion = versionData?.latestVersion;

      if (currentVersion && latestVersion && currentVersion !== latestVersion) {
        updatableTools.push({
          ...tool,
          currentVersion,
          latestVersion
        });
      }
    }

    spinner.stop();

    if (updatableTools.length === 0) {
      console.log(chalk.green(i18n.t('update.allUpToDate')));
      return;
    }

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'customCheckbox',
        name: 'selectedTools',
        message: `${i18n.t('update.selectToUpdate')} ${i18n.t('prompts.pressSpace')}`,
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
        // Update the cached version to latest version
        const versionData = this.versionCache.get(tool.package);
        if (versionData) {
          versionData.currentVersion = versionData.latestVersion;
        }
      } else {
        updateSpinner.fail(chalk.red(i18n.t('update.failed', tool.name, result.error)));
      }
    }
  }

  async handleUninstall() {
    if (this.installedTools.length === 0) {
      console.log(chalk.yellow(i18n.t('uninstall.noneInstalled')));
      return;
    }

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'customCheckbox',
        name: 'selectedTools',
        message: `${i18n.t('uninstall.selectToUninstall')} ${i18n.t('prompts.pressSpace')}`,
        choices: this.installedTools.map(tool => ({
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
        message: `${i18n.t('uninstall.confirm', selectedTools.length)} ${i18n.t('prompts.confirm')}`,
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
        // Move tool from installed to uninstalled list
        this.installedTools = this.installedTools.filter(t => t.package !== tool.package);
        this.uninstalledTools.push(tool);
        // Remove from version cache
        this.versionCache.delete(tool.package);
      } else {
        uninstallSpinner.fail(chalk.red(i18n.t('uninstall.failed', tool.name, result.error)));
      }
    }
  }
}

module.exports = { ATM };