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
 protected fun task(block: suspend () -> Unit) { scope.launch { try { block() } catch (e: Exception) { if (e is CancellationException) throw e; Toast.makeText(this@TaskActivity, userFacingError(e), Toast.LENGTH_LONG).show() } } }
 override fun onDestroy() { scope.cancel(); super.onDestroy() }
}
class MainActivity : TaskActivity() {
 private var rendered = ""
 private var poll: Job? = null
 private var scroll: ScrollView? = null
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
 internal fun render(state: JSONObject) {
  passwords.clear()
  val previousY = scroll?.scrollY ?: 0
  val root = column().apply { setPadding(dp(16), dp(8), dp(16), dp(24)) }
  val host = SafeAreaLayout(this)
  val toolbar = LinearLayout(this).apply { gravity = Gravity.CENTER_VERTICAL; setPadding(dp(20), 0, dp(12), 0) }
  toolbar.addView(label("daily-log", 20f).apply { setTypeface(null, Typeface.BOLD); letterSpacing = -0.04f }, LinearLayout.LayoutParams(0, dp(56), 1f))
  if (state.optString("refreshToken").isNotEmpty()) {
   val menuButton = AppStyle.iconButton(this, R.drawable.ic_more, "더 보기") {}
   menuButton.setOnClickListener { showMenu(menuButton) }
   toolbar.addView(menuButton)
  }
  host.addView(toolbar)
  scroll = ScrollView(this).apply { isFillViewport = true; clipToPadding = true; addView(root); isVerticalScrollBarEnabled = false }
  host.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f))
  setContentView(host)
  window.decorView.systemUiVisibility = android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
  host.requestApplyInsets()
  scroll?.post { scroll?.scrollTo(0, previousY) }
  if (state.optString("refreshToken").isEmpty()) {
   root.addView(label("기록하는 하루, 가벼워지는 할 일", 14f).apply { setTextColor(AppStyle.muted) })
   lateinit var panel: LoginPanel
   panel = LoginPanel(this) { email, password ->
    panel.busy(true)
    scope.launch {
     try { repo.login(email, password); panel.password.input.text.clear(); SyncWorker.enqueue(this@MainActivity); rendered = "" }
     catch (e: Exception) { if (e is CancellationException) throw e; panel.showError(userFacingError(e)) }
     finally { panel.busy(false) }
    }
   }
   passwords.add(panel.password)
   root.addView(panel, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(32); bottomMargin = dp(24) })
   root.addView(label("홈 화면 위젯에서도 할 일을 확인하고 체크하세요.", 13f).apply { gravity = Gravity.CENTER; setTextColor(AppStyle.muted) })
   return
  }
  val todos = TodoState.items(state).filter { it.optString("type") != "section" }
  val heading = LinearLayout(this).apply { gravity = Gravity.CENTER_VERTICAL }
  heading.addView(label("오늘 할 일", 26f).apply { setTypeface(null, Typeface.BOLD) }, LinearLayout.LayoutParams(0, -2, 1f))
  heading.addView(label("${todos.count { it.optBoolean("isDone") }} / ${todos.size}", 14f).apply { setTextColor(AppStyle.muted); contentDescription = "전체 ${todos.size}개 중 ${todos.count { it.optBoolean("isDone") }}개 완료" })
  root.addView(heading)
  root.addView(label(java.text.SimpleDateFormat("M월 d일 EEEE", java.util.Locale.KOREA).format(java.util.Date()), 13f).apply { setPadding(0, 0, 0, dp(12)); setTextColor(AppStyle.muted) })
  val status = if (state.has("pending") || state.optBoolean("blocked")) state.optString("status") else if (state.optLong("lastSync") > 0) "동기화됨 · " + java.text.SimpleDateFormat("HH:mm", java.util.Locale.KOREA).format(java.util.Date(state.getLong("lastSync"))) else state.optString("status", "목록을 불러오는 중…")
  root.addView(label("체크는 기기에 저장", 12f).apply { setTextColor(AppStyle.muted); setPadding(0, 0, 0, dp(4)) })
  root.addView(label(status, 12f).apply { setTextColor(AppStyle.muted); setPadding(0, 0, 0, dp(12)) })
  val pending = state.optJSONObject("pending")
  if (pending != null) root.addView(label("동기화 대기 · ${when (pending.optString("action")) { "add" -> "할 일 추가"; "delete" -> "할 일 삭제"; else -> "할 일 수정" }}", 12f).apply { setTextIsSelectable(true) })
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
  val actions = LinearLayout(this).apply { gravity = Gravity.CENTER_VERTICAL; setPadding(0, dp(4), 0, dp(16)) }
  actions.addView(button("+ 할 일 추가") { startActivity(Intent(this, QuickAddActivity::class.java)) }, LinearLayout.LayoutParams(0, dp(48), 1f))
  actions.addView(AppStyle.iconButton(this, R.drawable.ic_refresh, "새로고침") { SyncWorker.enqueue(this) }.apply { background = AppStyle.surface(this@MainActivity) }, LinearLayout.LayoutParams(dp(48), dp(48)).apply { leftMargin = dp(8) })
  actions.addView(AppStyle.iconButton(this, R.drawable.ic_reset_checks, "전체 체크 해제") { task {
   repo.resetChecks(); val local = repo.read(); rendered = local.toString(); render(local); TodoWidget().updateAll(this@MainActivity)
  } }.apply { background = AppStyle.surface(this@MainActivity) }, LinearLayout.LayoutParams(dp(48), dp(48)).apply { leftMargin = dp(8) })
  root.addView(actions)
  root.addView(TodoListView(this, state,
   onComplete = { item, done -> task {
    if (item.has("_parentId")) repo.completeChild(item.getLong("id"), item.getLong("_parentId"), done)
    else repo.change("complete", item.getLong("id"), done = done)
    val local = repo.read(); rendered = local.toString(); render(local)
    TodoWidget().updateAll(this@MainActivity)
   } },
   onDetails = { item, parentId -> showDetails(item, parentId) },
   onDelete = { item -> task { repo.change("delete", item.getLong("id")); TodoWidget().updateAll(this@MainActivity); SyncWorker.enqueue(this@MainActivity, 8) } }
  ))
 }
 private fun saveEdit(item: JSONObject, parentId: Long, action: String, text: String = "", description: String = "") {
  task { repo.edit(item.getLong("id"), parentId, action, text, description); val local = repo.read(); rendered = local.toString(); render(local); TodoWidget().updateAll(this@MainActivity); SyncWorker.enqueue(this@MainActivity) }
 }
 private fun showDetails(item: JSONObject, parentId: Long) {
  val root = column()
  val title = input("할 일").apply { setText(item.optString("text")) }
  val description = input("설명", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE).apply { setText(item.optString("description")); minLines = 3 }
  root.addView(title); root.addView(description)
  lateinit var dialog: AlertDialog
  root.addView(button("수정 저장") { saveEdit(item, parentId, "edit", title.text.toString(), description.text.toString()); dialog.dismiss() })
  root.addView(button("위로 이동") { saveEdit(item, parentId, "up"); dialog.dismiss() })
  root.addView(button("아래로 이동") { saveEdit(item, parentId, "down"); dialog.dismiss() })
  if (parentId == 0L && item.optString("type") != "section") root.addView(button("하위 할 일 추가") {
   val field = input("하위 할 일")
   AlertDialog.Builder(this).setTitle("하위 할 일 추가").setView(field).setNegativeButton("취소", null).setPositiveButton("추가") { _, _ ->
    val child = JSONObject().put("id", java.security.SecureRandom().nextLong().ushr(11).coerceAtLeast(1))
    saveEdit(child, item.getLong("id"), "addChild", field.text.toString()); dialog.dismiss()
   }.show()
  })
  if (TodoState.canDelete(item)) root.addView(button("삭제") {
   AlertDialog.Builder(this).setTitle("이 할 일을 삭제할까요?").setNegativeButton("취소", null).setPositiveButton("삭제") { _, _ -> saveEdit(item, parentId, "delete"); dialog.dismiss() }.show()
  })
  dialog = AlertDialog.Builder(this).setTitle("할 일 상세").setView(ScrollView(this).apply { addView(root) }).setNegativeButton("닫기", null).create(); dialog.show()
 }
 private fun showMenu(anchor: android.view.View) {
  PopupMenu(this, anchor).apply {
   menu.add("홈 화면에 위젯 추가").setOnMenuItemClickListener {
    val manager = getSystemService(AppWidgetManager::class.java)
    if (manager.isRequestPinAppWidgetSupported) manager.requestPinAppWidget(ComponentName(this@MainActivity, TodoWidgetReceiver::class.java), null, null)
    else Toast.makeText(this@MainActivity, "홈 화면을 길게 누르고 위젯에서 Daily Log Todo를 선택하세요.", Toast.LENGTH_LONG).show()
    true
   }
   menu.add("로그아웃").setOnMenuItemClickListener {
    task { repo.logout(); TodoWidget().updateAll(this@MainActivity); rendered = "" }; true
   }
   show()
  }
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

