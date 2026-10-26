/** Narrow public entrypoint. Native DLLs are only loaded by WindowsIpcBridge.tryLoad(). */
export {
  WindowsIpcBridge,
  WindowsIpcUnsupportedError,
  isWindowsIpcPlatform,
  hasWindowsLogonGroupAttributes,
  WINDOWS_PIPE_TRANSPORT_KIND,
  type WindowsSelfIdentity,
  type WindowsClientTokenFacts,
  type WindowsPipeAccept,
  type WindowsPeerVerification,
} from './win-ipc.ts';
export { admitSameLogonPipePeer, type PipePeerProbe, type PipeAdmission } from './admission.ts';
