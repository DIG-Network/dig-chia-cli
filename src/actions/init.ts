import * as fs from "fs";
import {
  STORE_PATH,
  setActiveStore,
  CONFIG_FILE_PATH,
  createInitialConfig,
  DataStore,
  waitForPromise
  // @ts-ignore
} from "dig-sdk";
import { CreateStoreUserInputs } from "../types";

export const init = async (
  inputs: CreateStoreUserInputs = {}
): Promise<void> => {
  if (!fs.existsSync(STORE_PATH)) {
    fs.mkdirSync(STORE_PATH, { recursive: true });
  }

  if (!fs.existsSync(CONFIG_FILE_PATH)) {
    createInitialConfig();
  }

  const dataStore = await DataStore.create(inputs);

  setActiveStore(dataStore.StoreId);

  await dataStore.fetchCoinInfo();

  await waitForPromise(
    () => dataStore.fetchCoinInfo(),
    "Final store initialization...",
    "Store initialized.",
    "Failed to initialize the data layer store."
  );

  process.exit();
};
