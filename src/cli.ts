#!/usr/bin/env node
"use strict";

import { Environment } from "@dignetwork/dig-sdk";
import path from "path";

// Set the environment variable
Environment.CLI_MODE = true;

// Dynamically import the actual dignode script
const dignodeScriptPath = path.resolve(__dirname, "../dist/index.js");

// Import the actual dignode script
import(dignodeScriptPath).catch((error) => {
  console.error("Error executing dignode cli:", error);
});
