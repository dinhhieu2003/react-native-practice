import { Client, IMessage, StompSubscription, ActivationState } from '@stomp/stompjs';
// import SockJS from 'sockjs-client'; // Removed unused import causing type error
import { NotificationItem } from '@/utils/types/type'; // Import your Notification type
import * as SecureStore from 'expo-secure-store';

const WS_ENDPOINT = '/ws'; // Your STOMP endpoint
const NOTIFICATION_TOPIC = '/user/queue/notifications'; // Your user-specific notification topic
const RECONNECT_DELAY_BASE = 5000; // Initial reconnect delay in ms
const MAX_RECONNECT_ATTEMPTS = 5; // Limit reconnection attempts

// Define the expected structure of the notification payload received via WebSocket
// This should match what your backend sends
interface NotificationPayload extends NotificationItem { }

class WebSocketServiceController {
    private client: Client | null = null;
    private notificationSubscription: StompSubscription | null = null;
    private notificationCallback: ((payload: NotificationPayload) => void) | null = null;
    private reconnectAttempts = 0;
    private reconnectTimeoutId: NodeJS.Timeout | null = null;
    private baseUrl: string | undefined = process.env.EXPO_PUBLIC_BASE_URL;

    constructor() {
        if (!this.baseUrl) {
            console.error("WebSocketService: EXPO_PUBLIC_BASE_URL is not defined!");
            // Handle the error appropriately - maybe throw or disable the service
        }
    }

    private getBrokerURL(): string | null {
        if (!this.baseUrl) return null;
        // Determine ws:// or wss:// based on http:// or https://
        const protocol = this.baseUrl.startsWith('https') ? 'wss' : 'ws';
        // Remove http(s):// prefix to construct WebSocket URL
        const domain = this.baseUrl.replace(/^https?:\/\//, '');
        const url = `${protocol}://${domain}${WS_ENDPOINT}`;
        console.log("WebSocket Broker URL:", url);
        return url;
    }

    private clearReconnectTimer() {
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }
    }

    private scheduleReconnect() {
        this.clearReconnectTimer();
        if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.warn('WebSocketService: Maximum reconnect attempts reached.');
            return; // Stop trying to reconnect
        }

        const delay = RECONNECT_DELAY_BASE * Math.pow(2, this.reconnectAttempts);
        console.log(`WebSocketService: Scheduling reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`);

