// Reexport the native module. On web, it will be resolved to ReactNativeCpuCoreModule.web.ts

import ReactNativeCpuCoreModule from "./ReactNativeCpuCoreModule";

export * from "./ReactNativeCpuCore.types";

export function getCpuUsage(): Promise<number> {
  return ReactNativeCpuCoreModule.getCpuUsage();
}

export function getClockTicksPerSecond(): number {
  return ReactNativeCpuCoreModule.getClockTicksPerSecond();
}
