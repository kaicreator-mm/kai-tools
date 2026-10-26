import assert from 'node:assert/strict';
import test from 'node:test';
import { withDeadline, DeadlineExceededError, isDeadlineExceeded } from '../src/async.ts';

const sleep=(ms:number):Promise<void>=>new Promise(resolve=>setTimeout(resolve,ms));

test('returns value from cooperative operation without aborting it later', async()=>{
  let signal: AbortSignal | undefined;
  const result=await withDeadline(async s=>{signal=s;return {ok:true};},20);
  assert.deepEqual(result,{ok:true});
  await sleep(35);
  assert.equal(signal?.aborted,false);
});
test('propagates original async rejection and clears timer', async()=>{
  let signal: AbortSignal | undefined;
  const error=new Error('original error');
  await assert.rejects(withDeadline(async s=>{signal=s;throw error;},20),e=>e===error);
  await sleep(35);
  assert.equal(signal?.aborted,false);
});
test('propagates synchronous callback throw and clears timer', async()=>{
  const error=new Error('sync error');
  await assert.rejects(withDeadline((_signal):Promise<void>=>{throw error;},20),e=>e===error);
});
test('timeout is typed, and aborts cooperative work', async()=>{
  let observed: AbortSignal | undefined;
  const settled=withDeadline(async s=>{
    observed=s;
    return await new Promise<void>((_resolve,reject)=>{
      s.addEventListener('abort',()=>reject(new Error('abort-driven rejection')),{once:true});
    });
  },20);
  await assert.rejects(settled,e=>e instanceof DeadlineExceededError && isDeadlineExceeded(e));
  assert.equal(observed?.aborted,true);
});
test('non-cooperative never-settling work still has a bounded return', async()=>{
  let invoked=0;
  await assert.rejects(withDeadline(async _signal=>{
    invoked+=1;
    return await new Promise<never>(()=>{});
  },15),DeadlineExceededError);
  assert.equal(invoked,1);
});
test('refuses invalid or overflow timeouts', async()=>{
  for(const ms of [0,-1,NaN,Infinity,1.5,2_147_483_648]){
    await assert.rejects(withDeadline(async()=>42,ms),RangeError);
  }
});
