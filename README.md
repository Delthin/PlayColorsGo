# Play Colors Go!

[![GitHub](https://img.shields.io/badge/GitHub-Repository-brightgreen.svg?logo=github)](https://github.com/Delthin/PlayColorsGo)
[![GitHub stars](https://img.shields.io/github/stars/Delthin/PlayColorsGo.svg?style=social)](https://github.com/Delthin/PlayColorsGo)
[![GitHub license](https://img.shields.io/github/license/Delthin/PlayColorsGo.svg)](https://github.com/Delthin/PlayColorsGo/blob/main/LICENSE)

南京大学软件学院2024Fall人机交互课程大作业

一个现代化的色彩搭配和管理工具，帮助设计师和开发者更好地管理和使用颜色。

## 功能特点

- 🎨 色彩搭配生成
- 📸 从图片提取颜色
- 💾 保存喜欢的配色方案
- 🗂️ 颜色收藏夹管理
- 🔍 配色方案搜索
- 👁️ 可视化预览效果

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装

```bash
# 克隆项目
git clone [https://github.com/Delthin/PlayColorsGo]

# 进入项目目录
cd PlayColorsGo

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```
项目将在 http://localhost:3000 启动

需要后端支持，后端项目地址：[PlayColorsGo-Backend](https://git.nju.edu.cn/Qxm/hci-backend/ "PlayColorsGo-Backend")

### 构建
```
npm run build
```
## 技术栈
- Vue 3
- TypeScript
- Vite
- Element Plus
- Axios

## 详细项目结构

```
src/
├── api/                    # API 接口
│   ├── _prefix.ts         # API 前缀配置
│   ├── collections.ts     # 收藏夹相关接口
│   ├── palette.ts         # 调色板相关接口
│   ├── types.ts          # 接口类型定义
│   └── user.ts           # 用户相关接口
│
├── components/            # 通用组件
│   ├── auth/             # 认证相关组件
│   │   ├── LoginModal.vue       # 登录弹窗
│   │   ├── SignUpModal.vue      # 注册弹窗
│   │   └── UserProfileDropDown.vue  # 用户信息下拉菜单
│   │
│   ├── collection/       # 收藏夹相关组件
│   │   ├── CollectionSelector.vue  # 收藏夹选择器
│   │   └── SavePaletteModal.vue    # 保存调色板弹窗
│   │
│   ├── color/           # 颜色相关组件
│   │   ├── ColorLibrary.vue     # 颜色库组件
│   │   ├── ColorPalette.vue     # 调色板组件
│   │   ├── ColorPicker.vue      # 颜色选择器
│   │   └── PaletteList.vue      # 调色板列表
│   │
│   ├── common/          # 通用组件
│   │   ├── DeleteConfirmModal.vue  # 删除确认弹窗
│   │   ├── NotificationToast.vue   # 通知提示
│   │   └── SearchBox.vue           # 搜索框
│   │
│   ├── layout/          # 布局组件
│   │   ├── Navbar.vue            # 导航栏
│   │   └── PageHeader.vue        # 页面标题
│   │
│   └── visualizer/      # 可视化组件
│       └── Illustration.vue      # SVG插画预览
│
├── composables/          # 组合式函数
│   └── usePalettes.ts   # 调色板相关逻辑
│
├── router/              # 路由配置
│   └── index.ts         # 主路由配置
│
├── styles/              # 样式文件
│   └── style.css       # 全局样式
│
├── types/               # TypeScript类型定义
│   └── shim-vue.d.ts   # Vue组件类型声明
│
├── utils/               # 工具函数
│   └── request.ts      # Axios请求封装
│
├── views/               # 页面视图
│   ├── account.vue     # 账户页面
│   ├── colors.vue      # 颜色浏览页面
│   ├── favorites.vue   # 收藏夹页面
│   ├── image-picker.vue # 图片取色页面
│   └── preview.vue     # 预览页面
│
├── App.vue             # 根组件
├── main.ts            # 入口文件
└── vite-env.d.ts     # Vite 环境声明
```

### 主要组件说明

#### 颜色处理组件
- `ColorPicker`: 高级颜色选择器,支持多色调整、排序和随机生成
- `ColorPalette`: 颜色展示组件,支持复制、收藏等操作
- `ColorLibrary`: 颜色库管理组件,包含收藏和浏览功能
- `PaletteList`: 调色板列表展示组件

#### 图片取色功能
- `ImagePicker`: 支持上传图片并提取主要颜色
- 支持颜色点拖拽调整
- 实时预览和放大镜功能

#### 收藏夹管理
- `CollectionSelector`: 收藏夹选择和创建
- `SavePaletteModal`: 调色板保存对话框
- 支持多个收藏夹
- 支持标签管理和搜索

#### 可视化预览
- `Illustration`: SVG插画预览组件
- 支持多种预设模板
- 支持实时颜色调整
- 支持全屏预览

#### 布局组件
- `Navbar`: 响应式导航栏
- `PageHeader`: 页面标题组件
- 集成用户认证和搜索功能

#### 通用组件
- `NotificationToast`: 全局通知提示
- `SearchBox`: 搜索输入框
- `DeleteConfirmModal`: 删除确认对话框

### 技术特点
- 基于 Composition API 构建
- TypeScript 类型支持
- 响应式设计
- 模块化架构
- 组件复用性高

## 主要功能说明

### 1. 颜色探索
- **在线调色板**
  - 支持多颜色同时调整
  - 颜色属性(色相、饱和度、亮度)精确控制
  - 拖拽排序功能
  - 一键随机生成配色

- **快捷操作**
  - 颜色值实时预览
  - 一键复制色值
  - 撤销/重做支持
  - 快捷键支持

### 2. 颜色预览
- **可视化展示**
  - SVG模板预览
  - 支持多种预设模板
  - 实时颜色调整
  - 全屏预览模式

- **交互功能**
  - 拖拽重排颜色
  - 快速切换预设模板
  - 属性批量调整
  - 一键导出配色方案

### 3. 图像取色
- **智能取色**
  - 支持图片拖放上传
  - 动态调整取色点数量(1-10个)
  - 放大镜精确取色
  - 实时颜色预览

- **颜色管理**
  - 取色点自由拖拽
  - 一键随机重排
  - 颜色批量复制
  - 快速保存至收藏

### 4. 收藏管理
- **个性化组织**
  - 创建多个收藏夹
  - 灵活的分类管理
  - 标签系统支持
  - 搜索和过滤功能

- **便捷操作**
  - 快速保存配色
  - 一键复制色值
  - 预览已保存配色
  - 批量管理功能

### 交互特色
- 所有操作都有即时视觉反馈
- 统一的错误提示和处理机制
- 响应式设计适配多端
- 直观的拖拽交互
- 流畅的动画过渡效果

## License
MIT