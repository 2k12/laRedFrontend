import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Location Coordinates Interface
export interface Coordinates {
    latitude: number;
    longitude: number;
}

interface LocationContextType {
    userLocation: Coordinates | null;
    error: string | null;
    isLoading: boolean;
    calculateDistance: (targetLat: number, targetLng: number) => number; // Returns meters
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setIsLoading(false);
            return;
        }

        console.log("📍 Initializing Location Service...");

        // Watch Position for real-time updates
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Basic debounce or precision check could go here if needed
                setUserLocation({ latitude, longitude });
                setIsLoading(false);
                // console.log("📍 Location Updated:", latitude, longitude);
            },
            (err) => {
                console.error("📍 Location Error:", err.message);
                if (err.code === 1) { // PERMISSION_DENIED
                    setError('Permission denied');
                } else if (err.code === 2) { // POSITION_UNAVAILABLE
                    setError('Position unavailable');
                } else if (err.code === 3) { // TIMEOUT
                    setError('Timeout');
                }
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Haversine Formula to calculate distance in meters
    const calculateDistance = (targetLat: number, targetLng: number): number => {
        if (!userLocation) return Infinity;

        const R = 6371e3; // Earth radius in meters
        const φ1 = userLocation.latitude * Math.PI / 180;
        const φ2 = targetLat * Math.PI / 180;
        const Δφ = (targetLat - userLocation.latitude) * Math.PI / 180;
        const Δλ = (targetLng - userLocation.longitude) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    return (
        <LocationContext.Provider value={{ userLocation, error, isLoading, calculateDistance }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
