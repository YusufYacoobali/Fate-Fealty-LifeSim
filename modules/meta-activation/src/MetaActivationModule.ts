import { requireOptionalNativeModule } from 'expo';
export default requireOptionalNativeModule<{
  configure(enabled: boolean): Promise<void>;
  activateApp(): Promise<void>;
  getAnonymousID(): Promise<string | null>;
}>('MetaActivation');
