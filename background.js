// Talks to the AniStream desktop/mobile app over its loopback-only
// deep-link server. PORT must match DeepLinkServer.port in the Dart app.
const PORT = 53211;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "open-anime") return;

  fetch(`http://127.0.0.1:${PORT}/open?source=${msg.source}&id=${msg.id}`)
    .then((res) => sendResponse({ ok: res.ok }))
    .catch(() => sendResponse({ ok: false }));

  return true; // keep the message channel open for the async sendResponse
});
