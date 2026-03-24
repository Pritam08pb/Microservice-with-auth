import axios from "axios";

export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://192.168.1.40:4001",
  timeout: 10000, 
  headers: {
    "Content-Type": "application/json",
  }
});
