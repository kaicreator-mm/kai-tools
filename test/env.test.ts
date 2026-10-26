import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import test from 'node:test';
import { selectChildEnvironment, windowsPinnedNodeChildEnv } from '../src/index.ts';

test('explicit keys: selected values only, unknown variables ignored', () => {
  assert.deepEqual(selectChildEnvironment({ TOKEN: 'secret', HOME: '/a', UNSET: undefined }, ['HOME']), { HOME: '/a' });
});
test('generic selector supports case-insensitive key and blocked prefix', () => {
  assert.deepEqual(selectChildEnvironment({ Node_OPTIONS: 'evil', PATH: '/valid' }, ['node_options','path'], {caseInsensitive:true,denyPrefixes:['NODE']}), {PATH:'/valid'});
});
test('Windows pinned-child preset does not inherit Node directives or PowerShell module path', () => {
  const env = windowsPinnedNodeChildEnv({
    SystemRoot: 'C:\\Windows', Path: 'C:\\Windows\\System32',
    NODE_OPTIONS: '--require=evil', node_path: 'C:\\attacker', NODE_EXTRA_CA_CERTS: 'C:\\bad',
    PSModulePath: 'C:\\malicious', SECRET_KEY: 'secret',
  });
  assert.deepEqual(env, {SystemRoot:'C:\\Windows',Path:'C:\\Windows\\System32'});
});
test('PATH normalized to one spelling and source remains unchanged', () => {
  const source={PATH:'fallback',Path:'preferred',NODE_OPTIONS:'evil'};
  assert.deepEqual(windowsPinnedNodeChildEnv(source), {Path:'preferred'});
  assert.equal(source.NODE_OPTIONS,'evil');
});
test('real pinned node child does not receive poisoned interpreter directives', () => {
  const env=windowsPinnedNodeChildEnv({
    NODE_OPTIONS: '--import=./does-not-exist.mjs',
    NODE_PATH: 'poison',
    PSModulePath: 'poison',
    SystemRoot:process.env.SystemRoot,
    windir:process.env.windir,
    Path:process.env.Path ?? process.env.PATH,
    TEMP:process.env.TEMP,
    TMP:process.env.TMP,
  });
  const child=spawnSync(process.execPath,['-e',
    'process.stdout.write(JSON.stringify({nodeOptions:process.env.NODE_OPTIONS??null,nodePath:process.env.NODE_PATH??null,psModulePath:process.env.PSModulePath??null}))'
  ],{env,encoding:'utf8',timeout:15000});
  assert.equal(child.status,0,child.stderr || String(child.error));
  assert.deepEqual(JSON.parse(child.stdout),{nodeOptions:null,nodePath:null,psModulePath:null});
});

test('Windows preset normalizes unconventional Path casing', () => {
  const result = windowsPinnedNodeChildEnv({ pAtH: 'C:\\Windows\\System32', PATH: 'C:\\Fallback' });
  assert.deepEqual(result, { Path: 'C:\\Fallback' });
});
