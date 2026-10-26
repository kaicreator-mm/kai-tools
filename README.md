# kai-tools

Small, optional, independent packages used across kaicreator-mm repositories. Development follows ADS v4.18 and the Web-first approach; this repository does **not** change frozen xDownload v0.1 gates or require migration.

## Workspace

- [win-ipc](packages/win-ipc/README.md): **experimental** Windows-only native pipe/OS-token building blocks and same-user/logon-session admission. First implementation is source-portable and has a strict fail-closed contract; package is **not release-qualified** until Windows validation/review.

The high-level xDownload Core Seam frame protocol and HLS transport have **not** been copied. Restricted HTTP and address policies are deferred pending distinct consumers and an alternatives comparison.

```sh
npm install
npm test
npm run typecheck
# On Windows + Node 24 only: real token/DACL/pipe smoke
npm run probe:windows
```

No public npm publishing is configured. Original xDownload remains its own authority and version. See [intake #1](https://github.com/kaicreator-mm/kai-tools/issues/1), [source #101](https://github.com/kaicreator-mm/xDownload/issues/101), [ADS feedback #1337](https://github.com/kaicreator-mm/ai-development-standard/issues/1337).
