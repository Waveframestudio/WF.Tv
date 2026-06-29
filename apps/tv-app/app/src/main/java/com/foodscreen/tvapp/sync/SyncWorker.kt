package com.foodscreen.tvapp.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.foodscreen.tvapp.data.db.AppDatabase
import com.foodscreen.tvapp.data.db.CachedPlaylist
import com.google.gson.Gson
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.lang.Exception

class SyncWorker(
    private val context: Context,
    workerParams: WorkerParameters,
    private val apiClient: ApiClient,
    private val database: AppDatabase
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val deviceId = database.configDao().get("device_id") ?: return Result.failure()

        try {
            // 1. Reportar status
            apiClient.sendHeartbeat(deviceId, HeartbeatRequest("ONLINE", null))

            // 2. Fetch Playlist
            val response = apiClient.getSyncPlaylist(deviceId)
            if (!response.isSuccessful || response.body() == null) return Result.retry()

            val payload = response.body()!!
            val activeCache = database.playlistDao().getActivePlaylist()

            // Si cambió la versión, descargar nuevos videos y actualizar cache
            if (activeCache == null || activeCache.version != payload.version) {
                // Descargar todos los videos localmente a la carpeta cache
                val gson = Gson()
                val client = OkHttpClient()

                payload.items.forEach { item ->
                    val fileName = item.videoUrl.substring(item.videoUrl.lastIndexOf('/') + 1)
                    val localFile = File(context.filesDir, "videos/$fileName")

                    if (!localFile.exists()) {
                        localFile.parentFile?.mkdirs()
                        val request = Request.Builder().url(item.videoUrl).build()
                        client.newCall(request).execute().use { response ->
                            if (response.isSuccessful) {
                                FileOutputStream(localFile).use { output ->
                                    response.body?.byteStream()?.copyTo(output)
                                }
                            }
                        }
                    }
                }

                // Guardar la playlist en SQLite
                val jsonSnapshot = gson.toJson(payload)
                database.playlistDao().savePlaylist(
                    CachedPlaylist(
                        id = payload.playlistId,
                        version = payload.version,
                        jsonSnapshot = jsonSnapshot,
                        syncedAt = System.currentTimeMillis()
                    )
                )

                // Reportar sync finalizado
                apiClient.sendHeartbeat(deviceId, HeartbeatRequest("ONLINE", payload.version))
            }

            return Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            // Reportar error de sincronización
            try {
                apiClient.sendHeartbeat(deviceId, HeartbeatRequest("ERROR", null))
            } catch (_: Exception) {}
            return Result.retry()
        }
    }
}
