# Temlore

Temlore 是写给未来自己的信件手机网页 App。当前版本用于本机验收，采用纯白页面、浅蓝火漆 `#B2EEFF`、蓝色钟表 `#98C6FF` 和 `#E8E1D5` 书桌。

## 运行

```bash
export PATH=/Users/a1234/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/a1234/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH
pnpm install
pnpm dev
```

本地页面默认在 `http://localhost:4173`。完整验收步骤见 [`docs/acceptance/temlore-local-checklist.md`](docs/acceptance/temlore-local-checklist.md)。

## 验证

```bash
pnpm test
pnpm exec playwright test
pnpm build
```
