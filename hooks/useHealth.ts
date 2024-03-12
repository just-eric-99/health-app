import { useEffect, useState } from "react";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
} from "react-native-health";
import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import { TimeRangeFilter } from "react-native-health-connect/lib/typescript/types/base.types";


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
      if (Platform.OS === 'ios') {
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
      } else if (Platform.OS === 'android') {
        const result = readRecords("Steps", {
          timeRangeFilter: {
            operator: "before",
            endTime: new Date().toISOString()
          }
        })

        console.log(result);
      }
    }

  }, [hasPermissions]);

  // Android - Health Connect
  const readSampleData = async () => {
    // initialize the client
    const isInitialized = await initialize();
    if (!isInitialized) {
      return;
    }

    await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
    ]);

    const timeRangeFilter: TimeRangeFilter = {
      operator: "after",
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Steps
    const steps = await readRecords('Steps', { timeRangeFilter });
    const totalSteps = steps.reduce((sum, cur) => sum + cur.count, 0);
    console.log(totalSteps);

    setSteps(totalSteps);
  };

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    readSampleData();
  }, []);

  return {
    steps,
  };
};

export default useHealth;
