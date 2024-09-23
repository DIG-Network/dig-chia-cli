import {
  DigNetwork,
  DataStore,
} from "@dignetwork/dig-sdk";

export const clone = async (
  storeId: string,
  skipData: boolean = false
): Promise<void> => {
  try {
    console.log(`Cloning store: ${storeId}`);

    try {
      // Create an instance of DigNetwork
      const digNetwork = new DigNetwork(storeId);

      // Pull files from the network using DigNetwork
      await digNetwork.syncStoreFromPeers();
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
