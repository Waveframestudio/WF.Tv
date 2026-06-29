package com.foodscreen.tvapp.player

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import com.foodscreen.tvapp.sync.SyncPlaylistItem
import java.io.File

class ExoPlayerManager(private val context: Context) {
    val player: ExoPlayer = ExoPlayer.Builder(context).build().apply {
        repeatMode = Player.REPEAT_MODE_ALL
    }

    private var currentPlaylist: List<SyncPlaylistItem> = emptyList()
    private var onVideoChangedListener: ((SyncPlaylistItem) -> Unit)? = null

    init {
        player.addListener(object : Player.Listener {
            override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                val index = player.currentMediaItemIndex
                if (index in currentPlaylist.indices) {
                    onVideoChangedListener?.invoke(currentPlaylist[index])
                }
            }
        })
    }

    fun setPlaylist(items: List<SyncPlaylistItem>) {
        currentPlaylist = items
        player.stop()
        player.clearMediaItems()

        items.forEach { item ->
            // Si el video está descargado localmente, reproducir local. Si no, streaming fallback.
            val fileName = item.videoUrl.substring(item.videoUrl.lastIndexOf('/') + 1)
            val localFile = File(context.filesDir, "videos/$fileName")

            val mediaItem = if (localFile.exists()) {
                MediaItem.fromUri(localFile.absolutePath)
            } else {
                MediaItem.fromUri(item.videoUrl)
            }
            player.addMediaItem(mediaItem)
        }

        player.prepare()
        player.playWhenReady = true

        if (items.isNotEmpty()) {
            onVideoChangedListener?.invoke(items[0])
        }
    }

    fun setOnVideoChangedListener(listener: (SyncPlaylistItem) -> Unit) {
        onVideoChangedListener = listener
    }

    fun release() {
        player.release()
    }
}
