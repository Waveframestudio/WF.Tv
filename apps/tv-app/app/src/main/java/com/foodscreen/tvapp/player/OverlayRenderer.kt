package com.foodscreen.tvapp.player

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.absoluteOffset
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.foodscreen.tvapp.sync.SyncOverlayElement
import android.graphics.Color as AndroidColor
import androidx.compose.ui.unit.Dp

@Composable
fun OverlayRenderer(
    elements: List<SyncOverlayElement>,
    modifier: Modifier = Modifier
) {
    val configuration = LocalConfiguration.current
    val screenWidth = configuration.screenWidthDp.dp
    val screenHeight = configuration.screenHeightDp.dp

    Box(modifier = modifier.fillMaxSize()) {
        elements.forEach { el ->
            // Calcular posiciones en píxeles de Compose según el porcentaje absoluto del editor
            val leftOffset = screenWidth * el.xPercent
            val topOffset = screenHeight * el.yPercent
            val width = screenWidth * el.widthPercent

            val colorHex = try {
                Color(AndroidColor.parseColor(el.color))
            } catch (e: Exception) {
                Color.White
            }

            val bgHex = if (!el.backgroundColor.isNullOrEmpty()) {
                try {
                    val parsed = Color(AndroidColor.parseColor(el.backgroundColor))
                    parsed.copy(alpha = el.backgroundOpacity)
                } catch (e: Exception) {
                    Color.Transparent
                }
            } else {
                Color.Transparent
            }

            Text(
                text = el.content,
                color = colorHex,
                fontSize = el.fontSize.sp,
                fontWeight = if (el.fontWeight == "bold") FontWeight.Bold else FontWeight.Normal,
                textAlign = when (el.textAlign) {
                    "center" -> TextAlign.Center
                    "right" -> TextAlign.Right
                    else -> TextAlign.Left
                },
                modifier = Modifier
                    .absoluteOffset(x = leftOffset, y = topOffset)
                    .width(width)
                    .clip(RoundedCornerShape(el.borderRadius.dp))
                    .background(bgHex)
                    .padding(el.padding.dp)
            )
        }
    }
}
