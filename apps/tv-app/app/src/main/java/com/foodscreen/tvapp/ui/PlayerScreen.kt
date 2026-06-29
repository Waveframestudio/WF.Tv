package com.foodscreen.tvapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.ui.PlayerView
import com.foodscreen.tvapp.data.db.AppDatabase
import com.foodscreen.tvapp.player.ExoPlayerManager
import com.foodscreen.tvapp.player.OverlayRenderer
import com.foodscreen.tvapp.sync.SyncOverlayElement
import com.foodscreen.tvapp.sync.SyncPayload
import com.foodscreen.tvapp.sync.SyncPlaylistItem
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext

@Composable
fun PlayerScreen(
    deviceId: String,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val database = remember { AppDatabase::class.java.let { db ->
        androidx.room.Room.databaseBuilder(context, db, "foodscreen_db").build()
    }}

    var playlistPayload by remember { mutableStateOf<SyncPayload?>(null) }
    var currentItem by remember { mutableStateOf<SyncPlaylistItem?>(null) }
    var activeOverlays by remember { mutableStateOf<List<SyncOverlayElement>>(emptyList()) }

    val exoPlayerManager = remember { ExoPlayerManager(context) }

    // 1. Cargar playlist de SQLite al iniciar
    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            val cache = database.playlistDao().getActivePlaylist()
            if (cache != null) {
                val payload = Gson().fromJson(cache.jsonSnapshot, SyncPayload::class.java)
                playlistPayload = payload
                withContext(Dispatchers.Main) {
                    exoPlayerManager.setPlaylist(payload.items)
                }
            }
        }
    }

    // Listener de avance de video
    DisposableEffect(exoPlayerManager) {
        exoPlayerManager.setOnVideoChangedListener { item ->
            currentItem = item
            activeOverlays = item.overlayElements
        }
        onDispose {
            exoPlayerManager.release()
        }
    }

    Box(modifier = modifier.fillMaxSize().background(Color.Black)) {
        if (playlistPayload == null || playlistPayload?.items?.isEmpty() == true) {
            // Pantalla de Vinculación / Carga
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = androidx.compose.foundation.layout.Arrangement.Center
            ) {
                Text(
                    text = "Vincula esta pantalla",
                    color = Color.White,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Código del Dispositivo:",
                    color = Color.LightGray,
                    fontSize = 18.sp,
                    modifier = Modifier.padding(top = 16.dp)
                )
                Text(
                    text = deviceId.uppercase().take(8),
                    color = Color(0xFFF43F5E), // Brand primary
                    fontSize = 48.sp,
                    fontWeight = FontWeight.ExtraBold,
                    modifier = Modifier.padding(top = 8.dp)
                )
                Text(
                    text = "Ingresa este código en el panel web admin para activar la pantalla.",
                    color = Color.Gray,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 12.dp)
                )
            }
        } else {
            // Video Player
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        useController = false // Sin controles en pantalla
                        player = exoPlayerManager.player
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            // Overlays compositor
            OverlayRenderer(elements = activeOverlays)
        }
    }
}
