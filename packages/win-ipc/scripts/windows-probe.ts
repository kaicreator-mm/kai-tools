/**
 * Real Win32 host validation: same-process named-pipe handshake, token-derived
 * SID/LUID and protected DACL. Does NOT prove independent cross-user denial or
 * compatibility with other Node runtime builds.
 */
import { randomBytes } from 'node:crypto';
import { WindowsIpcBridge, admitSameLogonPipePeer } from '../src/index.ts';

if (process.platform !== 'win32') throw new Error('Windows host required');
const bridge = WindowsIpcBridge.tryLoad();
if (!bridge) throw new Error('koffi/Win32 bridge unavailable; no fallback');
const self = bridge.selfIdentity();
if (!/^S-1-/u.test(self.userSid) || !/^0x[0-9a-f]{16}$/u.test(self.logonSessionId)) throw new Error('invalid host token facts');
const sd = bridge.buildProtectedSecurityDescriptor();
const sddl = bridge.securityDescriptorToSddl(sd);
if (!sddl || !sddl.includes('D:') || /\b(?:WD|AN|AU)\b/u.test(sddl)) throw new Error('unsafe or unavailable pipe DACL');
const pipeName = String.raw`\\.\pipe\kai-tools-${process.pid}-${randomBytes(6).toString('hex')}`;
const listener = bridge.createPipeInstance(pipeName, sd, true);
let client: bigint | undefined;
let accept: ReturnType<typeof bridge.beginPipeAccept> | undefined;
try {
  accept = bridge.beginPipeAccept(listener);
  client = bridge.openNamedPipeClient(pipeName);
  const status = await accept.result;
  if (status !== 'CONNECTED') throw new Error('pipe did not connect');
  const admitted=admitSameLogonPipePeer(bridge,listener,self);
  if(!admitted.ok) throw new Error('same-logon OS probe denied: ' + admitted.reason);
  if(admitted.facts.clientPid!==process.pid)throw new Error('PID metadata mismatch');
  console.log(JSON.stringify({probe:'WIN_IPC_SAME_LOGON',result:'PASS',sameUser:true,sameLogonSession:true,dacl:'EXPLICIT',realToken:true}));
} finally {
  accept?.dispose();
  if(client!==undefined)bridge.closePipeHandle(client);
  bridge.closePipeHandle(listener);
}
