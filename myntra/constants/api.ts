// API Configuration
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

// Default to localhost for Web/Simulator development. 
// Change to your local IP (e.g. 192.168.x.x) only if testing on a Physical Device.
export const API_BASE_URL = configuredBaseUrl || "http://localhost:5000";

// Your detected Local IP (for Physical Device testing):
// 192.168.29.161