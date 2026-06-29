package com.foodscreen.tvapp.sync

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiClient {
    @GET("sync/{deviceId}")
    suspend fun getSyncPlaylist(@Path("deviceId") deviceId: String): Response<SyncPayload>

    @POST("sync/{deviceId}/heartbeat")
    suspend fun sendHeartbeat(
        @Path("deviceId") deviceId: String,
        @Body heartbeat: HeartbeatRequest
    ): Response<Unit>
}

data class SyncPayload(
    val version: String,
    val playlistId: String,
    val items: List<SyncPlaylistItem>,
    val updatedAt: String
)

data class SyncPlaylistItem(
    val id: String,
    val order: Int,
    val videoUrl: String,
    val durationSeconds: Float,
    val overlayElements: List<SyncOverlayElement>
)

data class SyncOverlayElement(
    val id: String,
    val type: String,
    val content: String,
    val xPercent: Float,
    val yPercent: Float,
    val widthPercent: Float,
    val fontSize: Int,
    val fontFamily: String,
    val fontWeight: String,
    val color: String,
    val backgroundColor: String?,
    val backgroundOpacity: Float,
    val padding: Int,
    val borderRadius: Int,
    val textAlign: String,
    val zIndex: Int
)

data class HeartbeatRequest(
    val status: String,
    val currentVersion: String?
)
