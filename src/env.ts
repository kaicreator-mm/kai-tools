/**
 * Small, independently usable environment helper functions.
 * Ported from shun-assistant executor-windows/src/safe-env.ts (source pinned).
 *
 * Explicit env selection is not an OS sandbox. Values may still be attacker
 * controlled. The caller must use an absolute trusted binary path, no shell,
 * and must explicitly decide which inheritable environment keys are safe.
 */
export function selectChildEnvironment(
  source: Readonly<Record<string, string | undefined>>,
  allowKeys: readonly string[],
  options: Readonly<{ caseInsensitive?: boolean; denyPrefixes?: readonly string[] }> = {},
): Record<string, string> {
  const canonical = (s: string) => options.caseInsensitive === true ? s.toLowerCase() : s;
  const allow = new Set(allowKeys.map(canonical));
  const deny = (options.denyPrefixes ?? []).map(canonical);
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined || !allow.has(canonical(key))) continue;
    if (deny.some(prefix => canonical(key).startsWith(prefix))) continue;
    result[key] = value;
  }
  return result;
}

/** Original Shun v0.2 Windows PowerShell/pinned Node process initialization keys. */
const WINDOWS_PINNED_NODE_ENV_ALLOWLIST: readonly string[] = [
  // Windows CRT / .NET initialization (PowerShell fails to start without
  // SystemRoot on some hosts) and path basics.
  'SystemRoot',
  'windir',
  'SystemDrive',
  'ComSpec',
  'PATHEXT',
  'PATH',
  'Path',
  // Temp + per-machine/per-user data roots PowerShell and .NET consult at
  // initialization (their ABSENCE has been observed to stall PowerShell
  // startup on CI runners; their VALUES are inert OS configuration for the
  // child — no name on this list is a code-loading directive for the pinned
  // node interpreter).
  'TEMP',
  'TMP',
  'APPDATA',
  'LOCALAPPDATA',
  'ALLUSERSPROFILE',
  'PROGRAMDATA',
  'PROGRAMFILES',
  'ProgramFiles(x86)',
  'ProgramW6432',
  'COMMONPROGRAMFILES',
  'CommonProgramFiles(x86)',
  'DriverData',
  // Inert OS facts some runtimes consult at init.
  'OS',
  'NUMBER_OF_PROCESSORS',
  'PROCESSOR_ARCHITECTURE',
  'PROCESSOR_ARCHITEW6432',
  'PROCESSOR_IDENTIFIER',
  'PROCESSOR_LEVEL',
  'PROCESSOR_REVISION',
  // Identity/home basics (never interpreted as code by the child).
  'COMPUTERNAME',
  'USERDOMAIN',
  'USERNAME',
  'USERPROFILE',
  'HOMEDRIVE',
  'HOMEPATH',
  'SESSIONNAME',
];

/**
 * Project the Shun-proven, Windows-specific allowlist for a pinned Node/PS
 * child. Denies NODE_* even if a future allowlist edit adds it; never carries
 * PSModulePath. The original PATH, ComSpec, TEMP etc are still untrusted
 * VALUE inputs: the caller MUST pin its executable/relay and not resolve an
 * executable by PATH or load plugins from env-controlled directories.
 *
 * Not a substitute for UAC approval, token attestation, signature/pin
 * verification, PowerShell relay re-scrubbing or validation inside the
 * privileged boundary. Intended for *controlled* process launches only.
 */
export function windowsPinnedNodeChildEnv(
  source: Readonly<Record<string, string | undefined>> = process.env,
): Record<string, string> {
  const env = selectChildEnvironment(source, WINDOWS_PINNED_NODE_ENV_ALLOWLIST, {
    caseInsensitive: true,
    denyPrefixes: ['NODE'],
  });
  // Windows names are case-insensitive; Node on Windows can receive multiple
  // spellings. Preserve source precedence: Path over PATH.
  const pathKeys = Object.keys(env).filter((key) => key.toLowerCase() === 'path');
  if (pathKeys.length > 0) {
    const selected = env.Path ?? env.PATH ?? env[pathKeys[0]!];
    for (const key of pathKeys) delete env[key];
    if (selected !== undefined) env.Path = selected;
  }
  return env;
}
