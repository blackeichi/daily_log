package com.dailylog.todo

import android.content.Context
import android.graphics.Color
import android.graphics.Paint
import android.view.Gravity
import android.view.View
import android.view.WindowInsets
import android.widget.*
import org.json.JSONObject

/** Insets belong to the viewport, not to the scrolling content. */
internal class SafeAreaLayout(context: Context) : LinearLayout(context) {
 init { orientation = VERTICAL; setBackgroundColor(AppStyle.canvas) }
 @Suppress("DEPRECATION")
 override fun onApplyWindowInsets(insets: WindowInsets): WindowInsets {
  setPadding(insets.systemWindowInsetLeft, insets.systemWindowInsetTop, insets.systemWindowInsetRight, insets.systemWindowInsetBottom)
  return insets.consumeSystemWindowInsets()
 }
}

internal class TodoListView(
 context: Context,
 state: JSONObject,
 onComplete: (JSONObject, Boolean) -> Unit,
 onDelete: (JSONObject) -> Unit,
 onDetails: (JSONObject, Long) -> Unit = { _, _ -> },
) : LinearLayout(context) {
 init {
  orientation = VERTICAL
  val canCheck = state.optString("refreshToken").isNotEmpty()
  val enabled = !state.has("pending") && !state.optBoolean("blocked")
  var group: LinearLayout? = null
  val entries = TodoState.items(state)
  if (entries.none { it.optString("type") != "section" }) addView(AppStyle.text(context, "오늘 해보고 싶은 일을 하나 적어보세요.").apply { setTextColor(AppStyle.muted) })
  for (item in entries) {
   if (item.optString("type") == "section") {
    group = null
    addView(AppStyle.text(context, item.optString("text"), 13f).apply {
     setTypeface(null, android.graphics.Typeface.BOLD); setTextColor(AppStyle.muted)
     setPadding(AppStyle.dp(context, 4), AppStyle.dp(context, 20), 0, AppStyle.dp(context, 8))
    })
    continue
   }
   if (group == null) {
    group = LinearLayout(context).apply {
     orientation = VERTICAL; background = AppStyle.surface(context, Color.WHITE, false)
     setPadding(AppStyle.dp(context, 4), AppStyle.dp(context, 2), AppStyle.dp(context, 4), AppStyle.dp(context, 2))
    }
    addView(group, LayoutParams(-1, -2))
   } else group.addView(View(context).apply { setBackgroundColor(Color.rgb(245,245,244)) }, LayoutParams(-1, AppStyle.dp(context, 1)).apply { leftMargin = AppStyle.dp(context, 44); rightMargin = AppStyle.dp(context, 12) })
   val row = LinearLayout(context).apply { gravity = Gravity.CENTER_VERTICAL; minimumHeight = AppStyle.dp(context, 52) }
   val done = item.optBoolean("isDone")
   val check = AppStyle.iconButton(context, if (done) R.drawable.ic_checked else R.drawable.ic_unchecked, "${item.optString("text")} · ${if (done) "완료 취소" else "완료하기"}") { onComplete(item, !done) }.apply { isEnabled = canCheck; alpha = if (canCheck) 1f else 0.45f }
   row.addView(check)
   val body = LinearLayout(context).apply { orientation = VERTICAL; setPadding(0, AppStyle.dp(context, 10), 0, AppStyle.dp(context, 10)); isEnabled = canCheck; setOnClickListener { onDetails(item, 0) } }
   body.addView(AppStyle.text(context, item.optString("text"), 15f).apply {
    setPadding(0, 0, 0, 0); setTextColor(if (done) AppStyle.muted else AppStyle.ink)
    if (done) paintFlags = paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
   })
   val children = item.optJSONArray("children")
   val detail = item.optString("description")
   if (detail.isNotEmpty()) body.addView(AppStyle.text(context, detail, 12f).apply { setPadding(0, AppStyle.dp(context, 4), 0, 0); setTextColor(AppStyle.muted); maxLines = 2; ellipsize = android.text.TextUtils.TruncateAt.END })
   row.addView(body, LayoutParams(0, -2, 1f))
   row.addView(AppStyle.iconButton(context, R.drawable.ic_more, "상세 및 수정") { onDetails(item, 0) })
   if (TodoState.canDelete(item)) row.addView(AppStyle.iconButton(context, R.drawable.ic_delete, "${item.optString("text")} 삭제") { onDelete(item) }.apply { isEnabled = enabled; alpha = if (enabled) 0.65f else 0.3f })
   else row.addView(ImageView(context).apply { setImageResource(R.drawable.ic_lock); alpha = 0.4f; contentDescription = "잠긴 항목"; setPadding(AppStyle.dp(context, 16), AppStyle.dp(context, 16), AppStyle.dp(context, 16), AppStyle.dp(context, 16)) }, LayoutParams(AppStyle.dp(context, 48), AppStyle.dp(context, 48)))
   group.addView(row)
   if (children != null) for (index in 0 until children.length()) {
    val child = children.getJSONObject(index)
    val childDone = child.optBoolean("isDone")
    val childRow = LinearLayout(context).apply {
     tag = "subtodo"; gravity = Gravity.CENTER_VERTICAL; minimumHeight = AppStyle.dp(context, 48)
     setPadding(AppStyle.dp(context, 20), 0, AppStyle.dp(context, 12), 0)
     contentDescription = "하위 할 일: ${child.optString("text")}, ${if (childDone) "완료" else "미완료"}. 개별 체크할 수 있습니다."
     importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_YES
    }
    childRow.setOnClickListener { onDetails(child, item.getLong("id")) }
    childRow.addView(AppStyle.iconButton(context, if (childDone) R.drawable.ic_checked else R.drawable.ic_unchecked, "하위 할 일 체크") {
     onComplete(TodoState.copy(child).put("_parentId", item.getLong("id")), !childDone)
    })
    childRow.addView(AppStyle.text(context, child.optString("text"), 13f).apply {
     setPadding(AppStyle.dp(context, 8), 0, 0, 0)
     setTextColor(AppStyle.muted)
     importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
     if (childDone) paintFlags = paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
    }, LayoutParams(0, -2, 1f))
    group.addView(childRow)
   }
  }
 }
}
