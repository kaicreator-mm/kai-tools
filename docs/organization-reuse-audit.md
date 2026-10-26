# Organization-wide reusable-code census (2026-10-27)

Status: `EVIDENCE_REVIEWED`, **no newly approved package** from this census. Work item [#6](https://github.com/kaicreator-mm/kai-tools/issues/6).

Scope is a **breadth-first code inventory**, not a claim that every file in 49 repositories was deeply audited. On 2026-10-27 the GitHub connection listed **49 visible repositories** including transient Tally HV mirror repositories, experimental scaffolds, and some README-only repositories. Main-branch recursive trees of the substantial repositories were screened; specific source files below were read directly. For active projects, current version branch refs were checked rather than treating possibly stale `main` as their latest source. All upstream projects remain **unchanged**.

## Existing public-reuse routes (prefer them)

| Capability | Existing owner / route | Consequence for kai-tools |
| --- | --- | --- |
| Agent package, tool calls, host/runtime and protocol integration | [domain-harness](https://github.com/kaicreator-mm/domain-harness/tree/v0.10.2) `v0.10.2@cee14399d9d0af4e20e34b9111861b16a465b690` | **USE EXISTING SDK**, do not create another plugin, microkernel, or orchestration API |
| Model execution, policies and workflow decisions | [ai-runtime](https://github.com/kaicreator-mm/ai-runtime) | **USE EXISTING SERVICE** rather than migrate AI policies |
| Task trace, telemetry and model-cost evidence | [task-meta](https://github.com/kaicreator-mm/task-meta/tree/version/v0.4) `version/v0.4@8686618f2ab383910859846603f48617c5840585` | **USE EXISTING PROJECT**, do not create a competing trace/ledger library |
| Organization dev worktrees and host tooling | [devkit](https://github.com/kaicreator-mm/devkit) `main@eff3a21740da966a600f34e8ec81f7c03ef64f71`, `tools/task-new.sh` blob `10e9cb41ed83fe623c43ee459655f4660184fa5d` | Keep orchestration scripts at devkit; **do not move into runtime library** |
| Verification and adversarial hidden probes | [hidden-validation](https://github.com/kaicreator-mm/hidden-validation) `main@2c52182a7a4d05a930d5dcadeb04da20d8259f3f` | Keep hidden fixtures outside consumable runtime; do not leak oracle internals |
| Existing `@kai-tools/win-ipc` and `@kai-tools/windows-child-env` | [kai-tools version/v0.1.0](https://github.com/kaicreator-mm/kai-tools/tree/version/v0.1.0) | Remain **private/experimental**, not evidence of adoption by a second product |

## Candidate decisions ranked by *reuse value and compatibility risk*

### 1. JSON canonicalization and content hashing — HIGH reuse, **NO AUTOMATIC EXTRACTION**

Real duplicated implementations have **different byte contracts**:

- [task-meta `src/canonical.ts`](https://github.com/kaicreator-mm/task-meta/blob/8686618f2ab383910859846603f48617c5840585/src/canonical.ts) (blob `3b7af1653d458ef675f769beac9040622c179c71`) advertises RFC 8785/JCS, rejects unsupported JSON values and unsafe integers, hashes UTF-8.
- [xDownload `packages/version-validation/src/canonical-json.ts`](https://github.com/kaicreator-mm/xDownload/blob/33df664aed2577fd0e5ee7612cfc407c4c89346d/packages/version-validation/src/canonical-json.ts) (blob `e5c2e243fd431d70907540eca7779d338b6ee6c2`) maps unsupported values to `null` and drops undefined object members. Its existing test-harness digests are not an RFC 8785 migration authority.
- [domain-harness `packages/contracts/src/digest.ts`](https://github.com/kaicreator-mm/domain-harness/blob/cee14399d9d0af4e20e34b9111861b16a465b690/packages/contracts/src/digest.ts) (blob `5b5cb1f3c529d6370cc05ebab606ece6c055adcf`) binds composition identities to its BUILD ABI and rejects non-plain/nonfinite values.
- [Cairn `packages/hashchain/src/canonical-v1.ts`](https://github.com/kaicreator-mm/cairn/blob/d9a7c4065d0e680b2322c6b78395d499cd6cfb3d/packages/hashchain/src/canonical-v1.ts) (blob `50ebef5ba03ac4b64bb6e96a3b494e17e5d2e2bd`) owns CEC v1 encoding; do not substitute JCS for domain identity.
- [Formula `src/core/hash.ts`](https://github.com/kaicreator-mm/formula/blob/e559c1dbb9440d556d55783c0bf9915cc9bcdc53/src/core/hash.ts) (blob `55cc461e3b0c46808bae9eab684798f33691dd6c`) and [YISHU `packages/core/src/fingerprint.ts`](https://github.com/kaicreator-mm/yishu/blob/caf1cbe0b7658435dcbd0fa67fa98655c5010852/packages/core/src/fingerprint.ts) (blob `5b536d18f9fa6188ecb1466747d5d18cdeed32c9`) provide lightweight stable JSON, with **different hash algorithms** (SHA-256 vs FNV-1a).
- [audio-platform Python canonical data](https://github.com/kaicreator-mm/audio-platform/blob/56ba4fd888f85ac3a035575759b12f8e4a61634b/packages/media-core/src/media_core/canonical_data.py) (blob `9749cd512fc7f9728808497355413e0fbcaebfa5`) is **Python-specific** and disallows otherwise serializable types by policy.

**Decision:** `DEFER`. A consumer needing standard RFC 8785 should consider a maintained JCS implementation **before** custom development, but existing signatures/hashes are immutable historical facts. If two new consumers genuinely choose exactly the same standard, expose an explicitly named, versioned standard API (e.g. `jcsRfc8785`) with external conformance vectors, byte-level parity, serialization negatives, and **no retroactive hash migration**. Do **not** create a single catch-all `canonicalJson` API for this fleet.

### 2. Network CIDR and SSRF-sensitive destination policy — HIGH potential, **DEPENDENCY FIRST / DEFER**

- [runx `packages/network/src/cidr.ts`](https://github.com/kaicreator-mm/runx/blob/b9e0c953d9bfd5834315012426fd8e10c21bdd7c/packages/network/src/cidr.ts) blob `559eaf7652d39ac145282f98014c78efdc582e97`: IPv4 CIDR matcher / IPv6 literal canonicalization, purpose-specific server/network policy.
- [runx destination classifier](https://github.com/kaicreator-mm/runx/blob/b9e0c953d9bfd5834315012426fd8e10c21bdd7c/packages/network/src/classifier.ts) blob `8e2659f888ccce4b68e84ebea19ce5ac726cd39b`: endpoint and metadata classification + host-pattern rules.
- [xDownload `public-ipv4-text-candidate.ts`](https://github.com/kaicreator-mm/xDownload/blob/33df664aed2577fd0e5ee7612cfc407c4c89346d/packages/hls-vod-adapter/src/public-ipv4-text-candidate.ts) blob `ef9bdf6ef656f1e00ab20ada008d0daa41571936`: deliberately narrower, IPv4-only, special-use-excluding *candidate*, not permission to connect.

**Decision:** `REUSE_DEPENDENCY` first. `ipaddr.js` supplies mature IPv4/IPv6 parsing, CIDR matching and range classification (https://www.npmjs.com/package/ipaddr.js); retain product-specific *allow/deny authority*. Note: parser permissiveness differs, e.g. leading-zero forms that xDownload deliberately refuses. Parsing a public-looking address is **not** SSRF control: DNS-to-connected-peer proof, proxy behavior, redirects, TLS SNI and origin authorization remain with the actual HTTP transport. No automatic xDownload/runx rewrite.

### 3. Log redaction and outbound data minimization — HIGH potential, **USE EXISTING / DEFER**

- [runx `admin/.../redaction.ts`](https://github.com/kaicreator-mm/runx/blob/b9e0c953d9bfd5834315012426fd8e10c21bdd7c/packages/admin/src/ui/observations/redaction.ts), blob `f229ea3720db1c640d38dd7ed46dd0460753c096`: structured secret/path projection.
- [runx `control-plane/.../sanitize.ts`](https://github.com/kaicreator-mm/runx/blob/b9e0c953d9bfd5834315012426fd8e10c21bdd7c/packages/control-plane/src/build-adapter/sanitize.ts), blob `40043cb5f8a5e0bed92fb9d41ae133896e94057f`: explicit known secret values plus runx contract sanitizer.
- [Tally `internal/logpipe/redact.go`](https://github.com/kaicreator-mm/tally/blob/3c670d3358cd192980979b56f8329cc55e1ab8cd/internal/logpipe/redact.go), blob `34b974be57c66626392dd16751e7b3aaf45a1b3d`: coarse/fine regex and fail-closed disclosure boundary **in Go**.
- [Shun `vertical-support/src/minimize.ts`](https://github.com/kaicreator-mm/shun-assistant/blob/a0a57db8ab7a9345787e444fdce37663feaf7a78/packages/vertical-support/src/minimize.ts), blob `8a270f8f47bf533d67d37493976b610548f53e16`: fixed support schema and local-only restrictions; **not generic text redaction**.

**Decision:** for TS/JS logs prefer logger-native Pino structured redaction (https://github.com/pinojs/pino/blob/main/docs/redaction.md) or `@pinojs/redact` (https://github.com/pinojs/redact); keep known-token value replacement and no-outbound policy in the respective product. Regex patterns are imperfect, and copying them does not guarantee zero secret leakage. Cross-language Go + TS sharing would need a policy/schema agreement, not source transplant. Don't extract a universal `secureRedact` now.

### 4. Filesystem path guards, owned scratch trees, installer operations — MEDIUM/HIGH, **DEFER**

- [Shun `executor-windows/src/fs-safety.ts`](https://github.com/kaicreator-mm/shun-assistant/blob/a0a57db8ab7a9345787e444fdce37663feaf7a78/packages/executor-windows/src/fs-safety.ts), blob `39bf8a2b7de39a4f1eed5b0621d4161c82074177`: realpath and reparse checks with Shun grant scope and helper-side rechecks; not a universal TOCTOU guarantee.
- [Shun `vertical-image/src/owned-dir.ts`](https://github.com/kaicreator-mm/shun-assistant/blob/a0a57db8ab7a9345787e444fdce37663feaf7a78/packages/vertical-image/src/owned-dir.ts), blob `b7e42062494a43a50c5c9f025eb1254877a479c6`: nonce-marked scratch cleanup.
- [Formula installer `installer-lib/fsutils.mjs`](https://github.com/kaicreator-mm/formula/blob/e559c1dbb9440d556d55783c0bf9915cc9bcdc53/installer/installer-lib/fsutils.mjs), blob `31b542da75701d6a799d5a7e787ae296420b9880`: payload copying, junction fidelity, *manifest-owned* removal; a different authority model.
- [runx](https://github.com/kaicreator-mm/runx) has tenant/lease-scoped file and OCI operations; its identity/ownership boundary is not interchangeable with desktop installer deletion.

**Decision:** `DEFER` until a second consumer requires a specific **read-only** path inspection or owned-temporary-workspace API. Use Node `fs.mkdtemp`, `fs.realpath`, `lstat` and explicit trusted roots wherever sufficient. An abstraction named `safeDelete` would be unsafe without an independently verified ownership protocol and race model. No migration in the Shun or Formula release path.

### 5. Windows IPC / child spawn — EXISTING EXPERIMENTAL, **PROVE ADOPTION**

- `@kai-tools/win-ipc` came from xDownload's Win32 Native Bridge: supported only on verified Win32 host builds; no OS-attested same-logon claim on other platforms, release review pending.
- `@kai-tools/windows-child-env` came from Shun's `safe-env.ts`: explicit key filtering, **not** a security sandbox. PATH, TEMP, ComSpec values remain parent-controlled; elevated callers must pin and reverify.
- Formula desktop's Electron `credentialsIpc.ts` is not evidence of a Windows named-pipe host; most cross-project IPC uses existing Electron/Node/native transports as appropriate.

**Decision:** `PREFER_EXISTING_KAI_TOOLS_EXPERIMENTAL_WHEN_FIT`, but **do not force Shun, xDownload or Formula to migrate**. Identify a real second consumer and compare its actual native Windows threat model before declaring a published reusable package.

### 6. Domain-specific work that should remain with current owners — KEEP

| Repository or family | Why not transplant |
| --- | --- |
| [Cairn](https://github.com/kaicreator-mm/cairn) `hashchain` CEC v1, [domain-simulator](https://github.com/kaicreator-mm/domain-simulator) seeded environment/digest | Stable domain identity and semantic contracts, not generic utility strings |
| [domain-forge](https://github.com/kaicreator-mm/domain-forge), [domain-ux](https://github.com/kaicreator-mm/domain-ux), [domain-ai-creator](https://github.com/kaicreator-mm/domain-ai-creator) | Already form domain-harness ecosystem; borrow contracts through SDK rather than copy guards |
| [app8](https://github.com/kaicreator-mm/app8), [ai-rexform](https://github.com/kaicreator-mm/ai-rexform), [dx-service](https://github.com/kaicreator-mm/dx-service) | Product/knowledge/authority rules and ongoing versions; app8 intake was independently closed [#3](https://github.com/kaicreator-mm/kai-tools/issues/3) with NO_EXTRACT_YET |
| [Formula](https://github.com/kaicreator-mm/formula), [YISHU](https://github.com/kaicreator-mm/yishu), [forge-saas](https://github.com/kaicreator-mm/forge-saas) | Media/content/translation revision identities, client runtime/auth and tenant rules are business semantics |
| [parts-system](https://github.com/kaicreator-mm/parts-system), [city-atlas](https://github.com/kaicreator-mm/city-atlas), [triphub](https://github.com/kaicreator-mm/triphub), [xlearn](https://github.com/kaicreator-mm/xlearn), [xcrossify](https://github.com/kaicreator-mm/xcrossify) | Offline projections, location/regional and learning workflows, their canonical state, business parsers and client adapters have no stable shared API demonstrated |
| [audio-platform](https://github.com/kaicreator-mm/audio-platform), [restudio](https://github.com/kaicreator-mm/restudio), [citechain](https://github.com/kaicreator-mm/citechain) | Different Python/Rust/TS media and citation contract boundaries; use native libraries, not an unrelated common JS runtime |

## Adoption decision for future agents (ADS v4.18 / #1241 Web-first)

1. First use built-in Node/Python/Rust capabilities and maintained packages. A duplicated function is **not** evidence that a new library is worth publishing.
2. Confirm a **named current consumer** and the exact method/signature, supported OS/Node versions, security authority and tests it needs. Source consumer remains unchanged unless a later task explicitly authorizes migration.
3. If the consumer's semantics are identical, choose `ADOPT_EXISTING_SDK` → `REUSE_DEPENDENCY` → `EXTRACT_SMALL_PACKAGE` in that order. Otherwise record `KEEP_DOMAIN` / `DEFER`.
4. If extracting, keep one independent optional package, exact source Git SHA/blob, narrow public exports, real focused tests, relevant host proof and known noncritical limitations. Never imply that an extracted but unadopted package is a second consumer.
5. For hashing, signatures, policy decisions, authorization, hidden evidence or persistent state, **golden byte-level compatibility is a hard boundary**; no catch-all silent replacement. For DNS/IP and redaction, parser or regex unit tests cannot prove runtime safety.
6. Independent package extraction is **never** a release gate for xDownload, Shun, Tally, runx, app8 or other upstream products. Keep compatibility/migration as a separately approved consumer change.

**Current result:** no extra package authorized from org-wide screening alone. High-value lead is *named protocol-specific canonicalization*, followed by *address parsing with established dependency* and *log-redaction adapters*. Revisit only when a concrete consumer demands the same semantics and can supply conformance tests.
