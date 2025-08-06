import { registerWebModule, NativeModule } from 'expo';

import { ReactNativeCpuCoreModuleEvents } from './ReactNativeCpuCore.types';

class ReactNativeCpuCoreModule extends NativeModule<ReactNativeCpuCoreModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ReactNativeCpuCoreModule, 'ReactNativeCpuCoreModule');
