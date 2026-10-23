package com.dailylog.todo
import org.json.JSONArray
import org.json.JSONObject

/** Preserve descriptions, sections and child data supplied by the existing web app. */
object TodoState {
 fun copy(value: JSONObject) = JSONObject(value.toString())
 fun items(state: JSONObject): List<JSONObject> {
  val list = state.optJSONObject("snapshot")?.optJSONArray("todayList") ?: JSONArray()
  return (0 until list.length()).map { list.getJSONObject(it) }
 }
 fun canDelete(item: JSONObject): Boolean {
  val children = item.optJSONArray("children") ?: JSONArray()
  return !item.optBoolean("isDisabled") && (0 until children.length()).all { canDelete(children.getJSONObject(it)) }
 }
 fun enqueue(state: JSONObject, action: String, id: Long, text: String = "", done: Boolean = false): JSONObject {
  require(state.optString("refreshToken").isNotEmpty()) { "먼저 로그인해 주세요." }
  require(!state.has("pending")) { "이전 변경을 동기화한 후 다시 시도해 주세요." }
  require(!state.optBoolean("blocked")) { "동기화 상태를 먼저 확인해 주세요." }
  val snapshot = state.optJSONObject("snapshot") ?: error("먼저 새로고침해 주세요.")
  val items = items(state).toMutableList()
  val index = items.indexOfFirst { it.optLong("id") == id }
  val op = JSONObject().put("operationId", java.util.UUID.randomUUID().toString()).put("expectedRevision", snapshot.getInt("revision")).put("action", action).put("itemId", id)
  when (action) {
   "add" -> {
    require(text.trim().isNotEmpty() && text.length <= 1000) { "할 일은 1~1000자로 입력해 주세요." }
    require(items.size < 100) { "오늘 목록에는 최대 100개를 추가할 수 있어요." }
    op.put("text", text.trim())
    items.add(JSONObject().put("id", id).put("text", text.trim()).put("isDone", false).put("type", "todo"))
   }
   "complete" -> {
    require(index >= 0 && items[index].optString("type") != "section")
    op.put("isDone", done)
    items[index] = copy(items[index]).put("isDone", done)
    val children = items[index].optJSONArray("children")
    if (children != null) for (i in 0 until children.length()) children.getJSONObject(i).put("isDone", done)
   }
   "delete" -> { require(index >= 0 && canDelete(items[index])) { "잠긴 항목이나 잠긴 하위 항목은 삭제할 수 없어요." }; items.removeAt(index) }
   else -> error("지원하지 않는 동작입니다.")
  }
  state.put("before", copy(snapshot)).put("pending", op).put("attempted", false)
  state.put("snapshot", copy(snapshot).put("todayList", JSONArray(items)))
  state.put("status", if (action == "delete") "삭제 대기 · 8초 안에 취소 가능" else "기기에 저장됨 · 서버 동기화 대기")
  return state
 }
}
