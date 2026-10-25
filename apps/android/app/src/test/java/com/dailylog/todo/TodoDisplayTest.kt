package com.dailylog.todo

import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test

class TodoDisplayTest {
 @Test fun childrenFollowParentAndKeepTheirOwnCompletionState() {
  val state = JSONObject("""{"snapshot":{"todayList":[
   {"id":1,"type":"section","text":"저녁"},
   {"id":2,"text":"책 읽기","isDone":false,"children":[{"id":3,"text":"20분 읽기","isDone":true},{"id":4,"text":"메모","isDone":false}]},
   {"id":5,"text":"산책"}
  ]}}""")
  val original = state.toString()
  val rows = todoDisplayRows(state)
  assertEquals(listOf(1,2,3,4,5),rows.map { it.item.getInt("id") })
  assertEquals(listOf(false,false,true,true,false),rows.map { it.isChild })
  assertTrue(rows[2].item.getBoolean("isDone"))
  assertFalse(rows[3].item.getBoolean("isDone"))
  assertEquals(original,state.toString())
 }
}
