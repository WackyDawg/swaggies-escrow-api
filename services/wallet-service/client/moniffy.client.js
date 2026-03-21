import 'dotenv/config';
import axios from "axios";

const isDev = process.env.NODE_ENV === "development";
const baseURL = (isDev ? process.env.MONNIFY_SANDBOX_URL : process.env.MONNIFY_BASE_URL) || "https://sandbox.monnify.com";

const monnifyClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export default monnifyClient;
