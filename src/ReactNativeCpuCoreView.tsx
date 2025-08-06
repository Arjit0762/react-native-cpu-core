import { requireNativeView } from 'expo';
import * as React from 'react';

import { ReactNativeCpuCoreViewProps } from './ReactNativeCpuCore.types';

const NativeView: React.ComponentType<ReactNativeCpuCoreViewProps> =
  requireNativeView('ReactNativeCpuCore');

export default function ReactNativeCpuCoreView(props: ReactNativeCpuCoreViewProps) {
  return <NativeView {...props} />;
}
