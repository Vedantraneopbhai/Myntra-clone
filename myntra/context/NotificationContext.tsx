import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../constants/api';

interface NotificationContextType {
  expoPushToken: string | undefined;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { expoPushToken, notification } = usePushNotifications();
  const { user } = useAuth();
  const router = useRouter();

  // Register token with backend when token is available and user is logged in
  useEffect(() => {
    const registerToken = async () => {
      if (expoPushToken && user?._id) {
        try {
          await axios.post(`${API_BASE_URL}/notifications/register-token`, {
            userId: user._id,
            token: expoPushToken,
            platform: 'web', // Set to web for browser testing
          });
          console.log('Push token registered with backend');
        } catch (error) {
          console.error('Failed to register push token with backend:', error);
        }
      }
    };

    registerToken();
  }, [expoPushToken, user]);

  // Handle incoming notification data (e.g. navigation)
  useEffect(() => {
    if (notification) {
      const { data } = notification.request.content;
      console.log('Incoming notification data:', data);
      
      // Example navigation logic
      if (data?.screen) {
        // router.push(data.screen as any);
      }
    }
  }, [notification]);

  return (
    <NotificationContext.Provider value={{ expoPushToken }}>
      {children}
    </NotificationContext.Provider>
  );
};
