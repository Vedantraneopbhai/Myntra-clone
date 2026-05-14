import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const saveUserData = async (
  _id: string,
  name: string,
  email: string
) => {
  if (isWeb) {
    localStorage.setItem("userid", _id);
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
  } else {
    await SecureStore.setItemAsync("userid", _id);
    await SecureStore.setItemAsync("userName", name);
    await SecureStore.setItemAsync("userEmail", email);
  }
};

export const getUserData = async () => {
  let _id, name, email;
  
  if (isWeb) {
    _id = localStorage.getItem("userid");
    name = localStorage.getItem("userName");
    email = localStorage.getItem("userEmail");
  } else {
    _id = await SecureStore.getItemAsync("userid");
    name = await SecureStore.getItemAsync("userName");
    email = await SecureStore.getItemAsync("userEmail");
  }
  
  return { _id, name, email };
};

export const clearUserData = async () => {
  if (isWeb) {
    localStorage.removeItem("userid");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
  } else {
    await SecureStore.deleteItemAsync("userid");
    await SecureStore.deleteItemAsync("userName");
    await SecureStore.deleteItemAsync("userEmail");
  }
};
