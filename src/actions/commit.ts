import path from "path";
import fs from "fs";
import {
  addDirectory,
  calculateFolderSize,
  waitForPromise,
  DataStore,
  FullNodePeer,
  getManifestFilePath,
  loadDigConfig,
  STORE_PATH,
} from "@dignetwork/dig-sdk";

export const commit = async (): Promise<void> => {
  try {
    const dataStore = await DataStore.getActiveStore();

    if (!dataStore) {
      throw new Error("Store ID not found. Please run init first.");
    }

    let storeIntegrityCheck = await waitForPromise(
      () => dataStore.validate(),
      "Checking store integrity...",
      "Store integrity check passed.",
      "Store integrity check failed."
    );

    if (!storeIntegrityCheck) {
      throw new Error("Store integrity check failed.");
    }

    const { latestStore } = await dataStore.fetchCoinInfo();
    if (!latestStore) {
      throw new Error("Store info not found. Please run init first.");
    }

    await catchUpWithManifest(dataStore);

    // When doing file based inserts, we want the tree to be an exact replica of the build directory
    // regardless of what was previously in the tree, so we are zeroing it out first before we add a new generation
    dataStore.Tree.deleteAllLeaves();

    const digConfig = await loadDigConfig(process.cwd());

    await addDirectory(
      dataStore.Tree,
      path.join(process.cwd(), digConfig.deploy_dir)
    );

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

    storeIntegrityCheck = await waitForPromise(
      () => dataStore.validate(),
      "Checking store integrity...",
      "Store integrity check passed.",
      "Store integrity check failed."
    );

    if (!storeIntegrityCheck) {
      throw new Error("Store integrity check failed.");
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

const catchUpWithManifest = async (dataStore: DataStore) => {
  const manifest = fs
    .readFileSync(getManifestFilePath(dataStore.StoreId), "utf-8")
    .trim();
  const manifestRootHashes = manifest.split("\n");

  // Find the index of the last on-chain root hash in the manifest
  const metadata = await dataStore.getMetaData();
  const lastOnChainIndex = manifestRootHashes.lastIndexOf(
    metadata.rootHash.toString("hex")
  );

  if (lastOnChainIndex === -1) {
    throw new Error("On-chain root hash not found in the manifest file.");
  }

  // Get the subsequent root hashes that need to be committed
  const hashesToCommit = manifestRootHashes.slice(lastOnChainIndex + 1);

  if (hashesToCommit.length > 0) {
    console.log(
      `Committing ${hashesToCommit.length} root hashes from the manifest.`
    );

    for (const rootHash of hashesToCommit) {
      console.log(`Committing root hash: ${rootHash}`);
      const updatedStoreInfo = await dataStore.updateMetadata({
        rootHash: Buffer.from(rootHash, "hex"),
        bytes: calculateFolderSize(path.resolve(STORE_PATH, dataStore.StoreId)),
      });

      await FullNodePeer.waitForConfirmation(
        updatedStoreInfo.coin.parentCoinInfo
      );
    }

    console.log("Catch-up with manifest completed.");
  } else {
    console.log(
      "On-chain root hash matches the last manifest root hash. No catch-up required."
    );
  }
};
