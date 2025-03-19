require("dotenv").config({
  override: true,
  debug: false,
  path: "./.env.local",
}); // Ensure this is at the top

const { Scopes } = require("@aps_sdk/authentication");

const {
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  SERVER_SESSION_SECRET,
  PORT = 8080, // Default port if not provided
} = process.env;

if (
  !APS_CLIENT_ID ||
  !APS_CLIENT_SECRET ||
  !APS_CALLBACK_URL ||
  !SERVER_SESSION_SECRET
) {
  console.error("Missing some required environment variables.");
  process.exit(1);
}
console.log("APS_CALLBACK_URL:", APS_CALLBACK_URL);
console.log("Config loaded successfully.");

const INTERNAL_TOKEN_SCOPES = [
  Scopes.DataRead,
  Scopes.DataWrite,
  Scopes.DataRead,
  Scopes.ViewablesRead,
  Scopes.CodeAll,
  Scopes.UserProfileRead,
];
const PUBLIC_TOKEN_SCOPES = [
  Scopes.ViewablesRead,
  Scopes.DataRead,
  Scopes.DataWrite,
  Scopes.CodeAll,
  Scopes.UserProfileRead,
];

module.exports = {
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  SERVER_SESSION_SECRET,
  INTERNAL_TOKEN_SCOPES,
  PUBLIC_TOKEN_SCOPES,
  PORT,
};
