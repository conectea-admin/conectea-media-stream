import { GoogleAuth } from "google-auth-library";
import { env } from "./env";

export async function getGoogleAccessToken() {
  const serviceAccountJson = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson)
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON");

  const credentials = JSON.parse(serviceAccountJson);

  const auth = new GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse?.token;

  if (!accessToken) throw new Error("Failed to obtain Google access token");

  return accessToken;
}
