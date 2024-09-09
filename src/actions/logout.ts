import { clearCredentials, CONFIG_FILE_PATH, loadDigConfig } from "@dignetwork/dig-sdk";

export const logout = async () => {
  try {
    const config = loadDigConfig("");
    if (!config?.remote) {
      throw new Error(`Field "remote" is not set in ${CONFIG_FILE_PATH}`);
    }

    await clearCredentials(config.remote);
  } catch (error: any) {
    console.error("Failed to logout from to datastore:", error.message);
  }
};