        this.reconnectTimeoutId = setTimeout(() => {
            this.reconnectAttempts++;
            console.log('WebSocketService: Attempting to reconnect...');
            this.connect(); // Try connecting again
        }, delay);
    }

    async connect(): Promise<void> {
        if (this.client?.active) {
            console.log('WebSocketService: Already connected or connecting.');
            return;
        }

        const brokerURL = this.getBrokerURL();
        if (!brokerURL) {
             console.error("WebSocketService: Cannot connect without a valid Broker URL.");
            return;
        }

        const jwtToken = await SecureStore.getItemAsync('accessToken');
        console.log('WebSocketService: JWT token:', jwtToken);
        if (!jwtToken) {
            console.warn('WebSocketService: No JWT token found. Cannot connect.');
            // Optionally, trigger logout or prompt login
            return;
        }

        console.log('WebSocketService: Creating new STOMP client...');
        this.client = new Client({
            brokerURL: brokerURL,
            // Use SockJS wrapper if needed by your backend
            // webSocketFactory: () => new SockJS(brokerURL.replace(/^ws/,'http')) as WebSocket,
            connectHeaders: {
                Authorization: `Bearer ${jwtToken}`,
            },
            debug: (str) => {
                // Avoid logging sensitive info like tokens in production
                if (process.env.NODE_ENV === 'development') {
                     console.log('STOMP Debug:', str);
                }
            },
            reconnectDelay: 0, // Disable automatic library reconnect, handle manually
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onConnect: (frame) => {
                console.log('WebSocketService: Connected to STOMP broker.');
                this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
                this.clearReconnectTimer(); // Clear any pending reconnect timer
                // Subscribe to notifications if a callback is registered
                if (this.notificationCallback) {
                    this.subscribeToNotifications(this.notificationCallback);
                }
            },

            onStompError: (frame) => {
                console.error('WebSocketService: Broker reported STOMP error:', frame.headers['message'], frame.body);
                // Consider specific actions based on error type
                this.scheduleReconnect();
            },

            onWebSocketError: (event) => {
                console.error('WebSocketService: WebSocket error:', event);
                // WebSocket errors often lead to disconnects, schedule reconnect
                 this.scheduleReconnect();
            },

            onDisconnect: (frame) => {
                console.log('WebSocketService: Disconnected from STOMP broker.');
                this.notificationSubscription = null; // Clear subscription
                // Only schedule reconnect if it wasn't an intentional disconnect
                if (!frame?.headers?.message?.includes('Close initiated by client')) {
                    this.scheduleReconnect();
                }
            },
             // Add other handlers as needed (e.g., onWebSocketClose)
        });

        console.log('WebSocketService: Activating STOMP client...');
        this.client.activate();
    }

    disconnect(): void {
        this.clearReconnectTimer(); // Prevent reconnect attempts after manual disconnect
        this.reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Prevent future automatic reconnects
        if (this.client?.active) {
            console.log('WebSocketService: Deactivating STOMP client...');
            this.client.deactivate();
            this.client = null;
            this.notificationSubscription = null;
        } else {
            console.log('WebSocketService: Client already inactive.');
        }
    }

    subscribeToNotifications(callback: (payload: NotificationPayload) => void): void {
        this.notificationCallback = callback; // Store callback for reconnections

        if (!this.client?.active) {
            console.warn('WebSocketService: Client not connected. Cannot subscribe yet.');
            // Attempt to connect if not already connecting/connected
             if (this.getClientState() !== 'CONNECTING') {
                 this.connect();
             }
            return;
        }

        if (this.notificationSubscription) {
            console.log('WebSocketService: Already subscribed to notifications.');
            return;
        }

        console.log(`WebSocketService: Subscribing to ${NOTIFICATION_TOPIC}...`);
        try {
             this.notificationSubscription = this.client.subscribe(NOTIFICATION_TOPIC, (message: IMessage) => {
                console.log(`WebSocketService: Received message on ${NOTIFICATION_TOPIC}`);
                try {
                    const payload: NotificationPayload = JSON.parse(message.body);
                    console.log('WebSocketService: Parsed notification payload:', payload);
                    callback(payload);
                } catch (error) {
                    console.error('WebSocketService: Error parsing notification message body:', error, message.body);
                }
            }, {
                // Add specific subscription headers if needed
                // ack: 'client-individual' // Example for manual acknowledgment
            });
             console.log('WebSocketService: Subscription successful.');
        } catch (error) {
             console.error('WebSocketService: Error during subscription:', error);
        }
    }

    unsubscribeFromNotifications(): void {
        if (this.notificationSubscription) {
            console.log(`WebSocketService: Unsubscribing from ${NOTIFICATION_TOPIC}...`);
            try {
                 this.notificationSubscription.unsubscribe();
                 this.notificationSubscription = null;
                 this.notificationCallback = null; // Clear stored callback
                 console.log('WebSocketService: Unsubscribed successfully.');
            } catch (error) {
                 console.error('WebSocketService: Error during unsubscribe:', error);
            }
        } else {
            console.log('WebSocketService: No active notification subscription to unsubscribe from.');
        }
    }

    getClientState(): 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | 'DISCONNECTED' | 'UNKNOWN' {
        if (!this.client) return 'DISCONNECTED';

        // Explicitly cast state to number to resolve linter comparison error
        const stateValue = this.client.state as number;

        switch (stateValue) {
            case 0: return 'CONNECTING'; // Assuming CONNECTING is 0
            case 1: return 'CONNECTED';  // Assuming OPEN/ACTIVE is 1
            case 2: return 'DISCONNECTING';// Assuming CLOSING/DEACTIVATING is 2
            case 3: return 'DISCONNECTED'; // Assuming CLOSED/INACTIVE is 3
            default:
                console.warn('WebSocketService: Unknown client state value:', stateValue);
                return 'UNKNOWN';
        }
    }
}

// Export a singleton instance
const WebSocketService = new WebSocketServiceController();
export default WebSocketService; 