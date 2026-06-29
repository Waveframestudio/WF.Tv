package com.foodscreen.tvapp.data.db

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase

@Entity(tableName = "device_config")
data class DeviceConfig(
    @PrimaryKey val key: String,
    val value: String
)

@Entity(tableName = "cached_playlists")
data class CachedPlaylist(
    @PrimaryKey val id: String,
    val version: String,
    val jsonSnapshot: String, // Contiene la estructura completa con overlays en JSON
    val syncedAt: Long
)

@Dao
interface ConfigDao {
    @Query("SELECT value FROM device_config WHERE `key` = :key LIMIT 1")
    suspend fun get(key: String): String?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(config: DeviceConfig)
}

@Dao
interface PlaylistDao {
    @Query("SELECT * FROM cached_playlists LIMIT 1")
    suspend fun getActivePlaylist(): CachedPlaylist?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun savePlaylist(playlist: CachedPlaylist)
}

@Database(entities = [DeviceConfig::class, CachedPlaylist::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun configDao(): ConfigDao
    abstract fun playlistDao(): PlaylistDao
}
