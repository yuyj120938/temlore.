# Temlore

Temlore 是写给未来自己的信件手机网页 App。当前版本用于本机验收，采用纯白页面、浅蓝火漆 `#B2EEFF`、蓝色钟表 `#98C6FF` 和 `#E8E1D5` 书桌。

## 运行

```bash
export PATH=/Users/a1234/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/a1234/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH
pnpm install
pnpm dev
```

本地页面默认在 `http://localhost:4173/`。完整验收步骤见 [`docs/acceptance/temlore-local-checklist.md`](docs/acceptance/temlore-local-checklist.md)。

## 部署到 GitHub Pages

项目已包含 `.github/workflows/deploy-pages.yml`。将项目推送到 GitHub 的 `main` 分支后，Actions 会自动构建并发布 `dist`。首次使用时，在仓库的 **Settings → Pages → Build and deployment** 中将发布方式设为 **GitHub Actions**。

如果仓库名是 `temlore`，发布地址通常是 `https://你的用户名.github.io/temlore/`。Vite 会在 Actions 中自动使用正确的仓库路径，本地开发仍使用根路径。

## 验证

```bash
pnpm test
pnpm exec playwright test
pnpm build
```
