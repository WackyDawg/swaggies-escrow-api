import axios from 'axios';
import 'dotenv/config';

const isDev = process.env.NODE_ENV === "development";
const baseURL = (isDev ? process.env.FLW_SANDBOX_URL : process.env.FLW_BASE_URL) || "https://api.flutterwave.com";
const secretKey = isDev ? process.env.FLW_SEC_TEST_KEY : process.env.FLW_SEC_LIVE_KEY;

const flwClient = axios.create({
  baseURL,
  headers: {
    "accept": 'application/json', 
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${secretKey}`
  }
});

export default flwClient;