# @kai-tools/win-ipc (experimental)

Windows-only Node 24/Win32 building blocks ported from xDownload without its Core Seam protocol. **Not a certified security library yet**. Requires Koffi (load-on-demand). Importing the entrypoint does not load DLLs or start transports. `WindowsIpcBridge.tryLoad()` returns null on unsupported platforms.

Public entrypoint: `WindowsIpcBridge` (raw HANDLE operations), `admitSameLogonPipePeer` (token-backed SID+LUID admission), `WindowsIpcUnsupportedError`, and narrowly typed facts/policies.

Security invariant: the host must create the listening pipe with `buildProtectedSecurityDescriptor`, must accept with `beginPipeAccept`, must derive the client's OS token with `admitSameLogonPipePeer`, and must discard the connection on any failure. On `revertFailed` the **entire process must terminate immediately**, because the executing thread may remain impersonated. The public entrypoint has no fail-stop override. Caller owns HANDLE/async-accept cleanup, session revocation on disconnect and per-message authorization. Client code requires `openNamedPipeClient` to set impersonation QoS. This does **not** offer a drop-in Node `net.Server`, replay protection, app protocol, multi-tenant security, TCP support or cross-session broker.

```ts
import { WindowsIpcBridge, admitSameLogonPipePeer } from '@kai-tools/win-ipc';
const bridge = WindowsIpcBridge.tryLoad();
if (!bridge) throw new Error('Unsupported Windows host');
const self = bridge.selfIdentity();
// After the protected listener is connected and raw handle is owned:
const decision = admitSameLogonPipePeer(bridge, connectedPipeHandle, self);
if (!decision.ok) throw new Error('access denied');
// Host must still bind admission to a live connection and revoke on close.
```

**Compatibility:** Windows x64/arm64 requires actual testing; pinned baseline Node 24.21.0, not a promise for all Node versions. Native resource ownership, unexpected Win32 failures, cross-user/session negatives, concurrency and live client message flow require a Windows host validation. The bridge's libuv fd adoption is Node-version sensitive. Don't install this in an unattended privileged server without additional host review. Tests outside Windows are only pure-policy tests.

**Provenance:** from `kaicreator-mm/xDownload` `version/v0.1.0@4f4082ca4f43b5138f85b6c373a22c95938ae580`, `packages/core-seam/src/win-ipc.ts` blob `459da3ec6d5753c406a4ab57dca0207fa46395bb`. Rebranding changed internal Koffi type names `XDOWNLOAD_*` to `KAITOOLS_*`, process/host commentary and fail-stop prefix; native logic otherwise retained. Same project owner; no upstream package license file exists on this source snapshot. Package explicitly marked `UNLICENSED`/private until rights/review/public release are settled. Koffi itself uses MIT license (transitive dependency retains its notices).

**No xDownload migration** in this PR; adoption by a second product still not proven.
