const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);

class VersionChecker {
  constructor() {
    this.currentVersion = null;
    this.latestVersion = null;
    this.repositoryUrl = 'https://github.com/1e0n/ai-tools-manager';
  }

  async getCurrentVersion() {
    if (this.currentVersion) {
      return this.currentVersion;
    }

    try {
      // 读取package.json获取当前版本
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageData = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageData);
      this.currentVersion = packageJson.version;
      return this.currentVersion;
    } catch (error) {
      console.warn('Could not read current version from package.json');
      return null;
    }
  }

  async getLatestVersionFromGit() {
    try {
      // 检查是否在git仓库中
      await execAsync('git rev-parse --git-dir', { cwd: path.join(__dirname, '..') });

      // 获取远程仓库的最新标签
      await execAsync('git fetch --tags --quiet', { cwd: path.join(__dirname, '..') });

      const { stdout } = await execAsync(
        'git tag --sort=-version:refname | head -1',
        { cwd: path.join(__dirname, '..') }
      );

      const latestTag = stdout.trim();
      // 移除 'v' 前缀（如果存在）
      this.latestVersion = latestTag.startsWith('v') ? latestTag.slice(1) : latestTag;
      return this.latestVersion;
    } catch (error) {
      // 如果git命令失败，尝试通过GitHub API获取
      return await this.getLatestVersionFromAPI();
    }
  }

  async getLatestVersionFromAPI() {
    try {
      // 尝试使用GitHub API获取最新版本
      const https = require('https');

      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.github.com',
          path: '/repos/1e0n/ai-tools-manager/releases/latest',
          method: 'GET',
          headers: {
            'User-Agent': 'ATM-Version-Checker'
          }
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                const release = JSON.parse(data);
                const tagName = release.tag_name;
                // 移除 'v' 前缀（如果存在）
                this.latestVersion = tagName.startsWith('v') ? tagName.slice(1) : tagName;
                resolve(this.latestVersion);
              } else {
                resolve(null);
              }
            } catch (parseError) {
              resolve(null);
            }
          });
        });

        req.on('error', () => {
          resolve(null);
        });

        // 设置超时
        req.setTimeout(5000, () => {
          req.destroy();
          resolve(null);
        });

        req.end();
      });
    } catch (error) {
      return null;
    }
  }

  compareVersions(version1, version2) {
    if (!version1 || !version2) return 0;

    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    const maxLength = Math.max(v1parts.length, v2parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }

    return 0;
  }

  async checkForUpdates() {
    try {
      const [currentVersion, latestVersion] = await Promise.all([
        this.getCurrentVersion(),
        this.getLatestVersionFromGit()
      ]);

      if (!currentVersion || !latestVersion) {
        return {
          hasUpdate: false,
          currentVersion,
          latestVersion,
          error: 'Could not determine version information'
        };
      }

      const comparison = this.compareVersions(currentVersion, latestVersion);

      return {
        hasUpdate: comparison < 0,
        currentVersion,
        latestVersion,
        repositoryUrl: this.repositoryUrl,
        error: null
      };
    } catch (error) {
      return {
        hasUpdate: false,
        currentVersion: await this.getCurrentVersion(),
        latestVersion: null,
        error: error.message
      };
    }
  }

  async openRepository() {
    const { exec } = require('child_process');

    try {
      // 根据操作系统选择打开命令
      let command;
      switch (process.platform) {
        case 'darwin':
          command = `open "${this.repositoryUrl}"`;
          break;
        case 'win32':
          command = `start "" "${this.repositoryUrl}"`;
          break;
        default:
          command = `xdg-open "${this.repositoryUrl}"`;
          break;
      }

      exec(command, (error) => {
        if (error) {
          console.log(`Repository URL: ${this.repositoryUrl}`);
        }
      });

      return true;
    } catch (error) {
      console.log(`Repository URL: ${this.repositoryUrl}`);
      return false;
    }
  }
}

module.exports = { VersionChecker };