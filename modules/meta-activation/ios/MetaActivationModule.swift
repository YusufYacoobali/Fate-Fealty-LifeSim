import ExpoModulesCore
import FBSDKCoreKit
import AppTrackingTransparency
import AdSupport

public class MetaActivationModule: Module {
  private var measurementEnabled = false

  public func definition() -> ModuleDefinition {
    Name("MetaActivation")
    AsyncFunction("configure") { (enabled: Bool) in
      let allowed = enabled && ATTrackingManager.trackingAuthorizationStatus == .authorized
      self.measurementEnabled = allowed
      Settings.shared.isAutoLogAppEventsEnabled = false
      Settings.shared.isAdvertiserIDCollectionEnabled = allowed
      // SDK 18 reads ATT directly on iOS 17+. Keep the flag for iOS 16.
      if #unavailable(iOS 17) {
        Settings.shared.isAdvertiserTrackingEnabled = allowed
      }
      if allowed { ApplicationDelegate.shared.initializeSDK() }
    }.runOnQueue(.main)
    AsyncFunction("activateApp") {
      // Native activation includes the first-install signal.
      if self.measurementEnabled { AppEvents.shared.activateApp() }
    }.runOnQueue(.main)
    AsyncFunction("getAnonymousID") { () -> String? in
      return self.measurementEnabled ? AppEvents.shared.anonymousID : nil
    }.runOnQueue(.main)
  }
}
