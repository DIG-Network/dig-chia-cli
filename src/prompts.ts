import inquirer from "inquirer";
import * as bip39 from "bip39";
import { CreateStoreUserInputs } from "./types";

export const askForStoreDetails = async (
  inputs: CreateStoreUserInputs = {}
): Promise<CreateStoreUserInputs> => {
  const questions: any = [];

  if (!inputs.label) {
    questions.push({
      type: "input",
      name: "label",
      message: "Enter the label for the data layer store:",
      validate: (input: string) => input.trim().length > 0 || "Label is required.",
    });
  } else {
    // Validate provided label
    if (inputs.label.trim().length === 0) {
      throw new Error("Label is required.");
    }
  }

  if (!inputs.description) {
    questions.push({
      type: "input",
      name: "description",
      message: "Enter a description for the data layer store (max 50 chars):",
      validate: (input: string) =>
        input.trim().length <= 50 || "Description must be 50 characters or less.",
    });
  } else {
    // Validate provided description
    if (inputs.description.trim().length > 50) {
      throw new Error("Description must be 50 characters or less.");
    }
  }

  if (!inputs.authorizedWriter) {
    questions.push({
      type: "input",
      name: "authorizedWriter",
      message: "Enter the authorized writer public address (optional):",
      default: undefined,
    });
  }

  if (inputs.oracleFee === undefined) {
    questions.push({
      type: "input",
      name: "oracleFee",
      message: "Enter the oracle fee, in Mojos (optional, default is 100000):",
      default: 100000,
      filter: (input: any) => parseInt(input, 10),
      validate: (input: any) => !isNaN(input) || "Oracle fee must be a number.",
    });
  } else {
    // Validate provided oracle fee
    if (isNaN(inputs.oracleFee)) {
      throw new Error("Oracle fee must be a number.");
    }
  }

  const answers = await inquirer.prompt<CreateStoreUserInputs>(questions);
  return { ...inputs, ...answers };
};

export const askToDeleteAndReinit = async (): Promise<boolean> => {
  const questions: any = [
    {
      type: "confirm",
      name: "shouldDelete",
      message:
        "The .dig folder already exists. Do you want to delete it and re-init? This process is irreversible.",
      default: false,
    },
  ];

  const { shouldDelete } = await inquirer.prompt(questions);
  return shouldDelete;
};

/**
 * Prompts the user to select an action (Provide, Generate, or Import).
 * 
 * @returns {Promise<{ action: string }>} The action selected by the user.
 */
export const askForMnemonicAction = async (): Promise<any> => {
  const questions: any = [
    {
      type: "list",
      name: "action",
      message: "No mnemonic seed found. Would you like to provide, generate, or import one?",
      choices: ["Provide", "Generate", "Import From Chia Client"],
    },
  ];

  return inquirer.prompt(questions);
};

/**
 * Prompts the user to input a mnemonic seed phrase and validates it.
 * 
 * @returns {Promise<{ providedMnemonic: string }>} The mnemonic provided by the user.
 */
export const askForMnemonicInput = async (): Promise<any> => {
  const questions: any = [
    {
      type: "input",
      name: "providedMnemonic",
      message: "Please enter your mnemonic seed phrase:",
      validate: (input: string) =>
        bip39.validateMnemonic(input)
          ? true
          : "Invalid mnemonic phrase. Please try again.",
    },
  ];

  return inquirer.prompt(questions);
};

const validateHost = (input: string): boolean | string => {
  // Regex pattern for validating hostnames (e.g., example.com) without ports
  const hostPattern = /^(?!:\/\/)([a-zA-Z0-9.-]+)$/; // For hostnames without port

  // Regex pattern for validating IPv4 addresses (e.g., 192.168.0.1) without ports
  const ipv4Pattern = /^(?!:\/\/)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/; // For IPv4 without port

  // Regex pattern for validating IPv6 addresses (e.g., 2001:0db8:85a3::8a2e:0370:7334) without ports
  const ipv6Pattern = /^(?!:\/\/)([a-fA-F0-9:]+)$/; // For IPv6 without port

  // Check if the input matches either a hostname, an IPv4 address, or an IPv6 address
  if (hostPattern.test(input) || ipv4Pattern.test(input) || ipv6Pattern.test(input)) {
    return true;
  }

  return 'Please enter a valid IP address (IPv4 or IPv6) or host without a port (e.g., example.com, 192.168.0.1, or 2001:db8::1)';
};


export const promptForRemote = async (): Promise<string> => {
  const questions: any = [
    {
      type: 'input',
      name: 'remoteHost',
      message: 'Please enter the remote peer ip:',
      validate: validateHost,
    },
  ];

  const answers = await inquirer.prompt<{ remoteHost: string }>(questions);
  return answers.remoteHost;
};