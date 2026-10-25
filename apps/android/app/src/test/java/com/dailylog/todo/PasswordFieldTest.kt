package com.dailylog.todo

import android.text.method.PasswordTransformationMethod
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class PasswordFieldTest {
 @Test fun passwordIsMaskedByDefaultAndNotSavedInViewState() {
  val field = PasswordField(RuntimeEnvironment.getApplication())
  field.input.setText("private-password")
  assertTrue(field.input.transformationMethod is PasswordTransformationMethod)
  assertFalse(field.input.isSaveEnabled)
  assertNotEquals("private-password", field.input.transformationMethod.getTransformation(field.input.text, field.input).toString())
 }
 @Test fun visibilityTogglePreservesPasswordAndCursorAndCanBeRemasked() {
  val field = PasswordField(RuntimeEnvironment.getApplication())
  field.input.setText("private-password"); field.input.setSelection(4)
  field.toggle.performClick()
  assertNull(field.input.transformationMethod)
  assertEquals(4, field.input.selectionStart)
  field.mask()
  assertTrue(field.input.transformationMethod is PasswordTransformationMethod)
  assertEquals("private-password", field.input.text.toString())
  assertEquals("비밀번호 표시하기", field.toggle.contentDescription)
 }
 @Test fun loginRequiresBothFieldsAndSubmitsPasswordWithoutTrimming() {
  var submitted: Pair<String, String>? = null
  val panel = LoginPanel(RuntimeEnvironment.getApplication()) { email, password -> submitted = email to password }
  panel.login.performClick(); assertNull(submitted)
  panel.email.setText(" user@example.com ")
  panel.login.performClick(); assertNull(submitted)
  panel.password.input.setText(" password ")
  panel.login.performClick()
  assertEquals("user@example.com" to " password ", submitted)
 }
}
