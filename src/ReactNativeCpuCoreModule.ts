import { NativeModule, requireNativeModule } from "expo";

import { ReactNativeCpuCoreModuleEvents } from "./ReactNativeCpuCore.types";

declare class ReactNativeCpuCoreModule extends NativeModule<ReactNativeCpuCoreModuleEvents> {
  getCpuUsage(): Promise<number>;
  getClockTicksPerSecond(): number;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ReactNativeCpuCoreModule>(
  "ReactNativeCpuCore"
);
