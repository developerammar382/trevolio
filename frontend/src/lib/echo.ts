import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Echo
if (typeof window !== 'undefined') {
    (window as any).Pusher = Pusher;
}

let echoInstance: Echo | null = null;

export const getEcho = (token?: string | null): Echo => {
    if (echoInstance) {
        return echoInstance;
    }

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    // Enable Pusher logging in development
    if (process.env.NODE_ENV === 'development') {
        Pusher.logToConsole = true;
    }

    echoInstance = new Echo({
        broadcaster: 'pusher', // Reverb uses Pusher protocol
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        cluster: 'mt1', // Required by pusher-js even for custom hosts
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
        wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
        wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        disableStats: true, // Disable Pusher stats
        authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
        auth: {
            headers: authToken ? {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/json',
            } : {},
        },
    });

    // Log connection status
    if (typeof window !== 'undefined') {
        console.log('🔌 Echo initialized with config:', {
            key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
            wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
            wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
            authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
        });
    }

    return echoInstance;
};

export const disconnectEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};
