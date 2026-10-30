package expo.modules.metaactivation

import android.app.Application
import com.facebook.FacebookSdk
import com.facebook.appevents.AppEventsConstants
import com.facebook.appevents.AppEventsLogger
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MetaActivationModule : Module() {
  private var measurementEnabled = false

  override fun definition() = ModuleDefinition {
    Name("MetaActivation")
    AsyncFunction("configure") { enabled: Boolean ->
      measurementEnabled = enabled
      if (enabled && !FacebookSdk.isInitialized()) {
        val context = appContext.reactContext?.applicationContext
          ?: throw IllegalStateException("Application context unavailable")
        // The startup ContentProvider is removed by withMetaConsent. Initialize
        // here only after opt-in; manifest defaults keep automatic logging off.
        @Suppress("DEPRECATION")
        FacebookSdk.sdkInitialize(context)
      }
      if (FacebookSdk.isInitialized()) {
        FacebookSdk.setAutoLogAppEventsEnabled(false)
        FacebookSdk.setAdvertiserIDCollectionEnabled(enabled)
        if (enabled) FacebookSdk.fullyInitialize()
      }
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("activateApp") {
      val application = appContext.reactContext?.applicationContext as? Application
        ?: throw IllegalStateException("Application context unavailable")
      if (measurementEnabled) {
        // Publishes the real install signal, deduplicated by the native SDK.
        AppEventsLogger.activateApp(application)
        // Android's lifecycle activation logger is disabled with auto-logging.
        // Emit the standard app-open event explicitly, never a purchase event.
        val logger = AppEventsLogger.newLogger(application)
        logger.logEvent(AppEventsConstants.EVENT_NAME_ACTIVATED_APP)
        logger.flush()
      }
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("getAnonymousID") {
      val context = appContext.reactContext
        ?: throw IllegalStateException("React context unavailable")
      if (measurementEnabled) AppEventsLogger.getAnonymousAppDeviceGUID(context) else null
    }.runOnQueue(Queues.MAIN)
  }
}
