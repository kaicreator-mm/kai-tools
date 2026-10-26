# @kai-tools/windows-child-env (experimental)

Small, dependency-free helpers for constructing an **explicit** child-process environment. Ported from Shun Assistant's reviewed Windows launcher environment selector, but **Shun Assistant is unchanged and does not depend on this library**.

```ts
import { windowsPinnedNodeChildEnv, selectChildEnvironment } from '@kai-tools/windows-child-env';
import { spawn } from 'node:child_process';

// An explicit trusted absolute binary; NO shell. The host is responsible for
// all executable pinning and approval, before any elevated execution.
const env = windowsPinnedNodeChildEnv();
const child = spawn(process.execPath, ['child.mjs'], { env, shell: false });
```

API: `selectChildEnvironment(source, allowKeys, {caseInsensitive?,denyPrefixes?})` projects keys only; `windowsPinnedNodeChildEnv(source?)` preserves the original Shun-approved *key list* and structurally removes `NODE*` / `PSModulePath` (latter not on allowlist), normalizing `Path` case. No spawned process in either helper. All values come from potentially **untrusted** parent input.

**Not a security boundary by itself**: `PATH`, `ComSpec`, `TEMP` and several other allowed values may be controlled by an attacker. Never execute through PATH search, `shell:true`, untrusted PowerShell scripts, unpinned runtimes or env-directed DLL/plugin loading. An elevated Windows path must still use OS trust, explicit executable paths, pinned payloads, relay re-scrubbing and helper-side verification. This library makes **no UAC**, sandbox or privilege guarantee. On non-Windows systems the pure selector can be tested but the preset's key policy is not intended as a general POSIX policy.

**Source lineage**: `kaicreator-mm/shun-assistant` `version/v0.2.0@a0a57db8ab7a9345787e444fdce37663feaf7a78`, `packages/executor-windows/src/safe-env.ts` blob `f3ef1929973d6b2639ebd1c7091ebcd909e094b9`. Original allowlist copied, selector factored into a generic function, exported preset renamed. Source under same GitHub owner; `UNLICENSED` and private while licensing/public-release is undecided. Node's built-in `child_process.spawn({ env })` is the actual launch mechanism; this component only builds an env object.

**No source project migration.** Cross-project adoption, publishing, and security qualification are separate decisions.
