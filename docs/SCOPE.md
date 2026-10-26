# kai-tools scope: utility functions/classes only

## Include

Small standalone TypeScript utility functions, lightweight helper classes and essential types with concise signatures and clearly documented semantics. Typical examples: string/number conversion, deterministic pure projections, formatting, explicit environment selection, a narrow file-path predicate, or versioned canonical encoding when an actual consumer needs it.

A filename such as `src/env.ts` is merely a **functional grouping**, not a module with its own lifecycle.

## Exclude

**No complete functional modules:** Win32 Named Pipe transport or token/ACL bridge, HTTP/SSRF clients, RPC servers, authorization engines, persistence/journals, schedulers, runtime SDKs, agent tool systems, model pipelines, services, daemon apps, CLI hosts, or product workflows. Small pure predicates may be reused but **never** marketed as a complete OS/network/security boundary.

## Engineering rules

1. Prefer Node builtins and established libraries. Don't write wrappers without actual cross-project use.
2. Preserve source project ownership; no compulsory xDownload, Shun, Tally or other adoption.
3. Keep one small library `@kai-tools/utils`; organize by files, not a package per function.
4. Keep explicit semantics; never silently rewrite historical digest bytes, signatures, or persisted protocols.
5. Fast Path test and review for small helpers; do not impose host-level security matrices on pure functions.
6. No speculative general frameworks or abstract lifecycle.

## Historical scope change (#8)

The previous experimental `@kai-tools/win-ipc` port from xDownload was removed because it is a native IPC **subsystem**, outside the clarified product scope. Source and native proof stay in xDownload. The only retained Shun-origin code is independent **nonexecuting environment projection functions**, consolidated into `src/env.ts`.
