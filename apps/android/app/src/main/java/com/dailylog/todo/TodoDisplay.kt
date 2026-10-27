package com.dailylog.todo

import org.json.JSONObject

internal data class TodoDisplayRow(val item: JSONObject, val isChild: Boolean, val parentId: Long? = null)

/** Children are separate widget list rows so long sublists can scroll fully. */
internal fun todoDisplayRows(state: JSONObject): List<TodoDisplayRow> = buildList {
 for (parent in TodoState.items(state)) {
  add(TodoDisplayRow(parent, false))
  if (parent.optString("type") != "section") {
   val children = parent.optJSONArray("children") ?: continue
   for (index in 0 until children.length()) add(TodoDisplayRow(children.getJSONObject(index), true, parent.getLong("id")))
  }
 }
}
