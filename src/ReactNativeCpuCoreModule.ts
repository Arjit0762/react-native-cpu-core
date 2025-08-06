import { NativeModule, requireNativeModule } from 'expo';

import { ReactNativeCpuCoreModuleEvents } from './ReactNativeCpuCore.types';

declare class ReactNativeCpuCoreModule extends NativeModule<ReactNativeCpuCoreModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ReactNativeCpuCoreModule>('ReactNativeCpuCore');
