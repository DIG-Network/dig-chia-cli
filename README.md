# Introduction To DIG and the DIG Network

The DIG Network offers a robust solution for ensuring data integrity and censorship resistance by leveraging decentralized technology. When you add your data to DIG, it is encoded and served from a Merkle tree, with the Merkle root securely stored on the blockchain by the data owner. This structure guarantees that the data can be verified by anyone, ensuring that what they consume is exactly what was intended, free from manipulation or tampering.

This capability is particularly valuable for decentralized applications (dApps). With DIG, a dApp developer can have their application backed up and served globally by a network of peers. The decentralized nature of the DIG Network means that even if a dApp is served by a random peer, users can trust that it remains unaltered. 

The network's ability to stitch together all the peers serving your content creates a unified Decentralized Content Delivery Network (D-CDN), making it easier for end-users to access the data without needing to manually locate the peers. The philosophy behind DIG suggests that if there are enough peers distributed across various legal jurisdictions worldwide, the dApp achieves a significant level of censorship resistance. This is because the chance of every peer being simultaneously shut down is extremely low.

Moreover, DIG opens up possibilities for creating dApps where write access is controlled by a cryptographic key, potentially owned by a Decentralized Autonomous Organization (DAO). This could lead to the development of dApps that are not owned by any single entity but are maintained by anonymous DAO members, further enhancing the censorship resistance and resilience of the application.

### Using DIG: A Step-by-Step Guide

To effectively use the DIG Network, it's essential to become familiar with the DIG CLI commands. While it is recommended to explore all available commands, this guide focuses on the core workflow that developers will frequently use.

**Before You Begin:** Ensure your DIG environment is properly set up by following the [SETUP.md](./SETUP.md) guide.

---

#### Step 1: Prepare Your Project

1. **Add `.dig` to `.gitignore`:**
   - Open your dApp project.
   - Add `.dig` to your `.gitignore` file to ensure that DIG-related files are not tracked by Git.

2. **Build Your Project:**
   - Compile your project, directing the output to the `./dist` folder (or any build folder of your choice). By default, the DIG CLI looks for the `./dist` folder.

---

#### Step 2: Initialize DIG for Your Project

1. **Initialize DIG:**
   - Run the following command in your project directory:
     ```bash
     dig init
     ```
   - This will create a `.dig` folder in your project directory. An empty data store will also be created and committed to the blockchain. Wait for the blockchain transaction to confirm before proceeding to the next step.

---

#### Step 3: Commit Your Build to the Data Store

1. **Commit the `dist` Folder:**
   - Use the following command to commit your `dist` folder to the DIG data store:
     ```bash
     dig commit
     ```
   - This command inserts all files from the `./dist` folder into the Merkle root of your new data store and updates the blockchain with the resulting Merkle root. This process involves another blockchain transaction, which you must wait to confirm.

---

#### Step 4: Push Your Data to the DIG Node

1. **Push to the DIG Node:**
   - To make your data available on a DIG Node, run the following command:
     ```bash
     dig push
     ```
   - This command uploads your files to the DIG Node, verifying integrity and permissions along the way. Ensure your DIG Node is set up according to the [SETUP.md](#) guide.

---

#### Step 5: Verify Your dApp on the DIG Network

1. **Check Availability:**
   - After a few moments, your DIG Node will detect the new store and register it with the DIG Network. You can verify this by visiting:
     ```http
     http://your.ip.address
     ```
   - You should be able to find and access your dApp. Congratulations, your dApp is now live on the DIG Network!

---

#### Step 6: Accessing Your dApp via the Network

Once your dApp is on the network, it can be discovered and accessed by any client, browser, or domain acting as a cache service using a unified identifier called the **Universal DataLayer Identifier (UDI)**. This feature is still under development and will be available soon. Updates will be provided as the UDI and associated technologies come online.

**In the Meantime:**
- You can use **nginx** or a **reverse proxy** to map your store to a domain on your local machine and serve it like a traditional website.
- In the future, a custom browser will automatically load your app from the network using the UDI, potentially integrated with a decentralized name service.

By following this workflow, you can securely deploy your dApp to the DIG Network, ensuring that it is backed up, served globally, and resistant to censorship.
