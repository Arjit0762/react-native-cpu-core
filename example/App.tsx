import { getCpuUsage, getClockTicksPerSecond } from "react-native-cpu-core";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";

const widthsize = (value: any) => {
  return (Dimensions.get("screen").width * value) / 100;
};

const heightsize = (value: any) => {
  return (Dimensions.get("screen").height * value) / 100;
};

export default function App() {
  const [cpu, setCpu] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [clockSpeed, setClockSpeed] = useState(0);

  useEffect(() => {
    getClockSpeed();
  }, []);

  const getClockSpeed = () => {
    const value = getClockTicksPerSecond();
    setClockSpeed(value);
  };

  const onClick = async () => {
    setLoading(true);
    try {
      const value = await getCpuUsage();
      setCpu(value);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View>
          <Text style={styles.header}>Module API Example</Text>

          <View style={{ alignItems: "center", marginVertical: heightsize(2) }}>
            <Text style={styles.cpuText}>Clock Sped</Text>
            <Text style={styles.cpuText}>{clockSpeed}</Text>
          </View>
          <View style={{ alignItems: "center", marginVertical: heightsize(2) }}>
            <Text style={styles.cpuText}>CPU Usage</Text>
            <Text style={styles.cpuText}>{cpu}%</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            onClick();
          }}
          style={{
            backgroundColor: "#007AFF",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: heightsize(2),
            borderRadius: 999,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={"white"} />
          ) : (
            <Text style={{ color: "white" }}>Trigger CPU Uage</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  cpuText: {
    fontSize: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    paddingVertical: heightsize(2),
    paddingHorizontal: widthsize(2),
    backgroundColor: "#eee",
  },
  view: {
    flex: 1,
    height: 200,
  },
};
