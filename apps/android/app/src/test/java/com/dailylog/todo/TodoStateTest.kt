package com.dailylog.todo
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
class TodoStateTest {
 private fun state() = JSONObject("""{"refreshToken":"test","snapshot":{"revision":3,"todayList":[{"id":10,"text":"parent","isDone":false,"description":"notes","children":[{"id":11,"text":"child","isDone":false}]}]}}""")
 @Test fun completionPreservesDataAndTracksRevision() {
  val result = TodoState.enqueue(state(), "complete", 10, done = true)
  assertEquals(3, result.getJSONObject("pending").getInt("expectedRevision"))
  assertTrue(TodoState.items(result)[0].getJSONArray("children").getJSONObject(0).getBoolean("isDone"))
  assertEquals("notes", TodoState.items(result)[0].getString("description"))
  assertFalse(result.getJSONObject("before").getJSONArray("todayList").getJSONObject(0).getBoolean("isDone"))
 }
 @Test fun refusesDeletingLockedDescendant() {
  val s = state(); TodoState.items(s)[0].getJSONArray("children").getJSONObject(0).put("isDisabled", true)
  assertFalse(TodoState.canDelete(TodoState.items(s)[0]))
  assertThrows(IllegalArgumentException::class.java) { TodoState.enqueue(s, "delete", 10) }
 }
 @Test fun doesNotOverwritePendingOfflineChanges() {
  val s = TodoState.enqueue(state(), "add", 12, "new")
  assertThrows(IllegalArgumentException::class.java) { TodoState.enqueue(s, "complete", 10, done = true) }
  assertEquals("add", s.getJSONObject("pending").getString("action"))
 }
 @Test fun validatesTextBeforeSaving() {
  assertThrows(IllegalArgumentException::class.java) { TodoState.enqueue(state(), "add", 12, "  ") }
  assertThrows(IllegalArgumentException::class.java) { TodoState.enqueue(state(), "add", 12, "a".repeat(1001)) }
 }
}
