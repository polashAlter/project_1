import { OAuth2Client } from "google-auth-library";
import config from "../config";

const GOOGLE_CLIENT_ID = config.google.client_id;
const GOOGLE_CLIENT_SECRET = config.google.client_secret;

const redirectURL = config.google.redirect_url;

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  redirectURL,
);

export default oauth2Client;
