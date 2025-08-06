import * as React from 'react';

import { ReactNativeCpuCoreViewProps } from './ReactNativeCpuCore.types';

export default function ReactNativeCpuCoreView(props: ReactNativeCpuCoreViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
