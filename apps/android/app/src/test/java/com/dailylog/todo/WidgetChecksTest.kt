package com.dailylog.todo
import android.content.Context
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class WidgetChecksTest {
 @Test fun serverChecksAreIgnoredAndChildrenToggleIndependently() = runBlocking {
  val context = RuntimeEnvironment.getApplication() as Context
  context.getSharedPreferences("daily_log_local_checks_v1",0).edit().clear().commit()
  val state = JSONObject("""{"email":"widget","refreshToken":"yes","snapshot":{"revision":1,"todayList":[{"id":1,"isDone":true,"children":[{"id":2,"isDone":true},{"id":3,"isDone":true}]}]}}""")
  val checks = LocalChecks(context)
  assertFalse(TodoState.items(checks.apply(state))[0].getBoolean("isDone"))
  checks.set({state},2,false,1,true)
  var parent = TodoState.items(checks.apply(state))[0]
  assertTrue(parent.getJSONArray("children").getJSONObject(0).getBoolean("isDone"))
  assertFalse(parent.getJSONArray("children").getJSONObject(1).getBoolean("isDone"))
  checks.set({state},2,false,1,true)
  assertFalse(TodoState.items(checks.apply(state))[0].getJSONArray("children").getJSONObject(0).getBoolean("isDone"))
 }
 @Test fun activeObserverReceivesLocalChangesWithoutRestartOrApi() = runBlocking {
  val context = RuntimeEnvironment.getApplication() as Context
  context.getSharedPreferences("daily_log_local_checks_v1",0).edit().clear().commit()
  val state = JSONObject("""{"email":"observer","refreshToken":"yes","snapshot":{"revision":1,"todayList":[{"id":1,"isDone":false}]}}""")
  val store = object : StateStore {
   override fun read() = TodoState.copy(state)
   override fun write(state: JSONObject) = error("No server writes")
  }
  val checks = LocalChecks(context)
  val repo = TodoRepository(store, checks) { _,_,_,_ -> error("No API") }.also { it.appContext = context }
  withTimeout(5000) {
   val ready = CompletableDeferred<Unit>()
   val updates = async { repo.observe().onEach { ready.complete(Unit) }.take(2).toList() }
   ready.await()
   checks.set({state},1,true)
   val received = updates.await()
   assertFalse(TodoState.items(received[0])[0].getBoolean("isDone"))
   assertTrue(TodoState.items(received[1])[0].getBoolean("isDone"))
  }
 }
 @Test fun resetUnchecksParentsAndChildrenWithoutNetworkOrLosingPendingEdits() = runBlocking {
  val context = RuntimeEnvironment.getApplication() as Context
  val initial = JSONObject("""{"email":"reset-test","refreshToken":"yes","pending":{"action":"replace"},"blocked":true,"snapshot":{"revision":4,"todayList":[{"id":1,"text":"parent","isDone":true,"children":[{"id":2,"isDone":true}]}]}}""")
  val checks = LocalChecks(context)
  val store = object : StateStore {
   override fun read() = TodoState.copy(initial)
   override fun write(state: JSONObject) = error("Reset must not change server snapshot or pending edits")
  }
  val repo = TodoRepository(store,checks) { _,_,_,_ -> error("Reset must not call API") }
  checks.set({initial},1,true)
  repo.resetChecks()
  val view = repo.read(); val parent = TodoState.items(view)[0]
  assertFalse(parent.getBoolean("isDone"))
  assertFalse(parent.getJSONArray("children").getJSONObject(0).getBoolean("isDone"))
  assertTrue(view.has("pending")); assertTrue(view.getBoolean("blocked"))
  assertTrue(TodoState.items(store.read())[0].getBoolean("isDone"))
 }
 @Test fun editsPreserveUnknownFieldsAndServerChecks() {
  val root = org.json.JSONArray("""[{"id":1,"text":"old","isDone":true,"custom":"keep","children":[{"id":2,"text":"child","isDone":true}]},{"id":3,"text":"next"}]""")
  TodoEdits.apply(root,2,1,"edit","new child","long description")
  assertTrue(root.getJSONObject(0).getJSONArray("children").getJSONObject(0).getBoolean("isDone"))
  TodoEdits.apply(root,1,0,"down","","")
  assertEquals("keep",root.getJSONObject(1).getString("custom"))
  TodoEdits.apply(root,2,1,"delete","","")
  assertEquals(0,root.getJSONObject(1).getJSONArray("children").length())
 }
}
