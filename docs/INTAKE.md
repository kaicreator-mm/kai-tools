# v0.1 Product/L2/Task fast-path decision (ADS v4.18; issue #1)

Source fixed: xDownload `version/v0.1.0` commit `4f4082ca4f43b5138f85b6c373a22c95938ae580`. No changes to xDownload.

## Product (value and real demand)

Goal: salvage independently reusable Win32 OS-token IPC primitives without imposing them on a normal download tool. xDownload is one real consumer; Shun Assistant (`executor-windows`) is an **unconfirmed possible** second consumer, not evidence of actual integration. Authoritative status: **EXTRACT_AS_EXPERIMENTAL** only, no publish/release until second consumer and OS proof. Do not create hypothetical universal RPC framework.

## L2 smallest architecture and alternatives

`packages/win-ipc`: lazy `koffi` native Win32 handle/identity bridge + one small pure admission function. The bridge already existed in xDownload, avoiding a fresh FFI project. No `@xdownload/*` import. Node `net` supports named-pipe streams but does not by itself expose an actual impersonated connecting client token / explicit DACL creation. Existing well-supported Koffi is preferable to authoring a new native addon. A future consumer could wrap it; this package deliberately avoids the source's Node-internal `process.binding('pipe_wrap')` transport.

`@kai-tools/restricted-http`: **DEFER**. The existing S3 reader bakes in `/media/*`, direct video mime, no signed query, no CDN path, no IPv6/proxy, and special DNS behavior. Standard Node/Undici HTTPS first; only extract a pinned transport if a separate unattended SSRF-sensitive consumer demonstrates a gap. Leave existing source in xDownload.

`@kai-tools/net-address-policy`: **DEFER** unless at least two consumers agree on address classification semantics; avoid extracting the existing IPv4-only CIDR list into a universal security promise.

Not candidates: HLS parsing/media admission, Core Journals/replay, download workflow, browser confirmations.

## Minimal Task DAG (issue #1; no subissue explosion)

- [x] Audit exact source, alternative library and cross-project candidates
- [x] Bootstrap minimal monorepo and isolate win-ipc native OS bridge
- [x] Add fail-closed same-user+LUID pure policy/tests
- [ ] Windows native host probe (GitHub Actions + optional independent local host)
- [ ] Exact-SHA independent review / hard P0,P1 check
- [ ] Confirm a second independent consumer; then productize/qualify package

Native probe ≠ full security proof. Unit mocks ≠ real OS proof. Unverified steps remain NOT_RUN until evidence exists. No xDownload v0.1 release gate, migration issue, or project workflow is modified. Noncritical limitations remain documented rather than endlessly patched.
