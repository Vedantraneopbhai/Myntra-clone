// API Configuration
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

// Production URL for Vercel deployment
export const API_BASE_URL = configuredBaseUrl || "https://myntra-clone-1-jfcp.onrender.com";

// Your detected Local IP (for Physical Device testing):
// 192.168.29.161