import path from "path";
import fs from "fs";
import {
  listFilesRecursively,
  asyncPool,
  calculateFolderSize,
  waitForPromise,
  DataStore,
  FullNodePeer,
  loadDigConfig,
  STORE_PATH,
} from "@dignetwork/dig-sdk";

export const commit = async (): Promise<void> => {
  try {
    const dataStore = await DataStore.getActiveStore();

    if (!dataStore) {
      throw new Error("Store ID not found. Please run init first.");
    }

    const { latestStore } = await dataStore.fetchCoinInfo();
    if (!latestStore) {
      throw new Error("Store info not found. Please run init first.");
    }

    // When doing file based inserts, we want the tree to be an exact replica of the build directory
    // regardless of what was previously in the tree, so we are zeroing it out first before we add a new generation
    dataStore.Tree.deleteAllLeaves();

    const digConfig = await loadDigConfig(process.cwd());

    // Group into 1000 files per batch to make management and upload easier
    const fileGroups = listFilesRecursively(
      path.join(process.cwd(), digConfig.deploy_dir),
      1000
    );

    const concurrencyLimit = 10;

    for (const files of fileGroups) {
      await asyncPool(concurrencyLimit, files as string[], async (file) => {
        const filePath = path.join(process.cwd(), digConfig.deploy_dir, file);
        const relativePath = file.replace(/\\/g, "/");
        const stream = fs.createReadStream(filePath);
        await dataStore.Tree.upsertKey(
          stream,
          Buffer.from(relativePath).toString("hex")
        );
      });

      const newRootHash = dataStore.Tree.commit();

      if (!newRootHash) {
        return;
      }

      const totalBytes = calculateFolderSize(
        path.resolve(STORE_PATH, dataStore.StoreId)
      );

      console.log(
        `Updating store metadata with new root hash: ${newRootHash}, bytes: ${totalBytes}`
      );

      const updatedStoreInfo = await dataStore.updateMetadata({
        ...latestStore.metadata,
        rootHash: Buffer.from(newRootHash, "hex"),
        bytes: totalBytes,
      });

      await FullNodePeer.waitForConfirmation(
        updatedStoreInfo.coin.parentCoinInfo
      );

      await dataStore.fetchCoinInfo();
    }

    await waitForPromise(
      () => dataStore.fetchCoinInfo(),
      "Finalizing commit...",
      "Commit successful",
      "Failed to commit."
    );

    console.log("Commit successful");
  } catch (error: any) {
    console.error("Failed to commit:", error.message);
  } finally {
    process.exit();
  }
};
