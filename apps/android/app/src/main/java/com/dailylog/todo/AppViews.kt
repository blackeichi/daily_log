package com.dailylog.todo

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.text.InputType
import android.text.method.PasswordTransformationMethod
import android.view.Gravity
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.*

/** Shared with the web UI: stone-100 canvas, white cards, stone-700 actions. */
internal object AppStyle {
 val canvas = Color.rgb(245, 245, 244)
 val ink = Color.rgb(41, 37, 36)
 val muted = Color.rgb(120, 113, 108)
 val border = Color.rgb(214, 211, 209)
 val primary = Color.rgb(68, 64, 60)
 fun dp(context: Context, value: Int) = (value * context.resources.displayMetrics.density).toInt()
 fun surface(context: Context, color: Int = Color.WHITE, outline: Boolean = true) = GradientDrawable().apply {
  setColor(color); cornerRadius = dp(context, 8).toFloat()
  if (outline) setStroke(dp(context, 1), border)
 }
 fun text(context: Context, value: String, size: Float = 14f) = TextView(context).apply {
  text = value; textSize = size; setTextColor(ink)
  setPadding(0, dp(context, 8), 0, dp(context, 8))
 }
 fun input(context: Context, hint: String, type: Int = InputType.TYPE_CLASS_TEXT) = EditText(context).apply {
  this.hint = hint
  // setSingleLine changes the transformation; configure password masking AFTER it.
  isSingleLine = true; inputType = type
  if (type and InputType.TYPE_MASK_VARIATION == InputType.TYPE_TEXT_VARIATION_PASSWORD) {
   transformationMethod = PasswordTransformationMethod.getInstance(); isSaveEnabled = false
  }
  textSize = 15f; typeface = Typeface.DEFAULT
  minHeight = dp(context, 52); setTextColor(ink); setHintTextColor(muted)
  setPadding(dp(context, 12), dp(context, 8), dp(context, 12), dp(context, 8))
  background = surface(context)
  setOnFocusChangeListener { _, focused ->
   background = surface(context).apply { if (focused) setStroke(dp(context, 2), primary) }
  }
 }
 fun iconButton(context: Context, icon: Int, description: String, action: () -> Unit) = ImageButton(context).apply {
  setImageResource(icon); contentDescription = description
  setPadding(dp(context, 14), dp(context, 14), dp(context, 14), dp(context, 14))
  background = RippleDrawable(ColorStateList.valueOf(0x18000000), surface(context, Color.TRANSPARENT, false), null)
  layoutParams = LinearLayout.LayoutParams(dp(context, 48), dp(context, 48))
  setOnClickListener { action() }
 }
 fun button(context: Context, value: String, primaryAction: Boolean = false, action: () -> Unit) = Button(context).apply {
  text = value; isAllCaps = false; textSize = 14f; minHeight = dp(context, 48)
  setPadding(dp(context, 14), dp(context, 8), dp(context, 14), dp(context, 8))
  setTextColor(ColorStateList(arrayOf(intArrayOf(-android.R.attr.state_enabled), intArrayOf()), intArrayOf(muted, if (primaryAction) Color.WHITE else ink)))
  background = RippleDrawable(ColorStateList.valueOf(0x22000000), surface(context, if (primaryAction) primary else Color.WHITE, !primaryAction), null)
  stateListAnimator = null
  layoutParams = LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(context, 8); bottomMargin = dp(context, 4) }
  setOnClickListener { action() }
 }
}

/** Visibility is opt-in and never changes the password stored in the field. */
internal class PasswordField(context: Context) : LinearLayout(context) {
 val input = AppStyle.input(context, "비밀번호를 입력해주세요.", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD)
 val toggle = AppStyle.button(context, "표시") { setVisible(input.transformationMethod != null) }
 init {
  orientation = HORIZONTAL; gravity = Gravity.CENTER_VERTICAL
  input.setAutofillHints(View.AUTOFILL_HINT_PASSWORD)
  input.imeOptions = EditorInfo.IME_ACTION_DONE
  addView(input, LayoutParams(0, -2, 1f))
  addView(toggle, LayoutParams(-2, -2).apply { leftMargin = AppStyle.dp(context, 8) })
  mask()
 }
 private fun setVisible(visible: Boolean) {
  val start = input.selectionStart; val end = input.selectionEnd
  input.transformationMethod = if (visible) null else PasswordTransformationMethod.getInstance()
  if (start >= 0 && end >= 0) input.setSelection(start, end)
  toggle.text = if (visible) "숨김" else "표시"
  toggle.contentDescription = if (visible) "비밀번호 숨기기" else "비밀번호 표시하기"
 }
 fun mask() = setVisible(false)
}

internal class LoginPanel(context: Context, submit: (String, String) -> Unit) : LinearLayout(context) {
 val email = AppStyle.input(context, "이메일을 입력해주세요.", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
 val password = PasswordField(context)
 val error = AppStyle.text(context, "", 13f).apply { setTextColor(Color.rgb(185, 28, 28)); visibility = GONE; accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE }
 val login = AppStyle.button(context, "로그인", true) {
  if (email.text.isBlank()) { email.error = "이메일을 입력해주세요."; email.requestFocus() }
  else if (password.input.text.isEmpty()) { password.input.error = "비밀번호를 입력해주세요."; password.input.requestFocus() }
  else { error.visibility = GONE; submit(email.text.toString().trim(), password.input.text.toString()) }
 }
 init {
  orientation = VERTICAL; val padding = AppStyle.dp(context, 24); setPadding(padding, padding, padding, padding)
  background = AppStyle.surface(context); elevation = AppStyle.dp(context, 2).toFloat()
  addView(AppStyle.text(context, "로그인", 22f).apply { setTypeface(null, Typeface.BOLD) })
  addView(AppStyle.text(context, "daily-log 계정으로 오늘의 할 일을 이어가세요.").apply { setTextColor(AppStyle.muted) })
  addView(AppStyle.text(context, "이메일", 13f)); addView(email)
  addView(AppStyle.text(context, "비밀번호", 13f)); addView(password)
  addView(error); addView(login)
  email.setAutofillHints(View.AUTOFILL_HINT_USERNAME); email.imeOptions = EditorInfo.IME_ACTION_NEXT
  password.input.setOnEditorActionListener { _, action, _ -> if (action == EditorInfo.IME_ACTION_DONE) { if (login.isEnabled) login.performClick(); true } else false }
 }
 fun busy(value: Boolean) { login.isEnabled = !value; login.text = if (value) "로그인 중…" else "로그인" }
 fun showError(message: String) { error.text = message; error.visibility = VISIBLE }
}
