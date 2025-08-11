# react-native-cpu-core

A React Native module for retrieving CPU usage information for the app process on Android devices, optimized for the New Architecture (TurboModules). This module provides access to CPU clock ticks per second and calculates the app's CPU usage percentage by reading `/proc/self/stat`.

## Features

- Retrieve the number of clock ticks per second using a native library.
- Calculate the CPU usage of the app process in percentage.
- Asynchronous API with proper error handling for robust integration.
- Supports React Native's New Architecture (TurboModules) for better performance and direct imports.
- Built with Kotlin and compatible with bare React Native projects.

## Installation

Install the package using npm or yarn:

```bash
npm install react-native-cpu-core
```

or

```bash
yarn add react-native-cpu-core
```

### Prerequisites

- React Native >= 0.71 with New Architecture enabled (TurboModules and Fabric).
- Android device or emulator (this module is Android-specific).
- Native library (`cpu-core-native`) must be included in your Android build. Ensure the native library is properly compiled and linked in your project.

### Setup

1. **Enable New Architecture**:

   - Ensure your React Native project has the New Architecture enabled. Follow the [official React Native documentation](https://reactnative.dev/docs/new-architecture-intro) for setup.

2. **Add the Native Library**:

   - Place the `cpu-core-native` shared library (`.so` file) in your Android project's `jniLibs` directory (e.g., `android/app/src/main/jniLibs`).
   - Verify that the library is loaded correctly in the module's code.

3. **Register the TurboModule**:

   - The module uses auto-linking for React Native >= 0.60. No manual linking is required.
   - For custom setup, ensure the module is registered in your `MainApplication.java` or equivalent.

4. **Rebuild the Project**:
   ```bash
   npx react-native run-android
   ```

## Usage

With the New Architecture, you can directly import the functions from the module:

```javascript
import { getCpuUsage, getClockTicksPerSecond } from "react-native-cpu-core";
```

### Example

Below is an example of using the module in a React Native app, with the CPU usage and clock speed displayed on the right side of the screen for a cleaner layout:

```javascript
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { getCpuUsage, getClockTicksPerSecond } from "react-native-cpu-core";

const widthsize = (value) => {
  return (Dimensions.get("screen").width * value) / 100;
};

const heightsize = (value) => {
  return (Dimensions.get("screen").height * value) / 100;
};

export default function App() {
  const [cpu, setCpu] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clockSpeed, setClockSpeed] = useState(0);

  useEffect(() => {
    getClockSpeed();
  }, []);

  const getClockSpeed = async () => {
    try {
      const value = await getClockTicksPerSecond();
      console.log("Clock Speed:", value);
      setClockSpeed(value);
    } catch (e) {
      console.error("Error fetching clock speed:", e);
    }
  };

  const onClick = async () => {
    setLoading(true);
    try {
      const value = await getCpuUsage();
      setCpu(value);
    } catch (e) {
      console.error("Error fetching CPU usage:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.labelText}>Clock Speed:</Text>
            <Text style={styles.valueText}>{clockSpeed}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.labelText}>CPU Usage:</Text>
            <Text style={styles.valueText}>{cpu.toFixed(2)}%</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClick} style={styles.button}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Trigger CPU Usage</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    paddingVertical: heightsize(2),
    paddingHorizontal: widthsize(2),
    backgroundColor: "#eee",
  },
  header: {
    fontSize: 30,
    margin: 20,
    textAlign: "center",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: heightsize(2),
    paddingHorizontal: widthsize(5),
  },
  labelText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  valueText: {
    fontSize: 20,
    textAlign: "right",
  },
  button: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: heightsize(2),
    borderRadius: 999,
    marginHorizontal: widthsize(5),
    marginBottom: heightsize(2),
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
};
```

This example:

- Fetches the clock speed on component mount and CPU usage on button press.
- Displays the clock speed and CPU usage on the right side of the screen using a `space-between` layout in `flexDirection: "row"`.
- Includes a loading indicator during CPU usage calculation.
- Uses responsive sizing based on screen dimensions.

## API Reference

### `getClockTicksPerSecond()`

Retrieves the number of clock ticks per second from the native layer.

**Returns**: `Promise<number>` - A promise that resolves to the number of clock ticks per second.

**Example**:

```javascript
try {
  const ticks = await getClockTicksPerSecond();
  console.log(`Ticks per second: ${ticks}`);
} catch (error) {
  console.error(error);
}
```

### `getCpuUsage()`

Calculates the CPU usage percentage for the app process by reading `/proc/self/stat` twice with a 1-second interval.

**Returns**: `Promise<number>` - A promise that resolves to the CPU usage percentage (between 0.0 and 100.0).

**Throws**:

- `ERR_CLOCK_TICKS`: If there's an error getting clock ticks.
- `ERR_CPU_USAGE_IO`: If there's an I/O error reading CPU stats.
- `ERR_CPU_USAGE_PARSE`: If the CPU stats cannot be parsed.
- `ERR_CPU_USAGE`: For other unexpected errors.

**Example**:

```javascript
try {
  const usage = await getCpuUsage();
  console.log(`CPU Usage: ${usage.toFixed(2)}%`);
} catch (error) {
  console.error(error);
}
```

## Error Handling

The module rejects promises with specific error codes:

- `ERR_CLOCK_TICKS`: Failed to get clock ticks per second.
- `ERR_CPU_USAGE_IO`: Failed to read `/proc/self/stat` due to I/O issues.
- `ERR_CPU_USAGE_PARSE`: Failed to parse the data from `/proc/self/stat`.
- `ERR_CPU_USAGE`: Generic error for unexpected issues during CPU usage calculation.

Always handle errors in your `catch` blocks for graceful degradation.

## Logging

The module uses Android's `Log` class to output debug, warning, and error messages with the tag `ReactNativeCpuCore`. View these in Logcat.

## Notes

- The module relies on the `cpu-core-native` native library. Ensure it's included and compatible with your target architectures (e.g., `armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`).
- The CPU usage calculation uses a 1-second delay for measurement. If the native ticks per second call fails, it falls back to 100.
- This module is Android-specific and will not work on iOS.
- Compatible with React Native New Architecture; for old architecture, use a previous version.

## Troubleshooting

- **"Failed to load native library" error**:
  - Check `jniLibs` directory and library architectures.
- **Invalid `/proc/self/stat` format**:
  - Ensure device supports reading system proc files.
- **CPU usage always 0%**:
  - Verify native library returns valid ticks; check logs for warnings.
- **Import errors**:
  - Confirm New Architecture is enabled and the package is linked correctly.

## Contributing

Contributions welcome! Submit issues or PRs to the [GitHub repository](https://github.com/your-repo/react-native-cpu-core).

## License

MIT License. See [LICENSE](LICENSE) for details.
