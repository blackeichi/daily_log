package com.dailylog.todo

import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import java.net.UnknownHostException

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class LoginNetworkTest {
 private class MemoryStore : StateStore {
  var value = JSONObject()
  override fun read() = TodoState.copy(value)
  override fun write(state: JSONObject) { value = TodoState.copy(state) }
 }
 @Test fun transientDnsFailureIsRetriedOnceBeforeSuccessfulLogin() = runBlocking {
  val store = MemoryStore(); var attempts = 0
  val repo = TodoRepository(store,LocalChecks(RuntimeEnvironment.getApplication())) { _,path,_,_ ->
   assertEquals("/auth/mobile/login",path)
   if (++attempts == 1) throw UnknownHostException("test")
   JSONObject().put("accessToken","test-access").put("refreshToken","test-refresh")
  }
  repo.login("test@example.test","fake-password")
  assertEquals(2,attempts); assertEquals("test-refresh",store.read().getString("refreshToken"))
 }
 @Test fun invalidCredentialsAreNotRetried() = runBlocking {
  var attempts=0
  val repo=TodoRepository(MemoryStore(),LocalChecks(RuntimeEnvironment.getApplication())) { _,_,_,_ -> attempts++; throw ApiException(401,"비밀번호 확인") }
  try { repo.login("test@example.test","fake-password"); fail("Expected auth error") } catch (_: ApiException) { }
  assertEquals(1,attempts)
 }
 @Test fun persistentDnsFailureHasBoundedRetriesAndActionableMessage() = runBlocking {
  var attempts=0
  val repo=TodoRepository(MemoryStore(),LocalChecks(RuntimeEnvironment.getApplication())) { _,_,_,_ -> attempts++; throw UnknownHostException("private internal hostname") }
  try { repo.login("test@example.test","fake-password"); fail("Expected DNS error") } catch(e: UnknownHostException) {
   assertTrue(userFacingError(e).contains("Wi-Fi")); assertFalse(userFacingError(e).contains("private internal"))
  }
  assertEquals(2,attempts)
 }
}
