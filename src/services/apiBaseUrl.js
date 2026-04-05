const configuredApiUrl = String(process.env.REACT_APP_API_URL || "").trim();
const normalizedConfiguredApiUrl = configuredApiUrl.replace(/\/+$/, "");
const isLocalBrowser =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE_URL =
  normalizedConfiguredApiUrl || (isLocalBrowser ? "http://localhost:5000" : "");
