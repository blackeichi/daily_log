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
 fun set(readState: () -> JSONObject, id: Long, done: Boolean) = synchronized(lock) {
  val state = readState()
  require(state.optString("refreshToken").isNotEmpty()) { "먼저 로그인해 주세요." }
  require(TodoState.items(state).any { it.optLong("id") == id && it.optString("type") != "section" }) { "목록을 새로고침해 주세요." }
  val key = key(state)
  val values = JSONObject(prefs.getString(key, "{}")!!).put(id.toString(), done)
  check(prefs.edit().putString(key, values.toString()).commit()) { "체크 상태를 저장하지 못했습니다." }
 }
 fun apply(state: JSONObject): JSONObject = synchronized(lock) {
  val result = TodoState.copy(state)
  val values = JSONObject(prefs.getString(key(state), "{}")!!)
  for (item in TodoState.items(result)) {
   val id = item.optLong("id").toString()
   if (!values.has(id)) continue
   val done = values.getBoolean(id)
   item.put("isDone", done)
   val children = item.optJSONArray("children")
   if (children != null) for (index in 0 until children.length()) children.getJSONObject(index).put("isDone", done)
  }
  result
 }
 /** Call only after a valid server snapshot was durably saved, never for optimistic deletion. */
 fun prune(state: JSONObject) = synchronized(lock) {
  val snapshot = state.optJSONObject("snapshot") ?: return@synchronized
  val items = snapshot.optJSONArray("todayList") ?: return@synchronized
  if (snapshot.optInt("revision") < 1) return@synchronized
  val ids = (0 until items.length()).map { items.getJSONObject(it) }
   .filter { it.optString("type") != "section" }.map { it.getLong("id").toString() }.toSet()
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
