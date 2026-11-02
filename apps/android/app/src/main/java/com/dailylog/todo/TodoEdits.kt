package com.dailylog.todo

import org.json.JSONArray
import org.json.JSONObject

internal object TodoEdits {
 fun apply(root: JSONArray, id: Long, parentId: Long, action: String, text: String, description: String) {
  val parent = (0 until root.length()).map { root.getJSONObject(it) }.find { it.optLong("id") == parentId }
  val list = if (parentId == 0L) root else parent?.optJSONArray("children") ?: JSONArray().also { requireNotNull(parent).put("children", it) }
  val index = (0 until list.length()).find { list.getJSONObject(it).optLong("id") == id } ?: -1
  when(action) {
   "addChild" -> {
    require(parentId != 0L && list.length() < 50)
    require(text.trim().isNotEmpty() && text.length <= 1000)
    list.put(JSONObject().put("id", id).put("text", text.trim()).put("type", "todo").put("isDone", false))
   }
   "edit" -> {
    require(index >= 0); require(text.trim().isNotEmpty() && text.length <= 1000 && description.length <= 10000) { "제목은 1~1000자, 설명은 10000자까지 입력해 주세요." }
    list.getJSONObject(index).put("text", text.trim()).put("description", description)
   }
   "delete" -> { require(index >= 0 && TodoState.canDelete(list.getJSONObject(index))) { "잠긴 항목은 삭제할 수 없어요." }; list.remove(index) }
   "up", "down" -> {
    require(index >= 0); val target = index + if(action == "up") -1 else 1
    require(target in 0 until list.length()) { "더 이동할 수 없어요." }
    val item = list.get(index); list.put(index, list.get(target)); list.put(target, item)
   }
   else -> error("지원하지 않는 변경입니다.")
  }
 }
}
