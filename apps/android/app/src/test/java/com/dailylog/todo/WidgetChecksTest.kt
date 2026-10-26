package com.dailylog.todo
import android.content.Context
import kotlinx.coroutines.runBlocking
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
