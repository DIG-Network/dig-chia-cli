import { DataStore } from "@dignetwork/dig-sdk";

export const validate = async (): Promise<void> => {
  try {
    const dataStore = await DataStore.getActiveStore();
    if (!dataStore) {
      throw new Error("Store not found.");
    }
    const isValid = await dataStore.validate();

    if (!isValid) {
      throw new Error("Store integrity check failed.");
    }

    console.log("Store integrity check passed.");
  } catch (error: any) {
    console.error(error.message);
    process.exit(1); // Exit the process with an error code
  }

};

