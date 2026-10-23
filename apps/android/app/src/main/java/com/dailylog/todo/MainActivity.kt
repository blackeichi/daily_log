package com.dailylog.todo
import android.app.Activity
import android.app.AlertDialog
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import android.os.Bundle
import android.graphics.Color
import android.graphics.Typeface
import android.text.InputType
import android.view.Gravity
import android.widget.*
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.*
import org.json.JSONObject

open class TaskActivity : Activity() {
 protected val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
 protected val repo by lazy { TodoRepository(this) }
 protected fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
 protected fun column() = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(20), dp(24), dp(20), dp(24)); setBackgroundColor(Color.rgb(245,247,243)) }
 protected fun label(text: String, size: Float = 16f) = TextView(this).apply { this.text = text; textSize = size; setTextColor(Color.rgb(29,52,41)); setPadding(0, dp(8), 0, dp(8)) }
 protected fun button(text: String, action: () -> Unit) = Button(this).apply { this.text = text; isAllCaps = false; setOnClickListener { action() } }
 protected fun input(hint: String, type: Int = InputType.TYPE_CLASS_TEXT) = EditText(this).apply { this.hint = hint; inputType = type; minHeight = dp(48); isSingleLine = true }
 protected fun task(block: suspend () -> Unit) { scope.launch { try { block() } catch (e: Exception) { if (e is CancellationException) throw e; Toast.makeText(this@TaskActivity, e.message ?: "다시 시도해 주세요", Toast.LENGTH_LONG).show() } } }
 override fun onDestroy() { scope.cancel(); super.onDestroy() }
}
class MainActivity : TaskActivity() {
 private var rendered = ""
 private var poll: Job? = null
 override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); SyncWorker.schedule(this) }
 override fun onResume() {
  super.onResume(); SyncWorker.enqueue(this)
  poll = scope.launch {
   while (isActive) {
    try { val state = repo.read(); if (state.toString() != rendered) { rendered = state.toString(); render(state) } }
    catch (_: Exception) { Toast.makeText(this@MainActivity, "저장소를 열 수 없습니다. 앱 설정에서 데이터를 초기화한 뒤 로그인해 주세요.", Toast.LENGTH_LONG).show(); break }
    delay(1000)
   }
  }
 }
 override fun onPause() { poll?.cancel(); super.onPause() }
 private fun render(state: JSONObject) {
  val root = column()
  root.setOnApplyWindowInsetsListener { view, insets -> view.setPadding(dp(20) + insets.systemWindowInsetLeft, dp(24) + insets.systemWindowInsetTop, dp(20) + insets.systemWindowInsetRight, dp(24) + insets.systemWindowInsetBottom); insets }
  setContentView(ScrollView(this).apply { addView(root) })
  root.addView(label("DAILY LOG", 12f))
  root.addView(label("오늘, 하나씩.", 30f).apply { setTypeface(null, Typeface.BOLD) })
  if (state.optString("refreshToken").isEmpty()) {
   root.addView(label("홈 화면에서 가볍게 시작하는 할 일"))
   val base = input("HTTPS 백엔드 주소", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_URI)
   val email = input("이메일", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
   val password = input("비밀번호", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD)
   root.addView(base); root.addView(email); root.addView(password)
   root.addView(label("웹사이트 주소가 아닌 NestJS API 주소를 입력해 주세요.", 12f))
   val login = button("로그인") {}
   login.setOnClickListener { login.isEnabled = false; task { try { repo.login(base.text.toString(), email.text.toString(), password.text.toString()); SyncWorker.enqueue(this@MainActivity); rendered = "" } finally { login.isEnabled = true } } }
   root.addView(login); return
  }
  val todos = TodoState.items(state).filter { it.optString("type") != "section" }
  root.addView(label("${todos.count { it.optBoolean("isDone") }} / ${todos.size} 완료", 18f))
  root.addView(label(state.optString("status", "목록을 불러오는 중…"), 13f))
  if (state.optLong("lastSync") > 0) root.addView(label("최근 동기화: " + java.text.SimpleDateFormat("MM/dd HH:mm", java.util.Locale.KOREA).format(java.util.Date(state.getLong("lastSync"))), 12f))
  val pending = state.optJSONObject("pending")
  if (pending != null) root.addView(label("대기 중: ${pending.optString("action")} · ${pending.optString("text", pending.optLong("itemId").toString())}", 12f).apply { setTextIsSelectable(true) })
  if (pending?.optString("action") == "delete" && !state.optBoolean("attempted")) root.addView(button("삭제 취소") { task { repo.undoDelete(); TodoWidget().updateAll(this@MainActivity) } })
  if (state.optBoolean("blocked")) {
   root.addView(label("서버 변경 또는 인증 문제로 동기화가 중단됐어요. 기기의 변경 내용을 확인한 뒤 서버 목록을 불러와 주세요.", 13f))
   root.addView(button("서버 목록 다시 불러오기") {
    AlertDialog.Builder(this).setTitle("기기의 대기 중 변경을 취소할까요?").setMessage("기기의 변경을 취소하고 서버 목록으로 바꿉니다. 필요한 내용은 먼저 복사해 두세요.")
     .setNegativeButton("유지", null).setPositiveButton("불러오기") { _, _ -> task { repo.discardConflict(); TodoWidget().updateAll(this@MainActivity) } }.show()
   })
   root.addView(button("계정 다시 인증") {
    val password = input("비밀번호", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD)
    AlertDialog.Builder(this).setTitle("다시 로그인").setView(password).setNegativeButton("취소", null).setPositiveButton("로그인") { _, _ -> task { repo.reauthenticate(password.text.toString()); SyncWorker.enqueue(this@MainActivity) } }.show()
   })
  }
  val actions = LinearLayout(this)
  actions.addView(button("+ 할 일 추가") { startActivity(Intent(this, QuickAddActivity::class.java)) }, LinearLayout.LayoutParams(0, dp(52), 1f))
  actions.addView(button("새로고침") { SyncWorker.enqueue(this) }); root.addView(actions)
  if (todos.isEmpty()) root.addView(label("오늘 해보고 싶은 일을 하나 적어보세요."))
  for (item in TodoState.items(state)) {
   if (item.optString("type") == "section") { root.addView(label(item.optString("text"), 18f).apply { setTypeface(null, Typeface.BOLD) }); continue }
   val row = LinearLayout(this).apply { gravity = Gravity.CENTER_VERTICAL }
   val check = CheckBox(this).apply {
    text = item.optString("text"); textSize = 17f; minHeight = dp(56); isChecked = item.optBoolean("isDone"); isEnabled = pending == null && !state.optBoolean("blocked")
    setOnCheckedChangeListener { _, done -> task { repo.change("complete", item.getLong("id"), done = done); TodoWidget().updateAll(this@MainActivity); SyncWorker.enqueue(this@MainActivity) } }
   }
   row.addView(check, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
   if (TodoState.canDelete(item)) row.addView(button("삭제") { task { repo.change("delete", item.getLong("id")); TodoWidget().updateAll(this@MainActivity); SyncWorker.enqueue(this@MainActivity, 8) } }.apply { isEnabled = pending == null && !state.optBoolean("blocked") })
   else row.addView(label("🔒"))
   root.addView(row)
   if (item.optString("description").isNotEmpty()) root.addView(label(item.optString("description"), 13f).apply { setTextIsSelectable(true) })
   val children = item.optJSONArray("children")
   if (children != null && children.length() > 0) root.addView(label("하위 항목 ${children.length()}개 · 상세 편집은 웹에서", 12f))
  }
  root.addView(button("홈 화면에 위젯 추가") {
   val manager = getSystemService(AppWidgetManager::class.java)
   if (manager.isRequestPinAppWidgetSupported) manager.requestPinAppWidget(ComponentName(this, TodoWidgetReceiver::class.java), null, null)
   else Toast.makeText(this, "홈 화면을 길게 누르고 위젯에서 Daily Log Todo를 선택하세요.", Toast.LENGTH_LONG).show()
  })
  root.addView(button("로그아웃") { task { repo.logout(); TodoWidget().updateAll(this@MainActivity); rendered = "" } })
 }
}
class QuickAddActivity : TaskActivity() {
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  val root = column(); root.addView(label("오늘 할 일 추가", 22f))
  val text = input("무엇을 할까요?"); root.addView(text)
  val save = button("추가") {}
  save.setOnClickListener {
   save.isEnabled = false
   task {
    try { val id = java.security.SecureRandom().nextLong().ushr(11).coerceAtLeast(1); repo.change("add", id, text.text.toString()); TodoWidget().updateAll(this@QuickAddActivity); SyncWorker.enqueue(this@QuickAddActivity); finish() }
    finally { save.isEnabled = true }
   }
  }
  root.addView(save); root.addView(button("취소") { finish() }); setContentView(root); text.requestFocus()
 }
}
