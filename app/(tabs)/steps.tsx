import useHealth from "@/hooks/useHealth";
import { Text, View } from "react-native";

const Steps = () => {
  const { steps } = useHealth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Steps</Text>
      <Text>{steps}</Text>
    </View>
  );
};

export default Steps;
