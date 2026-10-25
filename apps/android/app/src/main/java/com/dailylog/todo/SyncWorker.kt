package com.dailylog.todo
import android.content.Context
import androidx.work.*
import androidx.glance.appwidget.updateAll
import java.util.concurrent.TimeUnit
class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
 override suspend fun doWork(): Result = try {
  val complete = TodoRepository(applicationContext).sync(); TodoWidget().updateAll(applicationContext)
  if (complete) Result.success() else Result.retry()
 } catch (_: Exception) { Result.retry() }
 companion object {
  fun enqueue(context: Context, delaySeconds: Long = 0) {
   val request = OneTimeWorkRequestBuilder<SyncWorker>().setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).setInitialDelay(delaySeconds, TimeUnit.SECONDS).setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.SECONDS).build()
   WorkManager.getInstance(context).enqueueUniqueWork("todo-sync", ExistingWorkPolicy.REPLACE, request)
  }
  fun schedule(context: Context) {
   WorkManager.getInstance(context).enqueueUniquePeriodicWork("todo-periodic", ExistingPeriodicWorkPolicy.KEEP, PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES).setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build())
  }
 }
}
