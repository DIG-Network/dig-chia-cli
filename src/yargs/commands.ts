import yargs, { Argv } from "yargs";
import { handlers } from "./handlers";
import { CreateStoreUserInputs } from "../types";

export function initCommand(yargs: Argv<{}>) {
  return yargs.command<CreateStoreUserInputs>(
    "init",
    "Initialize a new Data Store",
    (yargs: Argv<CreateStoreUserInputs>) => {
      return yargs
        .option("label", {
          type: "string",
          describe: "Specify the label for the store",
        })
        .option("description", {
          type: "string",
          describe: "Specify the description for the store (max 50 chars)",
        })
        .option("authorizedWriter", {
          type: "string",
          describe: "Specify an authorized writer for the store",
        })
        .option("oracleFee", {
          type: "number",
          describe: "Specify the oracle fee (default is 100000)",
        });
    },
    async (argv: CreateStoreUserInputs) => {
      await handlers.init(argv);
    }
  );
}

export function commitCommand(yargs: Argv<{}>) {
  return yargs.command(
    "commit",
    "Commit changes to the data store",
    {},
    handlers.commit
  );
}

export function pushCommand(yargs: Argv<{}>) {
  return yargs.command(
    "push",
    "Push changes to the remote data store",
    {},
    handlers.push
  );
}

export function pullCommand(yargs: Argv<{}>) {
  return yargs.command(
    "pull",
    "Pull changes from the remote data store",
    {},
    handlers.pull
  );
}

export function cloneCommand(yargs: Argv<{}>) {
  // @ts-ignore
  return yargs.command<{ storeId: string }>(
    "clone <storeId>",
    "Clones a datastore from a remote remote",
    (yargs: Argv<{ storeId: string }>) => {
      return yargs.positional("storeId", {
        type: "string",
        describe: "The storId to clone down",
      });
    },
    async (argv: { storeId: string }) => {
      await handlers.clone(argv.storeId);
    }
  );
}

export function storeCommand(yargs: Argv<{}>) {
  // @ts-ignore
  return yargs.command<{ action: string }>(
    "store <action>",
    "Manage data store",
    (yargs: Argv<{ action: string }>) => {
      return yargs
        .positional("action", {
          describe: "Action to perform on keys",
          type: "string",
          choices: ["validate", "update", "remove"],
        })
        .option("writer", {
          type: "string",
          describe: "Specify an authorized writer for the store",
        })
        .option("oracle_fee", {
          type: "number",
          describe: "Specify the oracle fee",
        })
        .option("admin", {
          type: "string",
          describe: "Specify an admin for the store",
        })
        .strict(); // Ensures that only the defined options are accepted
    },
    async (argv: { action: string }) => {
      await handlers.manageStore(argv.action);
    }
  );
}

export function generateCommand(yargs: Argv<{}>) {
  return yargs.command("generate", "Generate operations", (yargs: Argv) => {
    return yargs.command(
      "creds",
      "Generate and store credentials securely",
      {},
      async () => {
        await handlers.generateCreds();
      }
    );
  });
}

export function remoteCommand(yargs: Argv<{}>) {
  return yargs.command("remote", "Remote operations", (yargs: Argv) => {
    return yargs
      .command("set", "Set operations", (yargs: Argv) => {
        return yargs
          .command(
            "peer <value>",
            "Set a datastore remote peer",
            // @ts-ignore
            (yargs: Argv<{ value: string }>) => {
              return yargs.positional("value", {
                type: "string",
                describe: "The peer IP address to set",
              });
            },
            async (argv: { value: string }) => {
              await handlers.setRemote(argv.value);
            }
          )
          .command(
            "seed <seed> [walletName]",
            "Set the mnemonic seed on the remote datastore",
            // @ts-ignore
            (yargs: Argv<{ seed: string }>) => {
              return yargs.positional("seed", {
                type: "string",
                describe: "The seed phrase to set on the remote",
              }).positional("walletName", {
                describe: "Optional wallet name to perform the action on",
                type: "string",
              })
            },
            async (argv: { walletName: string, seed: string }) => {
              await handlers.setRemoteSeed(argv.walletName, argv.seed);
            }
          );
      })
      .command("sync", "Sync operations", (yargs: Argv) => {
        return yargs.command(
          "seed [walletName]",
          "Sync the mnemonic seed with the remote datastore",
          (yargs: Argv) =>
            yargs.positional("walletName", {
              describe: "Optional wallet name to perform the action on",
              type: "string",
            }),
          async (argv: { walletName?: string }) => {
            await handlers.syncRemoteSeed(argv.walletName);
          }
        );
      })
      .command(
        "store <action> <storeId>",
        "Store operations (subscribe or unsubscribe to a store on the remote)",
        // @ts-ignore
        (yargs: Argv<{ action: string; storeId: string }>) => {
          return yargs
            .positional("action", {
              type: "string",
              describe: "The action to perform (subscribe or unsubscribe)",
              choices: ["subscribe", "unsubscribe"], // Limit to valid actions
            })
            .positional("storeId", {
              type: "string",
              describe: "The storeId to subscribe to or unsubscribe from",
            });
        },
        async (argv: { action: string; storeId: string }) => {
          console.log(argv.action, argv.storeId);
          if (argv.action === "subscribe") {
            await handlers.subscribeToStore(argv.storeId);
          } else if (argv.action === "unsubscribe") {
            await handlers.unsubscribeToStore(argv.storeId);
          }
        }
      );
  });
}

export function keysCommand(yargs: Argv<{}>) {
  // @ts-ignore
  return yargs.command<{
    action: string;
    mnemonic?: string;
    walletName?: string;
  }>(
    "wallet <action> [walletName]",
    "Manage cryptographic keys",
    (
      yargs: Argv<{ action: string; mnemonic?: string; walletName?: string }>
    ) => {
      return yargs
        .positional("action", {
          describe: "Action to perform on keys",
          type: "string",
          choices: ["import", "new", "delete", "show"],
        })
        .positional("walletName", {
          describe: "Optional wallet name to perform the action on",
          type: "string",
        })
        .option("mnemonic", {
          type: "string",
          describe:
            "Mnemonic seed phrase for import (only for 'import' action)",
        })
        .strict(); // Ensures that only the defined options are accepted
    },
    async (argv: {
      action: string;
      mnemonic?: string;
      walletName?: string;
    }) => {
      await handlers.manageKeys(argv.action, argv.mnemonic, argv.walletName);
    }
  );
}

export function loginCommand(yargs: Argv<{}>) {
  // @ts-ignore
  return yargs.command<{ user: string; pass: string }>(
    "login",
    "Set datastore login credentials",
    (yargs: Argv<{ user: string; pass: string }>) => {
      return yargs
        .option("user", {
          type: "string",
          describe: "Username for login",
        })
        .option("pass", {
          type: "string",
          describe: "Password for login",
        })
        .check((argv) => {
          if ((argv.user && !argv.pass) || (!argv.user && argv.pass)) {
            throw new Error("--user and --pass must be provided together");
          }
          return true;
        });
    },
    async (argv: { user: string; pass: string }) => {
      await handlers.login(argv.user, argv.pass);
    }
  );
}

export function logoutCommand(yargs: Argv<{}>) {
  return yargs.command(
    "logout",
    "Remove datastore login credentials",
    {},
    async () => await handlers.logout()
  );
}
