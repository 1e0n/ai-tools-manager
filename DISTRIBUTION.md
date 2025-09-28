# ATM 分发指南

本文档描述了ATM (AI Tools Manager) 的分发方式。

## 📦 源码分发 (推荐)

### 优点
- 简单可靠，无兼容性问题
- 用户可以查看和修改源码
- 支持所有Node.js支持的平台
- 易于维护和更新

### 分发步骤

#### 1. GitHub Release (推荐)

```bash
# 1. 确保所有更改都已提交
git add .
git commit -m "Prepare for release v1.0.0"

# 2. 创建标签
git tag v1.0.0
git push origin v1.0.0

# 3. 使用GitHub CLI创建release
gh release create v1.0.0 \
  --title "ATM v1.0.0" \
  --notes "AI Tools Manager v1.0.0

## 新功能
- AI工具管理功能
- 多语言支持（中文/英文）
- 交互式命令行界面

## 安装方法
\`\`\`bash
git clone https://github.com/1e0n/ai-tools-manager.git
cd ai-tools-manager
npm install
npm install -g .
\`\`\`"
```

#### 2. 源码压缩包

```bash
# 创建发布包（排除不必要文件）
git archive --format=zip --output=atm-v1.0.0.zip HEAD

# 或者手动压缩（更精细控制）
zip -r atm-v1.0.0.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".claude/*" \
  -x "*.log" \
  -x ".DS_Store"
```

### 用户安装方式

#### 方式1: 从GitHub直接克隆 (推荐)

```bash
# 克隆仓库
git clone https://github.com/1e0n/ai-tools-manager.git
cd ai-tools-manager

# 安装依赖
npm install

# 全局安装
npm install -g .

# 验证安装
atm
```

#### 方式2: 下载Release压缩包

```bash
# 下载并解压
wget https://github.com/1e0n/ai-tools-manager/archive/v1.0.0.zip
unzip v1.0.0.zip
cd ai-tools-manager-1.0.0

# 安装依赖
npm install

# 全局安装
npm install -g .

# 验证安装
atm
```

#### 方式3: 本地开发安装

```bash
# 克隆仓库
git clone https://github.com/1e0n/ai-tools-manager.git
cd ai-tools-manager

# 安装依赖
npm install

# 创建符号链接（用于开发）
npm link

# 使用
atm
```

## 📋 发布清单

发布前检查：

- [ ] 更新版本号在 `package.json`
- [ ] 更新 `README.md` 和 `README_zh.md`
- [ ] 测试所有功能正常工作
- [ ] 检查依赖是否最新
- [ ] 确保所有文档是最新的
- [ ] 运行本地化测试
- [ ] 验证在不同操作系统上的兼容性

## 🔧 维护说明

### 版本管理

```bash
# 更新版本号
npm version patch   # 1.0.0 -> 1.0.1 (bug fixes)
npm version minor   # 1.0.0 -> 1.1.0 (new features)
npm version major   # 1.0.0 -> 2.0.0 (breaking changes)
```

### 发布流程

1. **开发完成** - 确保所有功能测试通过
2. **更新文档** - 更新README和变更日志
3. **版本标记** - 使用 `npm version` 或手动更新
4. **创建Release** - 在GitHub创建正式发布
5. **通知用户** - 更新项目主页和通知

### 用户支持

- **安装问题**: 检查Node.js版本和npm配置
- **功能问题**: 引导用户到GitHub Issues
- **本地化问题**: 验证语言环境变量设置

这种分发方式简单可靠，适合开源项目和技术用户使用。