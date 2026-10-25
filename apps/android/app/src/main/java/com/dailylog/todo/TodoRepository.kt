package com.dailylog.todo
import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

private const val API_BASE_URL = "https://daily-log-szq5.onrender.com"

class ApiException(val code: Int, message: String) : Exception(message)
class TodoRepository internal constructor(
 private val store: StateStore,
 private val checks: LocalChecks,
 private val requestOverride: ((String, String, JSONObject?, String) -> JSONObject)? = null,
) {
 constructor(context: Context) : this(SecureStore(context.applicationContext), LocalChecks(context.applicationContext))
 companion object { private val mutex = Mutex() }
 suspend fun read(): JSONObject = withContext(Dispatchers.IO) { checks.apply(store.read()) }
 private fun request(base: String, path: String, body: JSONObject? = null, token: String = ""): JSONObject {
  requestOverride?.let { return it(base, path, body, token) }
  val connection = URL(base + path).openConnection() as HttpURLConnection
  try {
   connection.connectTimeout = 15000; connection.readTimeout = 15000; connection.instanceFollowRedirects = false
   connection.requestMethod = if (body == null) "GET" else "POST"
   connection.setRequestProperty("Accept", "application/json")
   if (token.isNotEmpty()) connection.setRequestProperty("Authorization", "Bearer $token")
   if (body != null) {
    connection.doOutput = true; connection.setRequestProperty("Content-Type", "application/json")
    connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
   }
   val code = connection.responseCode
   val raw = (if (code in 200..299) connection.inputStream else connection.errorStream)?.bufferedReader()?.use { it.readText() } ?: "{}"
   val result = runCatching { JSONObject(raw) }.getOrDefault(JSONObject())
   if (code !in 200..299) throw ApiException(code, result.opt("message")?.toString() ?: "서버 요청 실패 ($code)")
   return if (result.has("data")) result.optJSONObject("data") ?: JSONObject() else result
  } finally { connection.disconnect() }
 }
 private fun authenticated(state: JSONObject, path: String, body: JSONObject? = null): JSONObject {
  val base = state.getString("baseUrl")
  try { return request(base, path, body, state.optString("accessToken")) }
  catch (e: ApiException) {
   if (e.code != 401) throw e
   val refreshed = request(base, "/auth/mobile/refresh", JSONObject().put("refreshToken", state.getString("refreshToken")))
   state.put("accessToken", refreshed.getString("accessToken")); store.write(state)
   return request(base, path, body, state.getString("accessToken"))
  }
 }
 suspend fun login(email: String, password: String) = withContext(Dispatchers.IO) { mutex.withLock {
  val base = API_BASE_URL
  val tokens = request(base, "/auth/mobile/login", JSONObject().put("email", email.trim()).put("password", password))
  store.write(JSONObject().put("baseUrl", base).put("email", email.trim()).put("accessToken", tokens.getString("accessToken")).put("refreshToken", tokens.getString("refreshToken")))
 } }
 suspend fun reauthenticate(password: String) = withContext(Dispatchers.IO) { mutex.withLock {
  val state = store.read()
  val tokens = request(state.getString("baseUrl"), "/auth/mobile/login", JSONObject().put("email", state.getString("email")).put("password", password))
  state.put("accessToken", tokens.getString("accessToken")).put("refreshToken", tokens.getString("refreshToken")); state.remove("blocked"); store.write(state)
 } }
 suspend fun change(action: String, id: Long, text: String = "", done: Boolean = false) = withContext(Dispatchers.IO) {
  // Never take the network mutex for a checkbox tap, even while a request is slow/offline.
  if (action == "complete") {
   checks.set(store.read(), id, done)
   return@withContext
  }
  mutex.withLock {
  val state = TodoState.enqueue(store.read(), action, id, text, done)
  if (action == "delete") state.put("notBefore", System.currentTimeMillis() + 8000)
  store.write(state)
 } }
 private fun clearPending(state: JSONObject) { listOf("pending", "before", "attempted", "notBefore", "blocked").forEach { state.remove(it) } }
 suspend fun undoDelete() = withContext(Dispatchers.IO) { mutex.withLock {
  val state = store.read()
  require(state.optJSONObject("pending")?.optString("action") == "delete" && !state.optBoolean("attempted")) { "이미 전송된 삭제는 취소할 수 없어요." }
  state.put("snapshot", state.getJSONObject("before")).put("status", "삭제를 취소했어요"); clearPending(state); store.write(state)
 } }
 suspend fun discardConflict() = withContext(Dispatchers.IO) { mutex.withLock {
  val state = store.read(); require(state.optBoolean("blocked"))
  val snapshot = authenticated(state, "/todos")
  clearPending(state); state.put("snapshot", snapshot).put("status", "서버의 최신 목록을 불러왔어요"); store.write(state)
 } }
 /** Retry transient failures; conflicts retain the user's pending action until explicitly discarded. */
 suspend fun sync(): Boolean = withContext(Dispatchers.IO) { mutex.withLock {
  val state = store.read()
  // Convert a queued check left by an older APK instead of transmitting it on retry.
  val legacyCheck = state.optJSONObject("pending")
  if (legacyCheck?.optString("action") == "complete") {
   checks.set(state, legacyCheck.getLong("itemId"), legacyCheck.getBoolean("isDone"))
   state.optJSONObject("before")?.let { state.put("snapshot", it) }
   clearPending(state); store.write(state)
  }
  if (state.optString("refreshToken").isEmpty() || state.optBoolean("blocked")) return@withLock true
  if (state.optLong("notBefore") > System.currentTimeMillis()) return@withLock false
  try {
   val pending = state.optJSONObject("pending")
   val snapshot = if (pending != null) {
    state.put("attempted", true); store.write(state); authenticated(state, "/todos/operations", pending)
   } else {
    val found = authenticated(state, "/todos")
    if (found.has("revision")) found else authenticated(state, "/todos", JSONObject())
   }
   clearPending(state); state.put("snapshot", snapshot).put("lastSync", System.currentTimeMillis()).put("status", "동기화 완료"); store.write(state); true
  } catch (e: Exception) {
   val permanent = e is ApiException && e.code in listOf(400, 401, 403, 409, 422)
   if (permanent) state.put("blocked", true)
   state.put("status", if (permanent) (e.message ?: "동기화 확인 필요") else "연결 대기 · 변경 내용은 기기에 보관돼 있어요")
   store.write(state); permanent
  }
 } }
 suspend fun logout() = withContext(Dispatchers.IO) { mutex.withLock {
  val state = store.read(); require(!state.has("pending")) { "대기 중인 변경을 처리한 후 로그아웃해 주세요." }
  if (state.optString("refreshToken").isNotEmpty()) request(state.getString("baseUrl"), "/auth/mobile/logout", JSONObject().put("refreshToken", state.getString("refreshToken")))
  checks.clear(state); store.write(JSONObject())
 } }
}

