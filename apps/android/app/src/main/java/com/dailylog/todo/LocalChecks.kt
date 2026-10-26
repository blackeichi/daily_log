package com.dailylog.todo

import android.content.Context
import org.json.JSONObject
import java.security.MessageDigest

/** Device-only completion overrides, isolated from the network queue and scoped per account. */
internal class LocalChecks(context: Context) {
 private val prefs = context.getSharedPreferences("daily_log_local_checks_v1", Context.MODE_PRIVATE)
 companion object { private val lock = Any() }
 private fun key(state: JSONObject): String {
  val identity = state.optString("baseUrl") + "\n" + state.optString("email")
  return MessageDigest.getInstance("SHA-256").digest(identity.toByteArray()).joinToString("") { "%02x".format(it) }
 }
 fun set(state: JSONObject, id: Long, done: Boolean) = set({ state }, id, done)
 fun set(readState: () -> JSONObject, id: Long, done: Boolean, parentId: Long = 0, toggle: Boolean = false) = synchronized(lock) {
  val state = readState()
  require(state.optString("refreshToken").isNotEmpty()) { "먼저 로그인해 주세요." }
  val parent = TodoState.items(state).find { it.optLong("id") == (if (parentId == 0L) id else parentId) } ?: error("목록을 새로고침해 주세요.")
  val children = parent.optJSONArray("children")
  val item = if (parentId == 0L) parent else (0 until (children?.length() ?: 0)).map { children!!.getJSONObject(it) }.find { it.optLong("id") == id } ?: error("하위 항목이 없습니다.")
  require(item.optString("type") != "section")
  val key = key(state)
  val values = JSONObject(prefs.getString(key, "{}")!!)
  val itemKey = if (parentId == 0L) id.toString() else "$parentId/$id"
  val value = if (toggle) !values.optBoolean(itemKey, if (parentId == 0L) false else values.optBoolean(parentId.toString(), false)) else done
  values.put(itemKey, value)
  if (parentId == 0L && children != null) for (i in 0 until children.length()) values.put("$id/${children.getJSONObject(i).getLong("id")}", value)
  check(prefs.edit().putString(key, values.toString()).commit()) { "체크 상태를 저장하지 못했습니다." }
 }
 fun apply(state: JSONObject): JSONObject = synchronized(lock) {
  val result = TodoState.copy(state)
  val values = JSONObject(prefs.getString(key(state), "{}")!!)
  for (item in TodoState.items(result)) {
   val id = item.optLong("id").toString()
   item.put("isDone", values.optBoolean(id, false))
   val children = item.optJSONArray("children")
   if (children != null) for (index in 0 until children.length()) {
    val child = children.getJSONObject(index)
    child.put("isDone", values.optBoolean("$id/${child.getLong("id")}", values.optBoolean(id, false)))
   }
  }
  result
 }
 /** Call only after a valid server snapshot was durably saved, never for optimistic deletion. */
 fun prune(state: JSONObject) = synchronized(lock) {
  val snapshot = state.optJSONObject("snapshot") ?: return@synchronized
  val items = snapshot.optJSONArray("todayList") ?: return@synchronized
  if (snapshot.optInt("revision") < 1) return@synchronized
  val ids = (0 until items.length()).map { items.getJSONObject(it) }
   .filter { it.optString("type") != "section" }.flatMap { item ->
    val id = item.getLong("id").toString(); val children = item.optJSONArray("children")
    listOf(id) + (0 until (children?.length() ?: 0)).map { "$id/${children!!.getJSONObject(it).getLong("id")}" }
   }.toSet()
  val key = key(state)
  val values = JSONObject(prefs.getString(key, "{}")!!)
  val removed = values.keys().asSequence().filter { it !in ids }.toList()
  if (removed.isNotEmpty()) {
   removed.forEach { values.remove(it) }
   check(prefs.edit().putString(key, values.toString()).commit()) { "이전 체크 기록을 정리하지 못했습니다." }
  }
 }
 fun clear(state: JSONObject) = synchronized(lock) { check(prefs.edit().remove(key(state)).commit()) }
}

internal interface StateStore {
 fun read(): JSONObject
 fun write(state: JSONObject)
}
