import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:7001/api", // your backend
  withCredentials: true,
});

export default API;
