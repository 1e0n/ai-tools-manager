# ATM 分发指南

本文档描述了分发 AI Tools Manager (ATM) 的几种方式。

## 📦 方式1: NPM 发布 (推荐)

### 优点
- 用户安装最简单 (`npm install -g ai-tools-manager`)
- 自动处理依赖关系
- 支持版本管理和更新
- 符合Node.js生态系统标准

### 发布步骤

1. **准备发布**
   ```bash
   # 确保所有文件已提交
   git add .
   git commit -m "Prepare for npm publication"
   
   # 更新版本号
   npm version patch  # 或 minor, major
   ```

2. **发布到NPM**
   ```bash
   # 登录npm (首次需要注册账号)
   npm login
   
   # 发布包
   npm publish
   ```

3. **用户安装方式**
   ```bash
   npm install -g ai-tools-manager
   atm
   ```

## 🔨 方式2: 源码分发

### 优点
- 简单可靠，无兼容性问题
- 用户可以查看和修改源码
- 支持所有Node.js支持的平台

### 分发步骤

```bash
# 创建发布包
git archive --format=zip --output=atm-v1.0.0.zip HEAD

# 或者直接压缩项目目录 (排除不必要文件)
zip -r atm-v1.0.0.zip . -x "node_modules/*" "dist/*" "*.git*" ".claude/*"
```

### 用户安装方式

```bash
# 解压源码
unzip atm-v1.0.0.zip
cd ai-tools-manager

# 安装依赖
npm install

# 全局安装
npm install -g .

# 或者创建符号链接
npm link
```

## 🛠 方式3: 安装脚本

### Linux/macOS
```bash
curl -sSL https://your-domain.com/install.sh | bash
```

### Windows
```bat
powershell -c "iwr https://your-domain.com/install.bat -outf install.bat; .\install.bat"
```

## 📂 方式4: 源码分发

### 打包源码
```bash
# 创建发布包
git archive --format=zip --output=atm-v1.0.0.zip HEAD

# 或者直接压缩项目目录
zip -r atm-v1.0.0.zip . -x "node_modules/*" "dist/*" "*.git*"
```

### 用户安装方式
```bash
# 解压源码
unzip atm-v1.0.0.zip
cd ai-tools-manager

# 安装依赖
npm install

# 全局安装
npm install -g .

# 或者创建符号链接
npm link
```

## 🌍 GitHub Releases

结合GitHub Releases可以提供多种分发方式：

1. **上传可执行文件**到releases
2. **提供安装脚本**下载链接
3. **自动标记版本**和更新日志

### 示例release命令
```bash
# 创建标签
git tag v1.0.0
git push origin v1.0.0

# 或使用GitHub CLI
gh release create v1.0.0 \
  dist/ai-tools-manager-linux \
  dist/ai-tools-manager-macos \
  dist/ai-tools-manager-win.exe \
  --title "ATM v1.0.0" \
  --notes "First release of AI Tools Manager"
```

## 📋 分发清单

发布前检查：

- [ ] 更新 `package.json` 中的作者信息
- [ ] 更新 `README.md` 中的安装说明
- [ ] 测试所有功能正常工作
- [ ] 构建并测试可执行文件
- [ ] 准备更新日志
- [ ] 确保所有配置文件包含在分发包中

## 🔧 维护说明

- **NPM发布**: 使用 `npm version` 管理版本，`npm publish` 更新
- **可执行文件**: 重新运行构建脚本生成新版本
- **GitHub Releases**: 创建新的release并上传文件

选择最适合你目标用户的分发方式！