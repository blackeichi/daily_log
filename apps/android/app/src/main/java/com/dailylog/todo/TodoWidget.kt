package com.dailylog.todo
import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.action.*
import androidx.glance.appwidget.*
import androidx.glance.appwidget.action.*
import androidx.glance.layout.*
import androidx.glance.text.*
import androidx.glance.unit.ColorProvider
import org.json.JSONObject

class TodoWidget : GlanceAppWidget() {
 override val sizeMode = SizeMode.Responsive(setOf(androidx.compose.ui.unit.DpSize(220.dp, 180.dp), androidx.compose.ui.unit.DpSize(300.dp, 280.dp)))
 override suspend fun provideGlance(context: Context, id: GlanceId) {
  val repo = TodoRepository(context); val initial = repo.read(); provideContent { val updates = remember { repo.observe() }; val state by updates.collectAsState(initial); Content(state) }
 }
 @Composable private fun IconAction(icon: Int, label: String, action: Action) {
  Image(ImageProvider(icon), label, GlanceModifier.size(48.dp).clickable(action).padding(14.dp))
 }
 @Composable private fun Content(state: JSONObject) {
  val entries = TodoState.items(state)
  val todos = entries.filter { it.optString("type") != "section" }
  val displayRows = todoDisplayRows(state)
  val enabled = !state.has("pending") && !state.optBoolean("blocked")
  val ink = ColorProvider(Color(0xFF292524))
  val muted = ColorProvider(Color(0xFF78716C))
  Column(GlanceModifier.fillMaxSize().background(Color.White).cornerRadius(24.dp).padding(12.dp)) {
   Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
    Column(GlanceModifier.defaultWeight().clickable(actionStartActivity<MainActivity>())) {
     Text("오늘 할 일", style = TextStyle(fontSize = 18.sp, fontWeight = FontWeight.Bold, color = ink), maxLines = 1)
     Text("${todos.count { it.optBoolean("isDone") }} / ${todos.size} 완료", style = TextStyle(fontSize = 11.sp, color = muted))
    }
    IconAction(R.drawable.ic_add, "할 일 추가", actionStartActivity<QuickAddActivity>())
    IconAction(R.drawable.ic_refresh, "새로고침", actionRunCallback<RefreshAction>())
   }
   if (state.optString("refreshToken").isEmpty()) {
    Text("앱에서 로그인하고\n오늘의 할 일을 이어가세요.", GlanceModifier.padding(vertical = 16.dp).clickable(actionStartActivity<MainActivity>()), style = TextStyle(fontSize = 14.sp, color = muted))
   } else {
    if (!enabled) Text(state.optString("status", "동기화 대기"), GlanceModifier.clickable(actionStartActivity<MainActivity>()), style = TextStyle(fontSize = 11.sp, color = muted), maxLines = 2)
    if (state.optJSONObject("pending")?.optString("action") == "delete" && !state.optBoolean("attempted")) Text("삭제 취소", GlanceModifier.fillMaxWidth().padding(vertical = 12.dp).clickable(actionRunCallback<UndoAction>()), style = TextStyle(fontSize = 13.sp, fontWeight = FontWeight.Bold, color = ink))
    androidx.glance.appwidget.lazy.LazyColumn(GlanceModifier.fillMaxWidth().defaultWeight()) {
     items(displayRows.size) { index ->
      val display = displayRows[index]
      val item = display.item
      if (display.isChild) {
       Row(GlanceModifier.fillMaxWidth().height(48.dp).clickable(actionRunCallback<CompleteAction>(actionParametersOf(ItemId to item.getLong("id"), ParentId to display.parentId!!))).padding(start = 30.dp, end = 12.dp, top = 4.dp, bottom = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Image(ImageProvider(if (item.optBoolean("isDone")) R.drawable.ic_checked else R.drawable.ic_child_pending), if (item.optBoolean("isDone")) "하위 항목 완료" else "하위 항목 미완료", GlanceModifier.size(14.dp))
        Spacer(GlanceModifier.width(8.dp))
        Text(item.optString("text"), GlanceModifier.defaultWeight(), style = TextStyle(fontSize = 12.sp, color = muted))
       }
      } else if (item.optString("type") == "section") {
       Text(item.optString("text"), GlanceModifier.fillMaxWidth().padding(top = 12.dp, bottom = 4.dp), style = TextStyle(fontSize = 12.sp, fontWeight = FontWeight.Bold, color = muted), maxLines = 1)
      } else {
       Row(GlanceModifier.fillMaxWidth().height(48.dp), verticalAlignment = Alignment.CenterVertically) {
        val done = item.optBoolean("isDone")
        val complete = actionRunCallback<CompleteAction>(actionParametersOf(ItemId to item.getLong("id"), Done to !done))
        Row(GlanceModifier.defaultWeight().height(48.dp).clickable(complete), verticalAlignment = Alignment.CenterVertically) {
         Image(ImageProvider(if (done) R.drawable.ic_checked else R.drawable.ic_unchecked), if (done) "완료됨" else "미완료", GlanceModifier.size(20.dp))
         Spacer(GlanceModifier.width(10.dp))
         Text(item.optString("text"), GlanceModifier.defaultWeight(), style = TextStyle(fontSize = 14.sp, color = if (done) muted else ink), maxLines = 2)
        }
        if (TodoState.canDelete(item)) {
         if (enabled) IconAction(R.drawable.ic_delete, "${item.optString("text")} 삭제", actionRunCallback<DeleteAction>(actionParametersOf(ItemId to item.getLong("id"))))
         else Image(ImageProvider(R.drawable.ic_delete), "동기화 대기 중", GlanceModifier.size(48.dp).padding(16.dp))
        } else Image(ImageProvider(R.drawable.ic_lock), "잠긴 항목", GlanceModifier.size(48.dp).padding(17.dp))
       }
      }
     }
     if (todos.isEmpty()) item { Text("+ 버튼으로 할 일을 추가하세요", GlanceModifier.padding(vertical = 16.dp), style = TextStyle(fontSize = 13.sp, color = muted)) }
    }
    if (state.optLong("lastSync") > 0) Text("체크는 기기에 저장 · 목록 " + java.text.SimpleDateFormat("HH:mm", java.util.Locale.KOREA).format(java.util.Date(state.getLong("lastSync"))), GlanceModifier.padding(top = 6.dp), style = TextStyle(fontSize = 10.sp, color = muted))
   }
  }
 }
}
val ItemId = ActionParameters.Key<Long>("itemId")
val ParentId = ActionParameters.Key<Long>("parentId")
val Done = ActionParameters.Key<Boolean>("done")
class TodoWidgetReceiver : GlanceAppWidgetReceiver() { override val glanceAppWidget: GlanceAppWidget = TodoWidget() }
private suspend fun perform(context: Context, block: suspend () -> Unit) {
 try { block() } catch (e: Exception) {
  kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.Main) { android.widget.Toast.makeText(context, e.message ?: "앱에서 동기화 상태를 확인해 주세요", android.widget.Toast.LENGTH_LONG).show() }
 }
 TodoWidget().updateAll(context)
}
class CompleteAction : ActionCallback {
 override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) = perform(context) { TodoRepository(context).toggle(parameters[ItemId]!!, parameters[ParentId] ?: 0) }
}
class DeleteAction : ActionCallback {
 override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) = perform(context) { TodoRepository(context).change("delete", parameters[ItemId]!!); SyncWorker.enqueue(context, 8) }
}
class RefreshAction : ActionCallback {
 override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) = perform(context) { SyncWorker.enqueue(context) }
}
class UndoAction : ActionCallback {
 override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) = perform(context) { TodoRepository(context).undoDelete() }
}

