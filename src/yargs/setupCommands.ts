import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { setupMiddleware } from "./middleware";
import {
  initCommand,
  commitCommand,
  pushCommand,
  pullCommand,
  cloneCommand,
  storeCommand,
  remoteCommand,
  keysCommand,
  loginCommand, 
  logoutCommand,
  generateCommand
} from "./commands";

// Configure and run Yargs
export async function setupCommands() {
  const parser = yargs(hideBin(process.argv));

  // Apply middleware
  parser.middleware(setupMiddleware);

  // Register commands
  initCommand(parser);
  commitCommand(parser);
  pushCommand(parser);
  pullCommand(parser);
  cloneCommand(parser);
  storeCommand(parser);
  remoteCommand(parser);
  keysCommand(parser);
  loginCommand(parser);
  logoutCommand(parser);
  generateCommand(parser);

  // Set default command and help
  parser
    .scriptName('dig')
    .demandCommand(1, "You need at least one command before moving on")
    .help()
    .alias("h", "help")
    .parse();
}
