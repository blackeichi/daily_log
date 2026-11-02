package com.dailylog.todo

import java.net.UnknownHostException
import java.net.SocketTimeoutException
import java.net.ConnectException
import javax.net.ssl.SSLException

internal fun userFacingError(error: Exception): String = when (error) {
 is UnknownHostException -> "서버 주소를 찾지 못했어요. 인터넷 연결을 확인하고 Wi-Fi 또는 모바일 데이터로 바꿔 다시 시도해 주세요."
 is SocketTimeoutException -> "서버 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요."
 is ConnectException -> "서버에 연결하지 못했어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요."
 is SSLException -> "안전한 연결을 확인하지 못했어요. 기기 날짜·시간과 네트워크 설정을 확인해 주세요."
 else -> error.message ?: "요청을 처리하지 못했어요. 다시 시도해 주세요."
}
