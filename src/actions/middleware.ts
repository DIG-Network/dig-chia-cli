import path from "path";
import fs from "fs";
import { Config } from "../types";
import {
  CONFIG_FILE_PATH,
  DIG_FOLDER_PATH,
  FullNodePeer,
  DataStore, 
  Wallet,
  waitForPromise,
} from "dig-sdk";

import { getCoinId } from "datalayer-driver";

export const checkStoreWritePermissions = async (): Promise<void> => {
  if (fs.existsSync(DIG_FOLDER_PATH)) {
    const dataStore = await DataStore.getActiveStore();

    if (dataStore) {
      try {
        await waitForPromise(
          async () => {
            const { latestStore } = await dataStore.fetchCoinInfo();

            if (latestStore) {
              const wallet = await Wallet.load("default");
              const publicSyntheticKey = await wallet.getPublicSyntheticKey();
              const storeIsWritable = await dataStore.hasMetaWritePermissions(
                publicSyntheticKey
              );

              if (!storeIsWritable) {
                throw new Error(
                  "Store is not writable by the current user. Please transfer ownership or add your key as an authorized writer."
                );
              }

              return true;
            }
          },
          "Checking store permissions",
          "Store is writable by your key.",
          "You do not have write permissions to this store."
        );
      } catch (error: any) {
        console.error(error.message);
        throw error;
      }
    }
  }
};

export const ensureStoreIsSpendable = async (): Promise<void> => {
  const peer = await FullNodePeer.connect();
  const dataStore = await DataStore.getActiveStore();

  if (!dataStore) {
    throw new Error("Store ID not found. Please run init first.");
  }

  const { latestStore } = await dataStore.fetchCoinInfo();
  if (latestStore) {
    console.log(
      "Checking if Store is spendable:",
      latestStore.launcherId.toString("hex")
    );

    const isSpendable = await Wallet.isCoinSpendable(
      peer,
      getCoinId(latestStore.coin)
    );

    if (!isSpendable) {
      throw new Error("Store is not spendable. Please wait for confirmation.");
    }
  }
};

export const ensureDigFolderIntegrity = async (): Promise<void> => {
  // Check if the dig.config.json file exists
  if (!fs.existsSync(CONFIG_FILE_PATH)) {
    throw new Error("Config file not found. Please run init first.");
  }

  // Load the config
  const config: Config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, "utf-8"));

  // Check if deploy_dir is set
  if (!config.deploy_dir) {
    throw new Error('The "deploy_dir" field is not set in the config file.');
  }

  // Check if the deployDir exists
  const deployDir = path.join(process.cwd(), config.deploy_dir);
  if (!fs.existsSync(deployDir)) {
    throw new Error(`The deploy directory (${deployDir}) does not exist.`);
  }
};
