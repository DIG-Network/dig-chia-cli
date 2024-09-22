import * as fs from "fs";
import {
  DIG_FOLDER_PATH,
  setRemote,
  CONFIG_FILE_PATH,
  ensureDigConfig,
  DataStore,
  DigPeer,
} from "@dignetwork/dig-sdk";
import { promptForRemote } from "../prompts";
import { DigConfig } from "../types";

// Check that required files exist
const checkRequiredFiles = (): void => {
  if (!fs.existsSync(DIG_FOLDER_PATH)) {
    throw new Error(".dig folder not found. Please run init first.");
  }
  if (!fs.existsSync(CONFIG_FILE_PATH)) {
    throw new Error("Config file not found.");
  }
};

// Helper function to read and parse the config file
const getConfig = async (): Promise<DigConfig> => {
  const config = await ensureDigConfig(DIG_FOLDER_PATH);
  return config;
};

// Main push function
export const push = async (): Promise<void> => {
  try {
    checkRequiredFiles();

    const config = await getConfig();

    if (!config?.remote) {
      const remote = await promptForRemote();
      setRemote(remote);
      config.remote = remote;
    }

    const dataStore = await DataStore.getActiveStore();

    if (!dataStore) {
      throw new Error(
        "Could not find the store ID. Make sure you have committed your changes."
      );
    }

    const digPeer = new DigPeer(config.remote, dataStore.StoreId);
    console.log(`Pushing to ${config.remote}...`);
    await digPeer.syncStore();
    
  } catch (error: any) {
    console.error(`Push failed: ${error.message}`);
  }
};
