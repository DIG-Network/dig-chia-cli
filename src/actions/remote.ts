import {
  setRemote as _setRemote,
  setActiveStore as _setActiveStore,
  ensureDigConfig, DIG_FOLDER_PATH,
  getOrCreateSSLCerts,
  promptCredentials,
  Wallet,
  ServerCoin,
} from "dig-sdk";
import fs from "fs";
import superagent from "superagent";
import * as https from "https";

export const setRemote = (remote: string): void => {
  _setRemote(remote);
};

export const setActiveStore = (storeId: string): void => {
  _setActiveStore(storeId);
};

const syncOrSetRemoteSeed = async (walletName: string, mnemonic: string): Promise<void> => {
  const config = await ensureDigConfig(DIG_FOLDER_PATH);

  if (!config?.remote) {
    throw new Error("No remote configuration found, please set one first");
  }

  const { certPath, keyPath } = getOrCreateSSLCerts();
  const { username, password } = await promptCredentials(config.remote);
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  // Create an HTTPS agent with custom certificate and key
  const agent = new https.Agent({
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
    rejectUnauthorized: false, // Allow self-signed certificates
  });

  try {
    const response = await superagent
      .post(`https://${config.remote}:4159/mnemonic`)
      .set("Authorization", `Basic ${auth}`)
      .set("Content-Type", "application/json")
      .agent(agent) // Use the custom HTTPS agent
      .send({ mnemonic, walletName });

    if (response.ok) {
      console.log("Seed phrase successfully set on remote.");
    } else {
      console.error(`Failed to set seed phrase on remote. Status code: ${response.status}`);
      console.error(`Response: ${response.text}`);
    }
  } catch (error: any) {
    console.error(`Request failed: ${error.message}`);
  }
};

export const syncRemoteSeed = async (walletName: string = 'default'): Promise<void> => {
  const wallet = await Wallet.load(walletName);
  const mnemonic = wallet.getMnemonic();

  if (!mnemonic) {
    throw new Error("No seed phrase found, please create one first");
  }

  await syncOrSetRemoteSeed(walletName, mnemonic);
};

export const setRemoteSeed = async (walletName: string = 'default', mnemonic: string): Promise<void> => {
  await syncOrSetRemoteSeed(walletName, mnemonic);
};

export const subscribeToStore = async (storeId: string): Promise<void> => {
  const config = await ensureDigConfig(DIG_FOLDER_PATH);

  if (!config?.remote) {
    throw new Error("No remote configuration found, please set one first");
  }

  const hexRegex = /^[a-fA-F0-9]{64}$/;
  if (!hexRegex.test(storeId)) {
    throw new Error("Invalid storeId. Must be a 64-character hexadecimal string." );
  }

  const serverCoin = new ServerCoin(storeId);

  const storeMirrors = await serverCoin.sampleCurrentEpoch(1);

  if (storeMirrors.length === 0) {
    throw new Error("Cannot find any mirrors for the store, unable to subscribe.");
  }

  const { certPath, keyPath } = getOrCreateSSLCerts();
  const { username, password } = await promptCredentials(config.remote);
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  // Create an HTTPS agent with custom certificate and key
  const agent = new https.Agent({
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
    rejectUnauthorized: false, // Allow self-signed certificates
  });

  try {
    const response = await superagent
      .post(`https://${config.remote}:4159/subscribe`)
      .set("Authorization", `Basic ${auth}`)
      .set("Content-Type", "application/json")
      .agent(agent) // Use the custom HTTPS agent
      .send({ storeId });

    if (response.ok) {
      console.log("Remote is subscribing to store");
    } else {
      console.error(`Failed to subscribe to store on remote. Status code: ${response.status}`);
      console.error(`Response: ${response.text}`);
    }
  } catch (error: any) {
    console.error(`Request failed: ${error.message}`);
  }
};

export const unsubscribeToStore = async (storeId: string): Promise<void> => {
  const config = await ensureDigConfig(DIG_FOLDER_PATH);

  if (!config?.remote) {
    throw new Error("No remote configuration found, please set one first");
  }

  const hexRegex = /^[a-fA-F0-9]{64}$/;
  if (!hexRegex.test(storeId)) {
    throw new Error("Invalid storeId. Must be a 64-character hexadecimal string." );
  }

  const { certPath, keyPath } = getOrCreateSSLCerts();
  const { username, password } = await promptCredentials(config.remote);
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  // Create an HTTPS agent with custom certificate and key
  const agent = new https.Agent({
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
    rejectUnauthorized: false, // Allow self-signed certificates
  });

  try {
    const response = await superagent
      .post(`https://${config.remote}:4159/unsubscribe`)
      .set("Authorization", `Basic ${auth}`)
      .set("Content-Type", "application/json")
      .agent(agent) // Use the custom HTTPS agent
      .send({ storeId });

    if (response.ok) {
      console.log("Remote is unsubscribing to store");
    } else {
      console.error(`Failed to unsubscribe to store on remote. Status code: ${response.status}`);
      console.error(`Response: ${response.text}`);
    }
  } catch (error: any) {
    console.error(`Request failed: ${error.message}`);
  }
};