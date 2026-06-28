import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { BuildingOfficeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useClinics } from '@/services/clinics';
import { Skeleton } from '@/components/ui/skeleton';

// Fix default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper component to adjust bounds
function MapBounds({ clinics }: { clinics: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (clinics.length > 0) {
      const bounds = L.latLngBounds(clinics.map(c => [c.latitude, c.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [clinics, map]);
  return null;
}

export function ClinicsMap() {
  const navigate = useNavigate();
  const [activeCity, setActiveCity] = useState<'All' | 'Astana' | 'Almaty' | 'Shymkent'>('All');
  
  // Use the real clinics data
  const { data: allClinics, isLoading } = useClinics('', '');
  
  const clinicsOnMap = (allClinics || [])
    .filter(c => c.latitude && c.longitude)
    .filter(c => activeCity === 'All' || c.city === activeCity);

  const [selectedPin, setSelectedPin] = useState<any | null>(null);
  const mapRef = useRef<any>(null);

  const handleSelectClinic = (clinic: any) => {
    setSelectedPin(clinic);
    if (mapRef.current) {
      mapRef.current.flyTo([clinic.latitude, clinic.longitude], 14, { duration: 0.8 });
    }
  };

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm flex flex-col lg:flex-row min-h-[400px] lg:h-[450px]">
      {/* Map area */}
      <div className="flex-1 min-h-[300px] lg:min-h-0 relative flex items-center justify-center bg-muted/20 border-b lg:border-b-0 lg:border-r border-border overflow-hidden z-0">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <span className="text-muted-foreground text-sm font-medium">Загрузка карты...</span>
          </div>
        ) : (
          <MapContainer
            center={[48.0196, 66.9237]}
            zoom={5}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            ref={mapRef}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBounds clinics={clinicsOnMap} />
            
            {clinicsOnMap.map(clinic => (
              <Marker
                key={clinic.id}
                position={[clinic.latitude, clinic.longitude]}
                icon={selectedPin?.id === clinic.id ? selectedIcon : defaultIcon}
                eventHandlers={{
                  click: () => handleSelectClinic(clinic),
                }}
              >
                <Popup>
                  <div className="font-semibold">{clinic.name}</div>
                  <div className="text-xs text-muted-foreground">{clinic.address}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Floating Controls */}
        <div className="absolute top-4 left-14 z-[1000] flex gap-2">
          {(['All', 'Astana', 'Almaty', 'Shymkent'] as const).map(city => (
            <button
              key={city}
              onClick={() => {
                setActiveCity(city);
                setSelectedPin(null);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm border transition-all ${
                activeCity === city 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card text-foreground border-border hover:bg-muted'
              }`}
            >
              {city === 'All' ? 'Все' : city}
            </button>
          ))}
        </div>
      </div>

      {/* Details Side Panel */}
      <div className="w-full lg:w-80 bg-card p-4 sm:p-6 flex flex-col justify-between overflow-y-auto select-text min-h-[220px] shrink-0 z-10 relative">
        {selectedPin ? (
          <div className="space-y-6 flex-grow animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-3">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                {selectedPin.city}
              </Badge>
              <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
                <BuildingOfficeIcon className="w-6 h-6 text-primary shrink-0" />
                <span>{selectedPin.name}</span>
              </h3>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-start space-x-2 text-sm">
                <MapPinIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{selectedPin.address}</span>
              </div>
              {selectedPin.phone && (
                <div className="flex items-start space-x-2 text-sm">
                  <PhoneIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground font-mono">{selectedPin.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-6">
              <button 
                onClick={() => navigate(`/clinics/${selectedPin.id}`)}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all shadow-sm text-sm"
              >
                Открыть прайс-лист клиники
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-10 space-y-3 flex-grow animate-in fade-in">
            <MapPinIcon className="w-10 h-10 opacity-20" />
            <p className="text-sm font-medium">Выберите булавку на карте</p>
            <p className="text-xs opacity-75">Нажмите на маркер любой клиники, чтобы посмотреть контакты и адрес.</p>
          </div>
        )}
      </div>
    </div>
  );
}
