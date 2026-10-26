# kai-tools

**A small utility-function and utility-class library. Not a framework or a collection of functional subsystems.**

Only independently reusable helpers and their necessary types belong here. No IPC services, HTTP clients, authorization engines, workflow runtimes or business modules.

The v0.1 private library is `@kai-tools/utils`:

- `selectChildEnvironment(source, allowKeys, options)`: explicit environment selection, without launching any process.
- `windowsPinnedNodeChildEnv(source?)`: Windows Node/PowerShell key preset. **Not** a security sandbox or process authorization.

```ts
import { selectChildEnvironment } from '@kai-tools/utils';
const env = selectChildEnvironment(process.env, ['HOME', 'LANG']);
```

Node 24 verification:

```sh
npm install
npm run verify
```

See [scope](docs/SCOPE.md), [source intake](docs/INTAKE.md), and [organization reuse audit](docs/organization-reuse-audit.md).

The original experimental WinIPC native bridge was **removed from kai-tools** because it is a transport subsystem, not a small utility. xDownload still owns the original implementation; Git history retains the previous experiment. No source-product migration, new dependencies, or public npm publication.
