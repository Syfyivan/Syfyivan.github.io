export * from "../source/mahjong/game-server.mjs";

import { pathToFileURL } from "node:url";
import { startServer } from "../source/mahjong/game-server.mjs";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
