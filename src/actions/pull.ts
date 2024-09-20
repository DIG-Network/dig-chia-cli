import { DigNetwork, DataStore } from "@dignetwork/dig-sdk";

export const pull = async (): Promise<void> => {
    // Retrieve the active storeId
    const dataStore = await DataStore.getActiveStore();
    if (!dataStore) {
        throw new Error("Store not found.");
    }
    
    // Instantiate the DigNetwork with the storeId
    const digNetwork = new DigNetwork(dataStore.StoreId);
    
    // Pull files from the network using DigNetwork's downloadFiles method
    await digNetwork.downloadFiles();
};
