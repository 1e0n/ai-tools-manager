const fs = require('fs');
const path = require('path');

class I18n {
  constructor() {
    this.currentLocale = 'en';
    this.translations = {};
    this.init();
  }

  init() {
    // 检测系统语言
    this.detectLocale();

    // 加载语言文件
    this.loadTranslations();
  }

  detectLocale() {
    // 获取系统语言环境
    const systemLocale = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || 'en';

    // 提取语言代码 (例如：zh_CN.UTF-8 -> zh, en_US.UTF-8 -> en)
    const languageCode = systemLocale.split('_')[0].split('.')[0].toLowerCase();

    // 支持的语言列表
    const supportedLanguages = ['zh', 'en'];

    // 如果系统语言在支持列表中，使用系统语言，否则使用英文
    this.currentLocale = supportedLanguages.includes(languageCode) ? languageCode : 'en';
  }

  loadTranslations() {
    try {
      // 加载当前语言的翻译文件
      const translationPath = path.join(__dirname, `${this.currentLocale}.json`);
      const translationData = fs.readFileSync(translationPath, 'utf8');
      this.translations = JSON.parse(translationData);
    } catch (error) {
      // 如果加载失败，回退到英文
      console.warn(`Warning: Could not load translations for '${this.currentLocale}', falling back to English`);
      this.currentLocale = 'en';
      try {
        const englishPath = path.join(__dirname, 'en.json');
        const englishData = fs.readFileSync(englishPath, 'utf8');
        this.translations = JSON.parse(englishData);
      } catch (englishError) {
        console.error('Error: Could not load English translations either');
        this.translations = {};
      }
    }
  }

  // 获取翻译文本，支持嵌套键和参数替换
  t(key, ...args) {
    const keys = key.split('.');
    let value = this.translations;

    // 遍历嵌套键
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 如果找不到翻译，返回键本身
        console.warn(`Translation not found for key: ${key}`);
        return key;
      }
    }

    // 如果最终值不是字符串，返回键
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // 参数替换 (支持 %s 和 %d 格式)
    if (args.length > 0) {
      return this.formatString(value, ...args);
    }

    return value;
  }

  // 字符串格式化
  formatString(str, ...args) {
    let argIndex = 0;
    return str.replace(/%[sd]/g, (match) => {
      if (argIndex < args.length) {
        const arg = args[argIndex++];
        if (match === '%d') {
          return Number(arg).toString();
        } else {
          return String(arg);
        }
      }
      return match;
    });
  }

  // 获取当前语言
  getCurrentLocale() {
    return this.currentLocale;
  }

  // 手动设置语言
  setLocale(locale) {
    if (locale !== this.currentLocale) {
      this.currentLocale = locale;
      this.loadTranslations();
    }
  }

  // 获取可用语言列表
  getAvailableLocales() {
    const i18nDir = __dirname;
    const files = fs.readdirSync(i18nDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }
}

// 创建全局实例
const i18n = new I18n();

module.exports = i18n;