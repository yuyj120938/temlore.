# Temlore 本机验收清单

## 启动

```bash
export PATH=/Users/a1234/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/a1234/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH
pnpm install
pnpm dev
```

打开 `http://localhost:4173`。首次进入应显示约 3 秒启动动画，随后进入纯白背景的 Temlore 首页。

本机演示账号：手机号 `13800138000`，密码 `temlore2026`。正式环境不会使用这个账号。

## 核心手动场景

1. 点击左上角或 `Start writing`，确认进入手机号＋密码登录页面。
2. 注册手机号 `13800138000` 与至少 8 位密码，保存只显示一次的恢复码。
3. 登录后确认自动进入写信编辑器；输入正文，切换宋体/楷体，点击照片最多 9 次，观察拍立得框，并等待显示 `DRAFT SAVED`。
4. 点击完成，使用环形时间轨道选择 `10 秒`，确认不可查看警告，观察折纸、信封、浅蓝火漆和 `#E8E1D5` 书桌抽屉动画。
5. 等待 10 秒后进入时间侧栏，确认信件由“封存中”变为“已到达”。
6. 点击书桌中央抽屉，点击蓝色火漆，确认白纸展开且四周留缝；刷新后该信仍显示为“已开启”并可阅读。
7. 在系统或浏览器中开启减少动态效果，确认页面仍可完成上述操作。

## 自动验证

```bash
pnpm test
pnpm exec playwright test
pnpm build
```
