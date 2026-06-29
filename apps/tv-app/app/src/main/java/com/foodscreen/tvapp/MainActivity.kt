package com.foodscreen.tvapp

import android.os.Bundle
import android.view.View
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.Surface
import com.foodscreen.tvapp.ui.PlayerScreen
import dagger.hilt.android.AndroidEntryPoint
import java.util.UUID
import javax.inject.Inject
import com.foodscreen.tvapp.data.db.AppDatabase
import com.foodscreen.tvapp.data.db.DeviceConfig
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var database: AppDatabase

    @OptIn(ExperimentalTvMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Forzar Pantalla Completa / Modo Kiosco
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        )

        // Generar o recuperar UUID único para este dispositivo TV Box
        val mainScope = MainScope()
        mainScope.launch {
            val deviceIdDao = database.configDao()
            var deviceId = deviceIdDao.get("device_id")
            if (deviceId == null) {
                val newId = UUID.randomUUID().toString()
                deviceIdDao.insert(DeviceConfig("device_id", newId))
                deviceId = newId
            }

            setContent {
                Surface(modifier = Modifier.fillMaxSize()) {
                    PlayerScreen(deviceId = deviceId)
                }
            }
        }
    }
}
