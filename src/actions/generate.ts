import {
  generateHighEntropyValue,
  NconfManager,
  encryptAndStoreCredentials,
} from "dig-sdk";
import inquirer from "inquirer";

export const generateEntropyValue = async () => {
  const username = generateHighEntropyValue(20);
  const password = generateHighEntropyValue(20);

  console.log(
    "Suggested values for username and password when setting up a remote node:"
  );
  console.log(`Generated username: ${username}`);
  console.log(`Generated password: ${password}`);

  // Explicitly type the prompt questions to guide TypeScript inference
  const storeQuestion: any = [
    {
      type: "confirm",
      name: "shouldStore",
      message: "Would you like to store these credentials for a remote node?",
      default: true,
    },
  ];

  const { shouldStore } = await inquirer.prompt(storeQuestion);

  if (shouldStore) {
    const ipQuestion: any = [
      {
        type: "input",
        name: "remoteIp",
        message: "Please enter the IP address of the remote node:",
        validate: (input: string) =>
          input.trim() !== "" || "IP address cannot be empty.",
      },
    ];

    const { remoteIp } = await inquirer.prompt(ipQuestion);

    const nconfManager = new NconfManager(`credentials.json`);
    await encryptAndStoreCredentials(
      nconfManager,
      remoteIp,
      "username",
      username
    );
    await encryptAndStoreCredentials(
      nconfManager,
      remoteIp,
      "password",
      password
    );

    console.log(
      `Credentials have been securely stored for remote node: ${remoteIp}`
    );
  } else {
    console.log("Credentials were not stored.");
  }
};
