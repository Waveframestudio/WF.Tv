package com.foodscreen.tvapp.di

import android.content.Context
import androidx.room.Room
import com.foodscreen.tvapp.data.db.AppDatabase
import com.foodscreen.tvapp.sync.ApiClient
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    private const val DEFAULT_BASE_URL = "http://10.0.2.2:3001/api/"

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "foodscreen_db"
        ).build()
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        return OkHttpClient.Builder()
            .addInterceptor(logging)
            .build()
    }

    @Provides
    @Singleton
    fun provideApiClient(
        @ApplicationContext context: Context,
        okHttpClient: OkHttpClient
    ): ApiClient {
        val prefs = context.getSharedPreferences("foodscreen_prefs", Context.MODE_PRIVATE)
        val customUrl = prefs.getString("server_url", DEFAULT_BASE_URL)
        val baseUrl = if (customUrl.isNullOrEmpty()) DEFAULT_BASE_URL else if (customUrl.endsWith("/")) customUrl else "$customUrl/"

        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiClient::class.java)
    }
}
