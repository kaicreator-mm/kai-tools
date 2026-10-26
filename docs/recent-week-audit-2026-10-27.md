# Recent 7-day source-change intake: 2026-10-20 to 2026-10-27

Issue #10. Scope: **utility functions/classes only** (SCOPE.md / #8); no source-project edits.

## Method and coverage

- Inspected repository list of 49 visible `kaicreator-mm` repositories.
- Looked for actual commits in the 7-day window; inspected main and known active version branches, including `version/v0.1.0` xDownload, `version/v0.2.0` Shun Assistant and ai-rexform, `version/v2` Tally, `version/v0.4` app8/task-meta, `v0.10.2` domain-harness, `version/v4.18` ADS.
- Compared substantive updates from recent pre-window anchors where available; evaluated representative implementation **source** rather than merely titles. Not a line-by-line audit of every repository, every PR or unreconciled feature branch.
- Branches and commit windows can evolve; source references below are fixed at the review.

## Candidates and decisions

| Source | Recently observed changes and concrete code | Decision |
| --- | --- | --- |
| [runx](https://github.com/kaicreator-mm/runx/blob/b9e0c953d9bfd5834315012426fd8e10c21bdd7c/packages/admin/src/transport/deadline.ts), main `b9e0c953d`, blob `0946f669b84bebd92ef143e13c8305d0e5d0fdc4` | A 43-line `withWholeRequestDeadline` utility, actually called by `packages/admin/src/cp-client.ts` and `application-api.ts`. Bounds whole callback even when signal is ignored. | **EXTRACT SMALL FUNCTION**, without HTTP client, admin error classification, default duration or automatic retries. Implement `withDeadline` and typed error in `src/async.ts`. |
| [Shun Assistant](https://github.com/kaicreator-mm/shun-assistant/tree/version/v0.2.0), current in-window branch `f75c1d617` | Windows Broker, native host, file mutation journal; [`apps/control-api/native/artifacts.ts`](https://github.com/kaicreator-mm/shun-assistant/blob/f75c1d617/apps/control-api/native/artifacts.ts) uses `node:crypto` and `node:fs` for SHA-256. | **NO EXTRACT** native broker/journals. Hash of trusted binaries is a caller policy and standard Node primitives already suffice. Previously extracted env selection functions remain independent. |
| [xDownload](https://github.com/kaicreator-mm/xDownload/tree/version/v0.1.0), `33df664ae` | S3/S4 selected media, HLS/HTTPS transport, [`public-uri-candidate.ts`](https://github.com/kaicreator-mm/xDownload/blob/33df664aed2577fd0e5ee7612cfc407c4c89346d/packages/hls-vod-adapter/src/public-uri-candidate.ts) blob `a637b622e2adaff47c901a26952e273557a42623`. | **KEEP DOMAIN** strict `.m3u8/.ts` syntax profile. It is explicitly *not* network authorization. No HTTP/SSRF module. |
| [domain-harness](https://github.com/kaicreator-mm/domain-harness/tree/v0.10.2), `cee14399d` | SDK BUILD, contracts, Node/SQLite and documentation, with ABI-specific digests. | **USE EXISTING SDK**; no runtime extraction, and preserve existing digest bytes. |
| [task-meta](https://github.com/kaicreator-mm/task-meta/tree/version/v0.4), `8686618f2` | DAG/evidence changes; [`src/canonical.ts`](https://github.com/kaicreator-mm/task-meta/blob/8686618f2ab383910859846603f48617c5840585/src/canonical.ts) blob `3b7af1653d458ef675f769beac9040622c179c71` uses a strict JCS-like canonical encoding. | **DEFER** generalized serialization until independently chosen standard and golden vectors; no silent hash migration. |
| [devkit](https://github.com/kaicreator-mm/devkit), main `eff3a2174` | `tools/deps-ensure.sh` cache/build orchestration, `task-check.sh` and ZCode environment stripping. | **KEEP IN DEVKIT**. Env allowlist equivalent already exists in kai-tools; shell orchestration is not a function library. |
| [Tally](https://github.com/kaicreator-mm/tally/tree/version/v2) `3c670d335` | v2 contracts, Host SQLite CAS experiments, docs and SQL. | **KEEP DOMAIN**; no utility with matching stable semantics demonstrated. |
| [app8](https://github.com/kaicreator-mm/app8/tree/version/v0.4) `1dff53ea2` | Capability candidate assembler and evidence/freeze witnesses. | **KEEP DOMAIN**; no process/authority code imported. |
| [ai-rexform](https://github.com/kaicreator-mm/ai-rexform/tree/version/v0.2.0) | Tablet ROM Lab architecture and Product documents rather than generalized implementation helpers. | **NO EXTRACT**. |
| [ADS](https://github.com/kaicreator-mm/ai-development-standard/tree/version/v4.18), [hidden-validation](https://github.com/kaicreator-mm/hidden-validation) | Standard, test and validation changes. | **KEEP IN OWNERS**. Do not move hidden probes, agents or governance systems into utils. |

## Maintained primitives and safety boundary

Node's `AbortSignal.timeout()` is adequate when the callee cooperates with its signal. When an arbitrary async callback ignores AbortSignal, an application may need `Promise.race` against a timer merely to bound the returned outcome. `withDeadline` wraps this narrow behavior with a typed error and always clears the timer. It **never** guarantees the underlying work was stopped: external side effects may have executed or may continue. Do not automatically retry after a deadline.

No HTTP client, scheduler, policy engine or other functional module was extracted. No other package, dependency or source-product change. For the chosen helper, retain focused tests instead of full infrastructure smoke suites.

## Version closure

The extraction may be merged into **kai-tools `version/v0.1.0` only** after CI and review; final version qualification to `main` remains separate. No other product may be held for adoption of this helper.
