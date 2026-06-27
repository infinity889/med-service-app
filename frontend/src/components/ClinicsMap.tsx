import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { BuildingOfficeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

interface MapClinicPin {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  x: number; // percentage from left
  y: number; // percentage from top
  verified: boolean;
}

const CLINIC_PINS: MapClinicPin[] = [
  {
    id: '1',
    name: 'KDL Olymp',
    city: 'Astana',
    address: 'пр. Мангилик Ел 53, Блок С',
    phone: '+7 (7172) 55-00-00',
    x: 48,
    y: 35,
    verified: true
  },
  {
    id: '2',
    name: 'Invitro',
    city: 'Astana',
    address: 'ул. Достык 18',
    phone: '+7 (7172) 12-34-56',
    x: 52,
    y: 32,
    verified: true
  },
  {
    id: '3',
    name: 'Orhun Medical',
    city: 'Almaty',
    address: 'ул. Маркова 71',
    phone: '+7 (727) 333-22-11',
    x: 65,
    y: 80,
    verified: true
  },
  {
    id: '4',
    name: 'Sunkar',
    city: 'Shymkent',
    address: 'ул. Иляева 15',
    phone: '+7 (7252) 55-44-33',
    x: 35,
    y: 85,
    verified: false
  }
];

export function ClinicsMap() {
  const navigate = useNavigate();
  const [selectedPin, setSelectedPin] = useState<MapClinicPin | null>(null);
  const [activeCity, setActiveCity] = useState<'All' | 'Astana' | 'Almaty' | 'Shymkent'>('All');

  const filteredPins = activeCity === 'All' 
    ? CLINIC_PINS 
    : CLINIC_PINS.filter(pin => pin.city === activeCity);

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm flex flex-col lg:flex-row min-h-[320px] lg:h-[450px]">
      {/* Map area */}
      <div className="flex-1 min-h-[220px] sm:min-h-[280px] lg:min-h-0 bg-slate-900 relative flex items-center justify-center p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-border overflow-hidden">
        {/* Kazakhstan SVG Vector Map mockup (Clean abstract geometry for high aesthetic value) */}
        <svg 
          viewBox="0 0 800 450" 
          className="w-full h-full max-w-2xl opacity-40 select-none pointer-events-none"
        >
          {/* Main country border approximation */}
          <path 
            d="M 120,250 C 130,220 200,150 250,130 C 350,110 500,100 650,140 C 720,160 760,200 780,260 C 770,300 730,340 700,360 C 650,380 500,420 400,400 C 350,390 280,410 200,380 C 150,360 110,320 120,250 Z" 
            fill="none" 
            stroke="#475569" 
            strokeWidth="3" 
            strokeDasharray="8,8"
          />
          {/* Outer region grid */}
          <line x1="200" y1="0" x2="200" y2="450" stroke="#1e293b" strokeWidth="1" />
          <line x1="400" y1="0" x2="400" y2="450" stroke="#1e293b" strokeWidth="1" />
          <line x1="600" y1="0" x2="600" y2="450" stroke="#1e293b" strokeWidth="1" />
          <line x1="0" y1="150" x2="800" y2="150" stroke="#1e293b" strokeWidth="1" />
          <line x1="0" y1="300" x2="800" y2="300" stroke="#1e293b" strokeWidth="1" />
        </svg>

        {/* Dynamic Interactive Clinic Pins */}
        {filteredPins.map(pin => (
          <button
            key={pin.id}
            onClick={() => setSelectedPin(pin)}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-background border-2 shadow-lg transition-all active:scale-95 ${
              selectedPin?.id === pin.id 
                ? 'border-primary scale-125 bg-primary text-primary-foreground' 
                : 'border-muted-foreground bg-card text-foreground hover:border-primary'
            }`}
            title={pin.name}
          >
            <MapPinIcon className="w-4 h-4 shrink-0" />
          </button>
        ))}

        {/* Ambient Map overlay metadata */}
        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] text-slate-400 px-3 py-1.5 rounded-lg font-mono flex flex-col space-y-1">
          <span>SYS STATUS: COMPLIANT</span>
          <span>COVERAGE: ASTANA, ALMATY, SHYMKENT</span>
          <span>ACTIVE PINS: {filteredPins.length}</span>
        </div>

        {/* Quick Zoom / Filter Buttons inside Map */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto flex flex-wrap gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
          {(['All', 'Astana', 'Almaty', 'Shymkent'] as const).map(city => (
            <button
              key={city}
              onClick={() => {
                setActiveCity(city);
                setSelectedPin(null);
              }}
              className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
                activeCity === city 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {city === 'All' ? 'Все' : city}
            </button>
          ))}
        </div>
      </div>

      {/* Details Side Panel */}
      <div className="w-full lg:w-80 bg-card p-4 sm:p-6 flex flex-col justify-between overflow-y-auto select-text min-h-[180px]">
        {selectedPin ? (
          <div className="space-y-6 flex-grow">
            <div className="space-y-3">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                {selectedPin.city}
              </Badge>
              <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
                <BuildingOfficeIcon className="w-6 h-6 text-primary shrink-0" />
                <span>{selectedPin.name}</span>
              </h3>
              {selectedPin.verified && (
                <span className="inline-flex text-[10px] font-semibold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Проверено
                </span>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-start space-x-2 text-sm">
                <MapPinIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{selectedPin.address}</span>
              </div>
              <div className="flex items-start space-x-2 text-sm">
                <PhoneIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground font-mono">{selectedPin.phone}</span>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => navigate(`/clinics/${selectedPin.id}`)}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all shadow-sm shadow-primary/10 text-sm"
              >
                Открыть прайс-лист клиники
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-10 space-y-3 flex-grow">
            <MapPinIcon className="w-10 h-10 opacity-20" />
            <p className="text-sm font-medium">Выберите булавку на карте</p>
            <p className="text-xs opacity-75">Нажмите на маркер любой клиники, чтобы посмотреть контакты и адрес.</p>
          </div>
        )}
      </div>
    </div>
  );
}
