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
 internal val passwords = mutableListOf<PasswordField>()
 protected fun column() = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(20), dp(24), dp(20), dp(24)); setBackgroundColor(AppStyle.canvas) }
 protected fun label(text: String, size: Float = 16f) = AppStyle.text(this, text, size)
 protected fun button(text: String, action: () -> Unit) = AppStyle.button(this, text, text == "+ 할 일 추가" || text == "추가", action)
 protected fun input(hint: String, type: Int = InputType.TYPE_CLASS_TEXT) = AppStyle.input(this, hint, type)
 override fun onPause() { passwords.forEach { it.mask() }; super.onPause() }
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
    catch (e: Exception) { if (e is CancellationException) throw e; Toast.makeText(this@MainActivity, "저장소를 열 수 없습니다. 앱 설정에서 데이터를 초기화한 뒤 로그인해 주세요.", Toast.LENGTH_LONG).show(); break }
    delay(1000)
   }
  }
 }
 override fun onPause() { poll?.cancel(); super.onPause() }
 private fun render(state: JSONObject) {
  passwords.clear()
  val root = column()
  root.setOnApplyWindowInsetsListener { view, insets -> view.setPadding(dp(20) + insets.systemWindowInsetLeft, dp(24) + insets.systemWindowInsetTop, dp(20) + insets.systemWindowInsetRight, dp(24) + insets.systemWindowInsetBottom); insets }
  setContentView(ScrollView(this).apply { addView(root) })
  root.addView(label("daily-log", 24f).apply { setTypeface(null, Typeface.BOLD); letterSpacing = -0.03f })
  if (state.optString("refreshToken").isEmpty()) {
   root.addView(label("기록하는 하루, 가벼워지는 할 일", 14f).apply { setTextColor(AppStyle.muted) })
   lateinit var panel: LoginPanel
   panel = LoginPanel(this) { email, password ->
    panel.busy(true)
    scope.launch {
     try { repo.login(email, password); panel.password.input.text.clear(); SyncWorker.enqueue(this@MainActivity); rendered = "" }
     catch (e: Exception) { if (e is CancellationException) throw e; panel.showError(e.message ?: "로그인하지 못했어요. 다시 시도해주세요.") }
     finally { panel.busy(false) }
    }
   }
   passwords.add(panel.password)
   root.addView(panel, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(32); bottomMargin = dp(24) })
   root.addView(label("홈 화면 위젯에서도 할 일을 확인하고 체크하세요.", 13f).apply { gravity = Gravity.CENTER; setTextColor(AppStyle.muted) })
   return
  }
  root.addView(label("오늘 할 일", 26f).apply { setTypeface(null, Typeface.BOLD) })
  val todos = TodoState.items(state).filter { it.optString("type") != "section" }
  root.addView(label("${todos.count { it.optBoolean("isDone") }} / ${todos.size} 완료", 18f))
  root.addView(label(state.optString("status", "목록을 불러오는 중…"), 13f))
  if (state.optLong("lastSync") > 0) root.addView(label("최근 동기화: " + java.text.SimpleDateFormat("MM/dd HH:mm", java.util.Locale.KOREA).format(java.util.Date(state.getLong("lastSync"))), 12f))
  val pending = state.optJSONObject("pending")
  if (pending != null) root.addView(label("동기화 대기 · ${when (pending.optString("action")) { "add" -> "할 일 추가"; "delete" -> "할 일 삭제"; else -> "완료 상태 변경" }}", 12f).apply { setTextIsSelectable(true) })
  if (pending?.optString("action") == "delete" && !state.optBoolean("attempted")) root.addView(button("삭제 취소") { task { repo.undoDelete(); TodoWidget().updateAll(this@MainActivity) } })
  if (state.optBoolean("blocked")) {
   root.addView(label("서버 변경 또는 인증 문제로 동기화가 중단됐어요. 기기의 변경 내용을 확인한 뒤 서버 목록을 불러와 주세요.", 13f))
   root.addView(button("서버 목록 다시 불러오기") {
    AlertDialog.Builder(this).setTitle("기기의 대기 중 변경을 취소할까요?").setMessage("기기의 변경을 취소하고 서버 목록으로 바꿉니다. 필요한 내용은 먼저 복사해 두세요.")
     .setNegativeButton("유지", null).setPositiveButton("불러오기") { _, _ -> task { repo.discardConflict(); TodoWidget().updateAll(this@MainActivity) } }.show()
   })
   root.addView(button("계정 다시 인증") {
    val password = PasswordField(this).also { passwords.add(it) }
    AlertDialog.Builder(this).setTitle("다시 로그인").setView(password).setNegativeButton("취소", null).setPositiveButton("로그인") { _, _ -> task { repo.reauthenticate(password.input.text.toString()); SyncWorker.enqueue(this@MainActivity) } }.show()
   })
  }
  val actions = LinearLayout(this)
  actions.addView(button("+ 할 일 추가") { startActivity(Intent(this, QuickAddActivity::class.java)) }, LinearLayout.LayoutParams(0, dp(52), 1f))
  actions.addView(button("새로고침") { SyncWorker.enqueue(this) }, LinearLayout.LayoutParams(-2, dp(52)).apply { leftMargin = dp(8) }); root.addView(actions)
  if (todos.isEmpty()) root.addView(label("오늘 해보고 싶은 일을 하나 적어보세요."))
  for (item in TodoState.items(state)) {
   if (item.optString("type") == "section") { root.addView(label(item.optString("text"), 18f).apply { setTypeface(null, Typeface.BOLD) }); continue }
   val card = LinearLayout(this).apply {
    orientation = LinearLayout.VERTICAL; setPadding(dp(12), dp(4), dp(12), dp(8)); background = AppStyle.surface(this@MainActivity)
    layoutParams = LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(8) }
   }
   val row = LinearLayout(this).apply { gravity = Gravity.CENTER_VERTICAL }
   val check = CheckBox(this).apply {
    text = item.optString("text"); textSize = 16f
    setTextColor(if (item.optBoolean("isDone")) AppStyle.muted else AppStyle.ink)
    buttonTintList = android.content.res.ColorStateList.valueOf(AppStyle.primary)
    if (item.optBoolean("isDone")) paintFlags = paintFlags or android.graphics.Paint.STRIKE_THRU_TEXT_FLAG
     minHeight = dp(56); isChecked = item.optBoolean("isDone"); isEnabled = pending == null && !state.optBoolean("blocked")
    setOnCheckedChangeListener { _, done -> task { repo.change("complete", item.getLong("id"), done = done); TodoWidget().updateAll(this@MainActivity); SyncWorker.enqueue(this@MainActivity) } }
   }
   row.addView(check, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
   if (TodoState.canDelete(item)) row.addView(button("삭제") { task { repo.change("delete", item.getLong("id")); TodoWidget().updateAll(this@MainActivity); SyncWorker.enqueue(this@MainActivity, 8) } }.apply { layoutParams = LinearLayout.LayoutParams(-2, -2); isEnabled = pending == null && !state.optBoolean("blocked") })
   else row.addView(label("잠금", 12f).apply { setTextColor(AppStyle.muted); contentDescription = "잠긴 항목, 삭제할 수 없음" })
   card.addView(row)
   if (item.optString("description").isNotEmpty()) card.addView(label(item.optString("description"), 13f).apply { setTextIsSelectable(true) })
   val children = item.optJSONArray("children")
   if (children != null && children.length() > 0) card.addView(label("하위 항목 ${children.length()}개 · 상세 편집은 웹에서", 12f))
   root.addView(card)
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

