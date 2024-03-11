import { useEffect, useState } from "react";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
} from "react-native-health";

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.StepCount],
    write: [],
  },
};

const useHealth = () => {
  const [hasPermissions, setHasPermission] = useState(false);
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    AppleHealthKit.isAvailable((err, isAvailable) => {
      if (err) {
        console.log("Error checking availability");
        return;
      }
      if (!isAvailable) {
        console.log("Apple Health not available");
        return;
      }
      AppleHealthKit.initHealthKit(permissions, (err) => {
        if (err) {
          console.log("Error getting permissions");
          return;
        }
        
        setHasPermission(true);
      });
    });
  }, []);

  useEffect(() => {
    if (hasPermissions) {
      const options: HealthInputOptions = {
        includeManuallyAdded: false,
      };
      AppleHealthKit.getStepCount(options, (err, results) => {
        if (err) {
          console.log("Error getting the steps");
          return;
        }
        console.log(results);
        setSteps(results.value);
      });

      new NativeEventEmitter(NativeModules.AppleHealthKit).addListener(
        "healthKit:StepCount:new",
        async () => {
          const options: HealthInputOptions = {
            includeManuallyAdded: false,
          };
          AppleHealthKit.getStepCount(options, (err, results) => {
            if (err) {
              console.log("Error getting the steps");
              return;
            }
            console.log("triggered observer");
            console.log(results);
            setSteps(results.value);
          });
        }
      );
    }
  }, [hasPermissions]);

  return {
    steps,
  };
};

export default useHealth;
