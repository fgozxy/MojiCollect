# 日本語カードゲーム (Japanese Card Game)

一个交互式的日语学习抽卡游戏，帮助用户通过听写和记忆练习来学习日语单词。

## 功能特性

- 📝 **多语言输入**: 支持日语、假名、中文输入
- 🎵 **音频支持**: 可导入单词音频文件
- 🎴 **随机抽卡**: 随机显示日语、假名、中文或播放音频
- ✍️ **听写练习**: 用户需要补充其他信息
- 🤖 **两种模式**: 自己抽卡 / 系统自动抽卡
- 📊 **历史记录**: 查看练习记录和正确答案
- ⏱️ **定时设置**: 可设置自动抽卡间隔
- 🎯 **卡片显示控制**: 可独立控制各类信息的显示，实现专项练习

### 🆕 核心功能

#### 🎯 卡片显示控制系统
- **独立的显示控制**：可以分别启用/禁用日语、假名、中文、音频显示
- **专项练习模式**：
  - 只启用音频：纯听写练习
  - 只启用中文：中译日练习
  - 只启用假名：假名还原练习
  - 自定义组合：灵活组合多种信息
- **智能提示系统**：根据启用选项动态调整输入提示
- **历史记录完整显示**：无论设置如何，历史记录始终显示完整信息

#### 使用场景示例
1. **纯听写模式**：只启用"音频播放"，系统播放音频，用户需要输入所有信息
2. **中译日模式**：只启用"中文显示"，显示中文，用户需要输入日语和假名
3. **假名练习模式**：只启用"假名显示"，显示假名，用户需要输入日语和中文

## 使用方法

1. 在单词管理中添加日语单词（日语、假名、中文、音频）
2. 在设置中配置语言和卡片显示选项
3. 选择抽卡模式（手动/自动）
4. 开始练习，根据显示的信息补充其他内容
5. 查看历史记录检查答案

## ⚙️ 设置说明

### 基础设置
- **显示语言**: 选择界面语言（中文/日语/英语）
- **主题**: 选择浅色或深色主题
- **自动播放音频**: 启用后自动播放音频题目
- **显示提示**: 显示输入提示信息

### 🎯 卡片显示设置（核心功能）
- **启用日语显示**: 是否显示日语文字
- **启用假名显示**: 是否显示假名（平假名/片假名）
- **启用中文显示**: 是否显示中文翻译
- **启用音频播放**: 是否播放音频题目

**注意**: 至少需要启用一种显示选项。禁用的信息将需要用户手动输入，实现专项练习。

### 推荐配置
- **纯听写练习**: 只启用"音频播放"
- **中译日练习**: 只启用"中文显示"
- **日语发音练习**: 只启用"假名显示"
- **综合练习**: 启用所有选项

## 技术栈

- HTML5
- CSS3
- Vanilla JavaScript
- Web Audio API

## 🚀 部署指南

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/fgozxy/MojiCollect.git
cd MojiCollect

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或者简单启动
npm start
```

### ☁️ Cloudflare Pages 部署（推荐）

#### 🎯 方法一：通过 GitHub 自动部署（最简单）

1. **Fork 本仓库**
   - 访问 https://github.com/fgozxy/MojiCollect
   - 点击右上角 "Fork" 按钮

2. **连接 Cloudflare Pages**
   - 访问 https://dash.cloudflare.com/pages
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 选择你 fork 的仓库
   - 点击 "Begin setup"

3. **配置部署设置**
   ```
   Production branch: main
   Root directory: / (保持默认)
   Build command: npm run build (如果没有构建过程，可以留空)
   Build output directory: / (保持默认)
   ```
   - 点击 "Save and Deploy"

4. **完成！** 🎉
   - 你的网站将部署到：`https://你的仓库名.pages.dev`

#### 🎯 方法二：手动上传文件

1. **下载项目文件**
   ```bash
   git clone https://github.com/fgozxy/MojiCollect.git
   cd MojiCollect
   ```

2. **上传到 Cloudflare Pages**
   - 访问 https://dash.cloudflare.com/pages
   - 点击 "Create a project"
   - 选择 "Upload assets"
   - 拖拽项目文件（排除 `node_modules` 文件夹）
   - 点击 "Deploy site"

#### 🎯 方法三：使用 Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署到 Pages
wrangler pages deploy --project-name=mojicollect

# 或者使用项目脚本
npm run deploy
```

### 🌐 其他部署平台

#### GitHub Pages
1. 进入仓库设置页面
2. 找到 "Pages" 选项
3. 选择 `main` 分支和 `root` 目录
4. 点击 "Save"

#### Netlify
1. 拖拽项目文件夹到 https://app.netlify.com/drop
2. 自动部署完成

#### Vercel
1. 连接 GitHub 仓库
2. 自动检测为静态网站
3. 一键部署

### 📱 移动端适配

项目已完全响应式设计，支持：
- 📱 手机浏览器
- 💻 桌面浏览器
- 📟 平板设备
- 🖥️ 大屏显示器

## 项目结构

```
japanese-card-game/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── app.js          # 主应用逻辑
│   ├── dataManager.js  # 数据管理
│   ├── gameLogic.js    # 游戏逻辑
│   └── audioPlayer.js  # 音频播放
├── assets/
│   └── audio/          # 音频文件目录
└── README.md
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License