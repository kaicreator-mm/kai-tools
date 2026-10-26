import type { WindowsClientTokenFacts, WindowsPeerVerification, WindowsSelfIdentity } from './win-ipc.ts';

/** A Win32 bridge capability; PID, wire IDs and caller claims never suffice for admission. */
export interface PipePeerProbe {
  verifyPipeClient(pipeHandle: bigint): WindowsPeerVerification;
}
export type PipeAdmission =
  | { readonly ok: true; readonly facts: WindowsClientTokenFacts }
  | { readonly ok: false; readonly reason: 'TOKEN_UNVERIFIED' | 'DIFFERENT_USER' | 'DIFFERENT_LOGON_SESSION' };

function fatalRevertFailure(reason: string): never {
  process.stderr.write('kai-tools win-ipc FATAL: RevertToSelf unverified: ' + reason + '\n');
  process.exit(70);
}

/**
 * Verify a connected HANDLE using an impersonated OS token, then gate *both*
 * current-user SID and authentication LUID. A failed RevertToSelf is PROCESS
 * fatal, not a normal access denial; caller-supplied fatal handler exists ONLY
 * for embedding in a host's terminal shutdown policy or test. It MUST never return.
 *
 * The caller owns the HANDLE and must revoke its session on disconnect, refuse
 * messages before this gate, and never fall back to unverified loopback IPC.
 */
export function admitSameLogonPipePeer(
  probe: PipePeerProbe,
  pipeHandle: bigint,
  self: WindowsSelfIdentity,
  onFatal: (reason: string) => never = fatalRevertFailure,
): PipeAdmission {
  const verified = probe.verifyPipeClient(pipeHandle);
  if (!verified.ok) {
    if (verified.revertFailed === true) return onFatal(verified.reason);
    return { ok: false, reason: 'TOKEN_UNVERIFIED' };
  }
  if (!self.sameUser(verified.facts.userSid)) return { ok: false, reason: 'DIFFERENT_USER' };
  if (!self.sameLogonSession(verified.facts.logonSessionId)) {
    return { ok: false, reason: 'DIFFERENT_LOGON_SESSION' };
  }
  return { ok: true, facts: verified.facts };
}
