import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet clean icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface GeofenceMapProps {
    polygon: { lat: number, lng: number }[];
    initialLocation?: { lat: number, lng: number } | null;
    onLocationSelect: (lat: number, lng: number) => void;
    readOnly?: boolean;
}

function LocationMarker({ onSelect, initialPos }: { onSelect: (lat: number, lng: number) => void, initialPos?: { lat: number, lng: number } | null }) {
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(initialPos || null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    )
}

export function GeofenceMap({ polygon, initialLocation, onLocationSelect, readOnly = false }: GeofenceMapProps) {
    // Center map on the first point of polygon or default
    const center = polygon.length > 0 ? [polygon[0].lat, polygon[0].lng] : [0, 0];

    // Convert polygon for Leaflet (array of arrays)
    const leafletPolygon = polygon.map(p => [p.lat, p.lng] as [number, number]);

    return (
        <div className="w-full h-[400px] rounded-xl overflow-hidden border border-white/10 relative z-0">
            <MapContainer
                center={center as L.LatLngExpression}
                zoom={16}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                {/* Dark Matter Tiles for premium look */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <Polygon
                    positions={leafletPolygon}
                    pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.1, weight: 2 }}
                />

                {!readOnly && (
                    <LocationMarker onSelect={onLocationSelect} initialPos={initialLocation} />
                )}

                {initialLocation && readOnly && (
                    <Marker position={initialLocation}></Marker>
                )}
            </MapContainer>
        </div>
    );
}
