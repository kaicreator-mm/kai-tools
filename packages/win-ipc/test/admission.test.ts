import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { admitSameLogonPipePeer, hasWindowsLogonGroupAttributes, isWindowsIpcPlatform, WindowsIpcBridge } from '../src/index.ts';
import type { WindowsPeerVerification, WindowsSelfIdentity } from '../src/index.ts';

const own: WindowsSelfIdentity = {
  userSid: 'S-1-5-21-100',
  logonSessionId: '0x0000000000000234',
  sameUser: sid => sid === 'S-1-5-21-100',
  sameLogonSession: luid => luid === '0x0000000000000234',
};
const facts={userSid:own.userSid,userName:undefined,logonSessionId:own.logonSessionId,clientPid:77};
const prove=(result:WindowsPeerVerification)=>({verifyPipeClient:(_handle:bigint)=>result});
test('matching native token SID and logon LUID are required',()=>{
  assert.equal(admitSameLogonPipePeer(prove({ok:true,facts}),1n,own).ok,true);
  assert.deepEqual(admitSameLogonPipePeer(prove({ok:true,facts:{...facts,userSid:'S-1-5-21-200'}}),1n,own),{ok:false,reason:'DIFFERENT_USER'});
  assert.deepEqual(admitSameLogonPipePeer(prove({ok:true,facts:{...facts,logonSessionId:'0x1'}}),1n,own),{ok:false,reason:'DIFFERENT_LOGON_SESSION'});
});
test('unverified/native failure denies, never falls back to claimed PID',()=>{
  assert.deepEqual(admitSameLogonPipePeer(prove({ok:false,reason:'native error'}),1n,own),{ok:false,reason:'TOKEN_UNVERIFIED'});
});
test('RevertToSelf failure terminates the entire host process with code 70',()=>{
  const file=new URL('../src/index.ts',import.meta.url).href;
  const child=spawnSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',
    'import {admitSameLogonPipePeer} from '+JSON.stringify(file)+';'+
    'admitSameLogonPipePeer({verifyPipeClient:()=>({ok:false,revertFailed:true,reason:"restore failed"})},1n,{sameUser:()=>true,sameLogonSession:()=>true});'
  ],{encoding:'utf8',timeout:15_000});
  assert.equal(child.status,70,child.stderr);
  assert.match(child.stderr,/kai-tools win-ipc FATAL/u);
});
test('Win32 only and fail-closed when native is not loaded',()=>{
  assert.equal(isWindowsIpcPlatform('linux'),false);
  assert.equal(isWindowsIpcPlatform('win32'),true);
  if(process.platform!=='win32')assert.equal(WindowsIpcBridge.tryLoad(),null);
});
test('logon group attribute bits are unsigned DWORD and strict',()=>{
  assert.equal(hasWindowsLogonGroupAttributes(0xc0000000),true);
  assert.equal(hasWindowsLogonGroupAttributes(0x80000000),false);
  assert.equal(hasWindowsLogonGroupAttributes(-1073741824),false);
  assert.equal(hasWindowsLogonGroupAttributes(0x100000000),false);
});
