plugins {
 id("com.android.application")
 id("org.jetbrains.kotlin.android")
 id("org.jetbrains.kotlin.plugin.compose")
}
android {
 namespace = "com.dailylog.todo"
 compileSdk = 35
 defaultConfig { applicationId = "com.dailylog.todo"; minSdk = 26; targetSdk = 35; versionCode = 3; versionName = "0.1.2" }
 testOptions { unitTests.isIncludeAndroidResources = true }
 buildFeatures { compose = true }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
 kotlinOptions { jvmTarget = "17" }
}
dependencies {
 implementation("androidx.glance:glance-appwidget:1.1.1")
 implementation("androidx.work:work-runtime-ktx:2.10.1")
 implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
 testImplementation("org.robolectric:robolectric:4.14.1")
 testImplementation("junit:junit:4.13.2")
 testImplementation("org.json:json:20240303")
}

