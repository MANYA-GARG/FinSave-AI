import axios from "axios";

console.log("DEBUG: API Base URL is ->", import.meta.env.VITE_API_BASE_URL);

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:7001/api", // your backend
  withCredentials: true,
});

export default API;
