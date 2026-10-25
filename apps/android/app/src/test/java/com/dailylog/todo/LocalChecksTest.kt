package com.dailylog.todo

import android.content.Context
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class LocalChecksTest {
 private val context get() = RuntimeEnvironment.getApplication() as Context
 private fun state() = JSONObject("""{"baseUrl":"https://example.test","email":"a@example.test","refreshToken":"test","snapshot":{"revision":1,"todayList":[{"id":10,"text":"parent","isDone":false,"children":[{"id":11,"text":"child","isDone":false}]}]}}""")
 private class MemoryStore(initial: JSONObject) : StateStore {
  private var value = initial.toString()
  @Synchronized override fun read() = JSONObject(value)
  @Synchronized override fun write(state: JSONObject) { value = state.toString() }
 }
 @Before fun reset() { context.getSharedPreferences("daily_log_local_checks_v1",Context.MODE_PRIVATE).edit().clear().commit() }
 @Test fun checkingIsLocalPersistentAndDoesNotModifyServerSnapshotOrQueue() = runBlocking {
  val store = MemoryStore(state())
  val repo = TodoRepository(store,LocalChecks(context)) { _,_,_,_ -> error("Checkbox must not call the API") }
  repo.change("complete",10,done=true)
  val view = TodoRepository(store,LocalChecks(context)).read()
  assertTrue(TodoState.items(view)[0].getBoolean("isDone"))
  assertTrue(TodoState.items(view)[0].getJSONArray("children").getJSONObject(0).getBoolean("isDone"))
  assertFalse(TodoState.items(store.read())[0].getBoolean("isDone"))
  assertFalse(store.read().has("pending"))
  repo.change("complete",10,done=false)
  assertFalse(TodoState.items(repo.read())[0].getBoolean("isDone"))
 }
 @Test fun refreshCannotOverwriteLocalChecksAndOtherAccountsAreIsolated() = runBlocking {
  val store = MemoryStore(state()); val checks = LocalChecks(context)
  val repo = TodoRepository(store,checks) { _,path,_,_ -> assertEquals("/todos",path); state().getJSONObject("snapshot") }
  repo.change("complete",10,done=true); repo.sync()
  assertTrue(TodoState.items(repo.read())[0].getBoolean("isDone"))
  assertFalse(TodoState.items(checks.apply(state().put("email","b@example.test")))[0].getBoolean("isDone"))
 }
 @Test fun slowNetworkCannotBlockCheckboxOrLocalRead() {
  val entered = CountDownLatch(1); val release = CountDownLatch(1)
  val store = MemoryStore(state()); val executor = Executors.newSingleThreadExecutor()
  val repo = TodoRepository(store,LocalChecks(context)) { _,path,_,_ ->
   assertEquals("/todos",path); entered.countDown(); check(release.await(5,TimeUnit.SECONDS)); state().getJSONObject("snapshot")
  }
  val sync = executor.submit<Boolean> { runBlocking { repo.sync() } }
  try {
   assertTrue(entered.await(5,TimeUnit.SECONDS))
   runBlocking { withTimeout(1500) {
    repo.change("complete",10,done=true)
    assertTrue(TodoState.items(repo.read())[0].getBoolean("isDone"))
   } }
  } finally { release.countDown(); executor.shutdown() }
  assertTrue(sync.get(5,TimeUnit.SECONDS))
 }
 @Test fun legacyQueuedCheckIsConvertedInsteadOfUploaded() = runBlocking {
  val initial = state()
  initial.put("before",TodoState.copy(initial.getJSONObject("snapshot")))
  initial.put("pending",JSONObject().put("action","complete").put("itemId",10).put("isDone",true)).put("blocked",true)
  val store = MemoryStore(initial)
  val repo = TodoRepository(store,LocalChecks(context)) { _,path,_,_ -> assertEquals("/todos",path); state().getJSONObject("snapshot") }
  repo.sync()
  assertFalse(store.read().has("pending"))
  assertTrue(TodoState.items(repo.read())[0].getBoolean("isDone"))
 }
}
