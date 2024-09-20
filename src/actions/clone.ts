import fs from "fs";
import path from "path";

import {
  DigNetwork,
  STORE_PATH,
  DIG_FOLDER_PATH,
  waitForPromise,
  DataStore,
} from "@dignetwork/dig-sdk";

export const clone = async (
  storeId: string,
  skipData: boolean = false
): Promise<void> => {
  try {
    console.log(`Cloning store: ${storeId}`);

    const storeDir = path.join(DIG_FOLDER_PATH, "stores", storeId);

    // Check if the store directory already exists
    if (fs.existsSync(storeDir)) {
      console.error(`Store with ID ${storeId} already exists at ${storeDir}.`);
      process.exit(1); // Exit the process with an error code
    }

    try {
      // Create an instance of DigNetwork
      const digNetwork = new DigNetwork(storeId);

      // Pull files from the network using DigNetwork
      await digNetwork.downloadFiles();
    } catch (error: any) {
      console.error(error.message);
      process.exit(1); // Exit the process with an error code
    }

    const dataStore = DataStore.from(storeId);

    if (skipData) {
      console.log("Skipping store integrity check due to --skip-data flag.");
      return;
    }
  } finally {
    process.exit(0);
  }
};
