# v0.1 intake: current scope and source history

**Current rule:** [utility functions/classes only](SCOPE.md), superseding prior WinIPC-first plans (Issue #8).

## xDownload Issue #1, superseded

The prior `@kai-tools/win-ipc` prototype was derived from `xDownload version/v0.1.0@4f4082ca4f43b5138f85b6c373a22c95938ae580`, `packages/core-seam/src/win-ipc.ts` blob `459da3ec6d5753c406a4ab57dca0207fa46395bb`. It required Koffi/native Win32, handle lifetimes, token impersonation and protected named-pipe creation. It is **not** a generic utility function. The prototype is removed; retained in prior kai-tools Git commits for reference only. Original xDownload unchanged. WinIPC-native CI checks no longer belong in kai-tools.

The Restricted HTTP transport is likewise a complete network subsystem and remains in xDownload. A narrow parser/classifier may be considered separately only if useful and semantics are explicit.

## Shun Assistant Issue #4, retained functions

Shun source: `version/v0.2.0@a0a57db8ab7a9345787e444fdce37663feaf7a78`, `packages/executor-windows/src/safe-env.ts` blob `f3ef1929973d6b2639ebd1c7091ebcd909e094b9`.

Retain independent `selectChildEnvironment` and `windowsPinnedNodeChildEnv`, doing no process launch, IPC or privilege operations. Functions consolidated into `src/env.ts`. Inherited values like PATH remain untrusted; source project unchanged.

## Organization Issue #6

The [census](organization-reuse-audit.md) is an evidence register, **not** authorization to extract complete subsystems. Only small tools and helpers qualify.
