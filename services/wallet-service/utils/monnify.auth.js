import monnifyClient from "../client/moniffy.client.js";

export async function monnifyAuth() {
  try {
    const apiKey = process.env.MONNIFY_API_KEY;
    const secretKey = process.env.MONNIFY_SECRET_KEY;

    const authString = `${apiKey}:${secretKey}`;
    const encodedAuthString = Buffer.from(authString).toString("base64");

    const authRes = await monnifyClient.post(
      "/api/v1/auth/login",
      {},
      {
        headers: {
          Authorization: `Basic ${encodedAuthString}`,
          "Content-Type": "application/json"
        }
      }
    );

    const token = authRes.data.responseBody.accessToken;
    return token;
  } catch (error) {
    console.error("Monnify Auth Error:", error.response?.data || error);
    throw new Error("Failed to authenticate with Monnify");
  }
}

// export async function initMonnify() {
//   try {
//     const token = await monnifyAuth();
//     monnifyClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     // console.log("[Monnify] initialized with token:", token);
//   } catch (error) {
//     console.error("Failed to initialize Monnify:", error);
//     throw error;
//   }
// }
