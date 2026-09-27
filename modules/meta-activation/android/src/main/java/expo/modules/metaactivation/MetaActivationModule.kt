package expo.modules.metaactivation

import android.app.Application
import com.facebook.FacebookSdk
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
      FacebookSdk.setAutoLogAppEventsEnabled(false)
      FacebookSdk.setAdvertiserIDCollectionEnabled(enabled)
      if (enabled) FacebookSdk.fullyInitialize()
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("activateApp") {
      val application = appContext.reactContext?.applicationContext as? Application
        ?: throw IllegalStateException("Application context unavailable")
      if (measurementEnabled) AppEventsLogger.activateApp(application)
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("getAnonymousID") {
      val context = appContext.reactContext
        ?: throw IllegalStateException("React context unavailable")
      if (measurementEnabled) AppEventsLogger.getAnonymousAppDeviceGUID(context) else null
    }.runOnQueue(Queues.MAIN)
  }
}
