package com.dailylog.todo

import android.app.Activity
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Rect
import android.view.View
import android.view.WindowInsets
import android.widget.LinearLayout
import android.widget.ScrollView
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28], qualifiers = "ko-rKR-w360dp-h800dp-mdpi")
class TodoLayoutTest {
 private fun state() = JSONObject().put("refreshToken", "test").put("snapshot", JSONObject().put("todayList", JSONArray("""[
  {"id":1,"type":"section","text":"출근 전"},
  {"id":2,"text":"아침 스트레칭 10분","isDone":true,"isDisabled":true},
  {"id":3,"text":"오늘의 일정 확인하기","isDisabled":true},
  {"id":4,"type":"section","text":"집중할 시간"},
  {"id":5,"text":"프로젝트 화면 정리하기","description":"작은 것부터 하나씩"},
  {"id":6,"text":"긴 항목도 두 줄에 자연스럽게 이어지는지 확인하기","isDisabled":true},
  {"id":7,"type":"section","text":"퇴근 후"},
  {"id":8,"text":"책 읽고 메모 남기기","children":[{"id":9,"text":"20분 읽기"}]}
 ]""")))
 @Test @Config(sdk = [29]) fun systemInsetsStayOnViewportWhenContentScrolls() {
  val controller = Robolectric.buildActivity(Activity::class.java).setup()
  val host = SafeAreaLayout(controller.get())
  val scroll = ScrollView(controller.get())
  scroll.addView(View(controller.get()), android.view.ViewGroup.LayoutParams(360, 1600))
  host.addView(scroll); controller.get().setContentView(host)
  host.dispatchApplyWindowInsets(WindowInsets.Builder().setSystemWindowInsets(android.graphics.Insets.of(0,24,0,32)).build())
  host.measure(View.MeasureSpec.makeMeasureSpec(360, View.MeasureSpec.EXACTLY), View.MeasureSpec.makeMeasureSpec(800, View.MeasureSpec.EXACTLY)); host.layout(0,0,360,800)
  scroll.scrollTo(0,400)
  assertEquals(24, host.paddingTop); assertEquals(32, host.paddingBottom)
  assertTrue(scroll.top >= 24)
  controller.destroy()
 }
 @Test @GraphicsMode(GraphicsMode.Mode.NATIVE)
 fun renderCompactListForVisualReview() {
  val controller = Robolectric.buildActivity(Activity::class.java).setup()
  val context = controller.get()
  val host = SafeAreaLayout(context).apply { setPadding(16,24,16,16) }
  host.addView(AppStyle.text(context,"daily-log",20f))
  val heading=LinearLayout(context)
  heading.addView(AppStyle.text(context,"오늘 할 일",26f), LinearLayout.LayoutParams(0,-2,1f))
  heading.addView(AppStyle.text(context,"1 / 5",14f)); host.addView(heading)
  host.addView(AppStyle.text(context,"10월 25일 일요일 · 동기화됨",12f))
  host.addView(AppStyle.button(context,"+ 할 일 추가",true) {})
  host.addView(TodoListView(context,state(),{_,_->},{_ ->}))
  context.setContentView(host)
  host.measure(View.MeasureSpec.makeMeasureSpec(360, View.MeasureSpec.EXACTLY), View.MeasureSpec.makeMeasureSpec(800, View.MeasureSpec.EXACTLY)); host.layout(0,0,360,800)
  val bitmap=Bitmap.createBitmap(360,800,Bitmap.Config.ARGB_8888)
  host.draw(Canvas(bitmap))
  val output=File("build/ui-review/compact-list.png"); output.parentFile?.mkdirs()
  output.outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG,100,it) }
  assertTrue(host.getChildAt(host.childCount-1).bottom <= 800)
  controller.destroy()
 }
}
