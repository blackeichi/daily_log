package com.dailylog.todo
import android.content.Context
import androidx.compose.runtime.Composable
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
 override suspend fun provideGlance(context: Context, id: GlanceId) {
  val state = TodoRepository(context).read(); provideContent { Content(state) }
 }
 @Composable private fun Content(state: JSONObject) {
  Column(GlanceModifier.fillMaxSize().background(Color(0xFFF5F7F3)).padding(12.dp)) {
   Row(GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
    Text("오늘 할 일", GlanceModifier.defaultWeight().clickable(actionStartActivity<MainActivity>()), style = TextStyle(fontSize = 18.sp, fontWeight = FontWeight.Bold, color = ColorProvider(Color(0xFF174C39))))
    Button("+", actionStartActivity<QuickAddActivity>())
    Button("↻", actionRunCallback<RefreshAction>())
   }
   if (state.optString("refreshToken").isEmpty()) {
    Text("앱에서 로그인해 주세요", GlanceModifier.padding(12.dp).clickable(actionStartActivity<MainActivity>()))
   } else {
    Text(state.optString("status", "새로고침해 주세요"), style = TextStyle(fontSize = 11.sp), maxLines = 2)
    if (state.optJSONObject("pending")?.optString("action") == "delete" && !state.optBoolean("attempted")) Button("삭제 취소", actionRunCallback<UndoAction>())
    androidx.glance.appwidget.lazy.LazyColumn(GlanceModifier.fillMaxWidth().defaultWeight()) {
     val entries = TodoState.items(state)
     items(entries.size) { index ->
      val item = entries[index]
      Row(GlanceModifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
       if (item.optString("type") == "section") Text(item.optString("text"), style = TextStyle(fontWeight = FontWeight.Bold))
       else {
        Text((if (item.optBoolean("isDone")) "☑  " else "☐  ") + item.optString("text"), GlanceModifier.defaultWeight().padding(6.dp).clickable(actionRunCallback<CompleteAction>(actionParametersOf(ItemId to item.getLong("id"), Done to !item.optBoolean("isDone")))), maxLines = 2)
        if (TodoState.canDelete(item)) Button("×", actionRunCallback<DeleteAction>(actionParametersOf(ItemId to item.getLong("id"))))
        else Text("🔒", GlanceModifier.padding(6.dp))
       }
      }
     }
     if (entries.isEmpty()) item { Text("+ 를 눌러 오늘 할 일을 추가하세요", GlanceModifier.padding(12.dp)) }
    }
    if (state.optLong("lastSync") > 0) Text("최근 동기화 " + java.text.SimpleDateFormat("MM/dd HH:mm", java.util.Locale.KOREA).format(java.util.Date(state.getLong("lastSync"))), style = TextStyle(fontSize = 10.sp))
   }
  }
 }
}
val ItemId = ActionParameters.Key<Long>("itemId")
val Done = ActionParameters.Key<Boolean>("done")
class TodoWidgetReceiver : GlanceAppWidgetReceiver() { override val glanceAppWidget: GlanceAppWidget = TodoWidget() }
private suspend fun perform(context: Context, block: suspend () -> Unit) {
 try { block() } catch (e: Exception) {
  kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.Main) { android.widget.Toast.makeText(context, e.message ?: "앱에서 동기화 상태를 확인해 주세요", android.widget.Toast.LENGTH_LONG).show() }
 }
 TodoWidget().updateAll(context)
}
class CompleteAction : ActionCallback {
 override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) = perform(context) { TodoRepository(context).change("complete", parameters[ItemId]!!, done = parameters[Done]!!); SyncWorker.enqueue(context) }
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
