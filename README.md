# 医生快捷回复工具

帮医生快速回复患者消息——模板管理 + AI 生成，网页版和小程序功能一致。

## 项目结构

| 目录 | 说明 |
|---|---|
| `3/` | 网页版（React + TypeScript + Vite + Tailwind） |
| `miniapp/` | 微信小程序版（原生 WXML + WXSS + JS） |

## 网页版

```bash
cd 3
npm install
npm run dev        # 开发模式
npm run build      # 生产构建
```

双击 `start-web.bat` 一键启动。

## 小程序版

1. 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目，选择 `miniapp/` 目录
3. AppID 选"测试号"即可预览

## 功能

- **模板管理** — 分类（术后叮嘱/检查通知/用药说明/日常问候）+ 搜索 + 一键复制
- **AI 生成** — 填医生输入 + 患者背景 → DeepSeek 生成 3 种风格回复（需配置 API Key）
- **本地存储** — 数据仅存本地，不上传服务器

## 技术栈

- 网页版：React 18 + TypeScript + Vite + Tailwind CSS + IndexedDB
- 小程序：微信原生框架 + wx.Storage
- API：DeepSeek Chat（可替换为其他 OpenAI 兼容接口）

## 注意事项

- API Key 需自行配置，不会随代码提交
- AI 生成的回复仅供参考，不构成医疗建议

## 授权协议

本项目采用专属使用授权协议，保留全部权利。仅允许个人学习与非商业本地研究。详见 [LICENSE](./LICENSE)。

