const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class PackageManager {
  async getInstalledPackages() {
    try {
      const { stdout } = await execAsync('npm list -g --depth=0 --json');
      const data = JSON.parse(stdout);
      return Object.keys(data.dependencies || {});
    } catch (error) {
      return [];
    }
  }

  async getPackageVersion(packageName) {
    try {
      const cleanPackageName = this.extractPackageName(packageName);
      const { stdout } = await execAsync(`npm list -g ${cleanPackageName} --depth=0 --json`);
      const data = JSON.parse(stdout);
      return data.dependencies && data.dependencies[cleanPackageName]
        ? data.dependencies[cleanPackageName].version
        : null;
    } catch (error) {
      return null;
    }
  }

  async getLatestVersion(packageName) {
    try {
      const cleanPackageName = this.extractPackageName(packageName);
      const { stdout } = await execAsync(`npm view ${cleanPackageName} version`);
      return stdout.trim();
    } catch (error) {
      return null;
    }
  }

  async installPackage(packageName) {
    try {
      const { stdout, stderr } = await execAsync(`npm install -g ${packageName}`);
      return { success: true, output: stdout + stderr };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updatePackage(packageName) {
    try {
      const { stdout, stderr } = await execAsync(`npm update -g ${packageName}`);
      return { success: true, output: stdout + stderr };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async uninstallPackage(packageName) {
    try {
      const cleanPackageName = this.extractPackageName(packageName);
      const { stdout, stderr } = await execAsync(`npm uninstall -g ${cleanPackageName}`);
      return { success: true, output: stdout + stderr };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  extractPackageName(packageWithVersion) {
    // Handle scoped packages like @scope/package or @scope/package@version
    if (packageWithVersion.startsWith('@')) {
      const parts = packageWithVersion.split('@');
      if (parts.length === 2) {
        // @scope/package (no version)
        return packageWithVersion;
      } else if (parts.length === 3) {
        // @scope/package@version
        return `@${parts[1]}`;
      }
    } else {
      // Handle regular packages like package or package@version
      return packageWithVersion.split('@')[0];
    }
    return packageWithVersion;
  }

  async isPackageInstalled(packageName) {
    const installedPackages = await this.getInstalledPackages();
    const cleanPackageName = this.extractPackageName(packageName);
    return installedPackages.includes(cleanPackageName);
  }
}

module.exports = { PackageManager };