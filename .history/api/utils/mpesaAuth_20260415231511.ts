import "dotenv/config";

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;

if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
  throw new Error(
    "MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET must be set in environment variables. " +
    "Check your Vercel dashboard environment variables."
  );
}

let tokenCache = {
  token: "",
  expiresAt: 0,
};

/**
 * Generates an access token from Safaricom M-Pesa API
 * Tokens are cached for 3595 seconds (just under the 3600 second validity)
 * to avoid unnecessary API calls.
 * 
 * This function includes robust credential handling and detailed error logging
 * to diagnose Safaricom OAuth issues.
 */
export async function getMpesaAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid
  if (tokenCache.token && tokenCache.expiresAt > now) {
    console.log("[M-Pesa] Using cached access token");
    return tokenCache.token;
  }

  try {
    console.log("[M-Pesa] Generating new access token from Safaricom...");

    // Get credentials from environment and trim any hidden whitespace
    const consumerKey = process.env.MPESA_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET?.trim();

    if (!consumerKey) {
      throw new Error("MPESA_CONSUMER_KEY is not defined or is empty");
    }
    if (!consumerSecret) {
      throw new Error("MPESA_CONSUMER_SECRET is not defined or is empty");
    }

    console.log("[M-Pesa] Credentials loaded and trimmed");

    // Create base64 encoded auth string using Buffer for Node.js
    const authString = `${consumerKey}:${consumerSecret}`;
    const auth = Buffer.from(authString).toString("base64");

    console.log("[M-Pesa] Authorization header prepared (Basic auth with base64)");

    // Request access token from Safaricom
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    console.log("[M-Pesa] Sending OAuth request to Safaricom...");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    console.log(`[M-Pesa] Safaricom response status: ${response.status}`);

    // Always attempt to parse response as JSON for detailed error messages
    let data: any;
    try {
      data = await response.json();
    } catch {
      // If JSON parse fails, get text response
      const text = await response.text();
      console.error("[M-Pesa] Failed to parse Safaricom response as JSON:", text);
      throw new Error(`Safaricom returned invalid JSON: ${text}`);
    }

    // Check for errors in the response
    if (!response.ok) {
      console.error("[M-Pesa] Safaricom Error Response:", JSON.stringify(data));
      throw new Error(
        data.errorMessage || data.error || `OAuth failed with status ${response.status}`
      );
    }

    // Validate access token is present
    if (!data.access_token) {
      console.error("[M-Pesa] No access_token in successful response:", JSON.stringify(data));
      throw new Error("Safaricom response successful but no access_token provided");
    }

    // Cache the token for 3595 seconds (just under 3600 second expiry)
    tokenCache.token = data.access_token;
    tokenCache.expiresAt = now + 3595 * 1000;

    console.log("[M-Pesa] ✅ Access token generated and cached successfully");
    return data.access_token;
  } catch (error: any) {
    console.error("[M-Pesa] ❌ Token generation failed:", error.message);
    throw new Error(`Failed to get M-Pesa access token: ${error.message}`);
  }
}

/**
 * Generates M-Pesa password for STK Push
 * Format: base64(BusinessShortCode + Passkey + Timestamp)
 * Timestamp format: YYYYMMDDHHmmss
 */
export function generateMpesaPassword(timestamp: string): string {
  const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
  const MPESA_PASSKEY = process.env.MPESA_PASSKEY;

  if (!MPESA_SHORTCODE) {
    throw new Error("MPESA_SHORTCODE is missing from environment variables");
  }
  if (!MPESA_PASSKEY) {
    throw new Error("MPESA_PASSKEY is missing from environment variables");
  }

  const dataToEncode = `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`;
  const encodedPassword = Buffer.from(dataToEncode).toString("base64");

  console.log("[M-Pesa] Password generated for timestamp:", timestamp);
  return encodedPassword;
}

/**
 * Generates timestamp in YYYYMMDDHHmmss format
 */
export function generateTimestamp(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${date}${hours}${minutes}${seconds}`;
}
