import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import WebSocketService from '@/services/WebSocketService'; // Import the service
// import { useAuth } from '@/context/AuthContext'; // Removed AuthContext dependency
import * as SecureStore from 'expo-secure-store'; // Import SecureStore
import { NotificationItem } from '@/utils/types/type'; // Use the specific API type
import * as api from '@/api/api'; // Import API functions

// --- Types ---

// Using NotificationItem from type.ts directly
export type { NotificationItem as Notification }; // Re-export for usage within context consumers

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

interface NotificationContextType extends NotificationState {
  setNotifications: (notifications: NotificationItem[], totalItems: number, totalPages: number, currentPage: number, pageSize: number) => void;
  addNotification: (notification: NotificationItem) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: (count?: number) => void; // Decrement by 'count' or 1
  setConnectionStatus: (status: ConnectionStatus) => void;
  markAsRead: (notificationId: string | number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  refreshNotifications: () => Promise<void>; // Add refresh function
  // fetchNotifications: (pageNum: number) => Promise<void>; // Expose fetch with page if needed
}

// --- Context ---

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// --- Provider ---

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Removed useAuth hook
  const [notifications, setNotificationsState] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCountState] = useState<number>(0);
  const [connectionStatus, setConnectionStatusState] = useState<ConnectionStatus>('DISCONNECTED');
  const [isLoading, setIsLoadingState] = useState<boolean>(false); // General loading state
  const [isFetching, setIsFetching] = useState<boolean>(false); // Specific state for API fetches
  const [error, setErrorState] = useState<string | null>(null);
  const [currentPage, setCurrentPageState] = useState<number>(0);
  const [totalPages, setTotalPagesState] = useState<number>(0);
  const [totalItems, setTotalItemsState] = useState<number>(0);
  const [pageSize, setPageSizeState] = useState<number>(10);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Define state setters first
  const setLoading = useCallback((loading: boolean) => {
    setIsLoadingState(loading);
  }, []);

  const setError = useCallback((err: string | null) => {
    setErrorState(err);
    if (err) {
        setConnectionStatusState('ERROR');
    }
  }, []);

  const setConnectionStatus = useCallback((status: ConnectionStatus) => {
    setConnectionStatusState(status);
    if (status !== 'ERROR') {
        setError(null);
    }
  }, [setError]);

  const setUnreadCount = useCallback((count: number) => {
    setUnreadCountState(Math.max(0, count));
  }, []);

  const incrementUnreadCount = useCallback(() => {
    setUnreadCountState((prev) => prev + 1);
  }, []);

  const decrementUnreadCount = useCallback((count: number = 1) => {
    setUnreadCountState((prev) => Math.max(0, prev - count));
  }, []);

  const setNotifications = useCallback((
    newNotifications: NotificationItem[],
    totalItems: number,
    totalPages: number,
    currentPage: number,
    pageSize: number
  ) => {
    setNotificationsState(newNotifications);
    setTotalItemsState(totalItems);
    setTotalPagesState(totalPages);
    setCurrentPageState(currentPage);
    setPageSizeState(pageSize);
    const newUnread = newNotifications.filter(n => !n.read).length;
    setUnreadCount(newUnread);
  }, [setUnreadCount]);

  // Now define functions that use the setters
  const fetchNotifications = useCallback(async (pageNum: number) => {
        console.log(`Context: Fetching notifications page: ${pageNum}`);
        // Use isFetching to prevent concurrent fetches, isLoading might be used by other actions
        if (isFetching) {
             console.log('Context: Already fetching notifications.');
             return;
        }
        setIsFetching(true);
        // Don't clear global error on fetch start, only on success or specific fetch error
        // setError(null); 

        try {
            // Use the default pageSize from state
            const response = await api.WorkspaceNotifications(pageNum, pageSize);
            if (response?.data) {
                const { result, meta } = response.data;
                // Use the setNotifications callback which also updates unread count
                setNotifications(
                    result, // Always replace on fresh fetch/refresh
                    meta.totalItems,
                    meta.totalPages,
                    meta.current,
                    meta.pageSize
                );
                setError(null); // Clear error on successful fetch
            } else {
                 throw new Error(response?.message || 'Failed to fetch notifications: No data returned');
            }
        } catch (err: any) {
            console.error("Context: Error fetching notifications:", err);
            setError(`Failed to load notifications: ${err.message}`);
            // Don't clear notifications on fetch error, keep stale data if available
        } finally {
            setIsFetching(false);
        }
  }, [pageSize, isFetching, setNotifications, setError]);

  const refreshNotifications = useCallback(async () => {
      await fetchNotifications(1); // Refresh always fetches page 1
  }, [fetchNotifications]);

  const addNotification = useCallback((notification: NotificationItem) => {
    setNotificationsState((prev) => [notification, ...prev]);
    if (!notification.read) {
      incrementUnreadCount();
    }
    setTotalItemsState(prev => prev + 1);
  }, [incrementUnreadCount]);

  const markAsRead = useCallback(async (notificationId: string | number): Promise<boolean> => {
    let originalNotification: NotificationItem | undefined;
    let originalIndex = -1;
    let wasUnread = false;
    setNotificationsState(prev => {
        originalIndex = prev.findIndex(n => n.id === notificationId);
        if (originalIndex > -1) {
            originalNotification = prev[originalIndex];
            wasUnread = !originalNotification!.read;
        }
        if (wasUnread) {
            return prev.map((n, index) => index === originalIndex ? { ...n, read: true } : n);
        }
        return prev;
    });
    if (wasUnread) {
        decrementUnreadCount();
    }
    try {
        const response = await api.markNotificationAsRead(notificationId as number);
        if (!response || response.statusCode < 200 || response.statusCode >= 300) {
            throw new Error(response?.message || 'Failed to mark as read on server');
        }
        return true;
    } catch (err: any) {
        setError(`Failed to mark notification as read: ${err.message}`);
        if (wasUnread && originalIndex > -1) {
            setNotificationsState(prev => prev.map((n, index) => index === originalIndex ? originalNotification! : n));
            incrementUnreadCount();
        }
        return false;
    }
  }, [decrementUnreadCount, incrementUnreadCount, setError]);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;
    setNotificationsState(prev => prev.map(n => n.read ? n : { ...n, read: true }));
    setUnreadCount(0);
    setLoading(true);
    setError(null);
    try {
        const response = await api.markAllNotificationsAsRead();
        if (!response || response.statusCode < 200 || response.statusCode >= 300) {
             throw new Error(response?.message || 'Failed to mark all as read on server');
        }
         return true;
    } catch (err: any) {
         setError(`Failed to mark all as read: ${err.message}`);
         setNotificationsState(originalNotifications);
         setUnreadCount(originalUnreadCount);
         return false;
    } finally {
        setLoading(false);
    }
  }, [notifications, unreadCount, setUnreadCount, setLoading, setError]);

  const setCurrentPage = useCallback((page: number) => {
      setCurrentPageState(page);
  }, []);

  // --- Check Auth Status Effect ---
  useEffect(() => {
    const checkAuthStatus = async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        setIsAuthenticated(!!token);
    };
    checkAuthStatus();
  }, []);

  // --- Initial Fetch Effect ---
  useEffect(() => {
    // Fetch initial notifications when user becomes authenticated
    if (isAuthenticated) {
        console.log("Context: User authenticated, fetching initial notifications...");
        fetchNotifications(1);
    } else {
        // Clear notifications if user logs out
        console.log("Context: User logged out, clearing notifications.");
        setNotificationsState([]);
        setUnreadCount(0);
        setTotalPagesState(0);
        setTotalItemsState(0);
        setCurrentPageState(0);
    }
  }, [isAuthenticated, fetchNotifications]); // Run when auth status changes

  // --- WebSocket Integration Effect ---
  useEffect(() => {
    let isMounted = true;
    let statusInterval: NodeJS.Timeout | null = null;
    const manageWebSocket = async () => {
        if (isAuthenticated) {
            if (isMounted) setConnectionStatus('CONNECTING');
            await WebSocketService.connect();
            if (isMounted) {
                WebSocketService.subscribeToNotifications((payload: NotificationItem) => {
                    if (!isMounted) return;
                    addNotification(payload);
                });
                statusInterval = setInterval(() => {
                    if (!isMounted) return;
                    const wsStatus = WebSocketService.getClientState();
                    let contextStatus: ConnectionStatus;
                    switch (wsStatus) {
                        case 'CONNECTED': contextStatus = 'CONNECTED'; break;
                        case 'CONNECTING':
                        case 'DISCONNECTING':
                        case 'UNKNOWN': contextStatus = 'CONNECTING'; break;
                        case 'DISCONNECTED':
                        default: contextStatus = 'DISCONNECTED'; break;
                    }
                    setConnectionStatusState(prevStatus => prevStatus === contextStatus ? prevStatus : contextStatus);
                }, 5000);
            }
        } else {
            WebSocketService.disconnect();
            if (isMounted) setConnectionStatus('DISCONNECTED');
        }
    };
    manageWebSocket();
    return () => {
        isMounted = false;
        if (statusInterval) {
            clearInterval(statusInterval);
        }
        WebSocketService.unsubscribeFromNotifications();
        WebSocketService.disconnect();
    };
  }, [isAuthenticated, addNotification, setConnectionStatus]);

  const value: NotificationContextType = {
      notifications,
      unreadCount,
      connectionStatus,
      isLoading: isLoading || isFetching, // Combine loading states for consumers
      error,
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      setNotifications,
      addNotification,
      setUnreadCount,
      incrementUnreadCount,
      decrementUnreadCount,
      setConnectionStatus,
      markAsRead,
      markAllAsRead,
      setLoading,
      setError,
      setCurrentPage,
      refreshNotifications, // Expose refresh function
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// --- Hook ---

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 