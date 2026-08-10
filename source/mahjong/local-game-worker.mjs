import { LocalGamePeer } from "./game-server.mjs";

const peer = new LocalGamePeer((data) => {
  globalThis.postMessage({ type: "message", data });
});

globalThis.addEventListener("message", (event) => {
  if (event.data && event.data.type === "send") {
    peer.receive(event.data.data);
  }
  if (event.data && event.data.type === "close") {
    peer.close();
    globalThis.close();
  }
});

globalThis.postMessage({ type: "open" });
