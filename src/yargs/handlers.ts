import { Wallet, getActiveStoreId } from "dig-sdk";
import {
  commit,
  push,
  pull,
  clone,
  setRemote,
  init,
  validate,
  login,
  syncRemoteSeed,
  setRemoteSeed,
  generateEntropyValue,
  subscribeToStore,
  unsubscribeToStore,
} from "../actions";
import { CreateStoreUserInputs } from "../types";
import { logout } from "../actions/logout";
import { checkStoreWritePermissions } from "../actions";

// Command handlers
export const handlers = {
  init: async (inputs: CreateStoreUserInputs) => {
    await init(inputs);
  },
  commit: async () => {
    await getActiveStoreId();
    await checkStoreWritePermissions();
    await commit();
  },
  push: async () => {
    await getActiveStoreId();
    await checkStoreWritePermissions();
    await push();
  },
  pull: async () => {
    await pull();
    console.log("Pull command executed");
  },
  clone: async (storeId: string) => {
    await clone(storeId);
  },
  upsertStore: async (writer?: string, oracle_fee?: number, admin?: string) => {
    //await upsertStore(writer, oracle_fee, admin);
    console.log("Store upsert executed");
  },
  removeStore: async (writer?: string, oracle_fee?: number, admin?: string) => {
    // await removeStore(writer, oracle_fee, admin);
    console.log("Store remove executed");
  },
  setRemote: async (peer: string) => {
    await setRemote(peer);
  },
  syncRemoteSeed: async (walletName: string = 'default') => {
    console.log("Syncing remote seed");
    await syncRemoteSeed(walletName);
  },
  setRemoteSeed: async (walletName: string, seed: string) => {
    await setRemoteSeed(walletName, seed);
  },
  validateStore: async () => {
    await validate();
  },
  generateCreds: async () => {
    await generateEntropyValue();
  },
  subscribeToStore: async (storeId: string) => {
    await subscribeToStore(storeId);
  },
  unsubscribeToStore: async (storeId: string) => {
    await unsubscribeToStore(storeId);
  },
  manageStore: async (action: string) => {
    switch (action) {
      case "validate":
        await validate();
        break;
      case "update":
        //  await upsertStore();
        break;
      case "remove":
        // await removeStore();
        break;
      default:
        console.error("Unknown store action");
    }
  },
  manageKeys: async (action: string, providedMnemonic?: string, walletName: string = 'default') => {
    switch (action) {
      case "import":
        await Wallet.importWallet(walletName, providedMnemonic);
        break;
      case "new":
        await Wallet.load(walletName);
        break;
      case "delete":
        await Wallet.deleteWallet(walletName);
        break;
      case "show":
        console.log((await Wallet.load(walletName)).getMnemonic());
        break;
      default:
        console.error("Unknown keys action");
    }
  },
  login: async (username: string, password: string) => {
    await login(username, password);
  },
  logout: async () => {
    await logout();
  },
};
