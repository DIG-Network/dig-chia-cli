// @ts-ignore
import { DigNetwork, DataStore } from "dig-sdk";

export const pull = async (): Promise<void> => {
    // Retrieve the active storeId
    const dataStore = await DataStore.getActiveStore();
    if (!dataStore) {
        throw new Error("Store not found.");
    }
    
    // Instantiate the DigNetwork with the storeId
    const digNetwork = new DigNetwork(dataStore.StoreId);
    
    // Pull files from the network using DigNetwork's downloadFiles method
    await digNetwork.downloadFiles(false, true);
};
