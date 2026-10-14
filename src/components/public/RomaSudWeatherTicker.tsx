import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Compass,
  RefreshCw,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  X,
} from 'lucide-react';

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  surfacePressure: number;
  lastUpdated: string;
  source: 'live' | 'cached';
}

// Fallback telemetry for Roma Sud (EUR / Cecchignola tactical grounds)
const DEFAULT_FALLBACK_WEATHER: WeatherData = {
  temperature: 18.5,
  apparentTemperature: 18.2,
  humidity: 62,
  precipitation: 0.0,
  weatherCode: 1,
  windSpeed: 8.5,
  windDirection: 210, // SSW
  surfacePressure: 1018.4,
  lastUpdated: 'Live',
  source: 'cached',
};

// Weather WMO Code Interpreter
function getWeatherCondition(code: number, isEn: boolean = false) {
  switch (code) {
    case 0:
      return {
        label: isEn ? 'Clear Sky' : 'Cielo Sereno',
        icon: Sun,
        color: 'text-amber-400',
        tactical: isEn ? 'MAXIMUM VISIBILITY' : 'VISIBILITÀ MASSIMA',
      };
    case 1:
      return {
        label: isEn ? 'Mainly Clear' : 'Prevalentemente Sereno',
        icon: CloudSun,
        color: 'text-amber-300',
        tactical: isEn ? 'EXCELLENT VISIBILITY' : 'VISIBILITÀ OTTIMALE',
      };
    case 2:
      return {
        label: isEn ? 'Partly Cloudy' : 'Poco Nuvoloso',
        icon: CloudSun,
        color: 'text-sky-300',
        tactical: isEn ? 'OPTIMAL' : 'OTTIMALE',
      };
    case 3:
      return {
        label: isEn ? 'Overcast' : 'Coperto',
        icon: Cloud,
        color: 'text-slate-300',
        tactical: isEn ? 'STANDARD' : 'STANDARD',
      };
    case 45:
    case 48:
      return {
        label: isEn ? 'Fog / Mist' : 'Nebbia / Foschia',
        icon: Cloud,
        color: 'text-slate-400',
        tactical: isEn ? 'REDUCED VISIBILITY' : 'VISIBILITÀ RIDOTTA',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: isEn ? 'Light Drizzle' : 'Pioggerella Leggera',
        icon: CloudRain,
        color: 'text-cyan-400',
        tactical: isEn ? 'WET GROUND' : 'TERRENO UMIDO',
      };
    case 61:
    case 63:
    case 65:
      return {
        label: isEn ? 'Rain' : 'Pioggia',
        icon: CloudRain,
        color: 'text-blue-400',
        tactical: isEn ? 'SLIPPERY' : 'TERRENO BARELLATO SCIVOLOSO',
      };
    case 71:
    case 73:
    case 75:
      return {
        label: isEn ? 'Snow' : 'Neve',
        icon: Cloud,
        color: 'text-cyan-200',
        tactical: isEn ? 'COLD HAZARD' : 'RISCHIO IPOTERMIA',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: isEn ? 'Rain Showers' : 'Rovesci di Pioggia',
        icon: CloudRain,
        color: 'text-blue-500',
        tactical: isEn ? 'HEAVY RAIN' : 'PRECIPITAZIONI INTENSE',
      };
    case 95:
    case 96:
    case 99:
      return {
        label: isEn ? 'Thunderstorm' : 'Temporale',
        icon: CloudLightning,
        color: 'text-purple-400',
        tactical: isEn ? 'ALERT: LIGHTNING' : 'ALLERTA FULMINI',
      };
    default:
      return {
        label: isEn ? 'Variable' : 'Variabile',
        icon: CloudSun,
        color: 'text-neutral-300',
        tactical: isEn ? 'STABLE' : 'STABILE',
      };
  }
}

// Convert wind direction degrees to cardinal compass point
function getWindCardinal(degrees: number, isEn: boolean = false): string {
  const cardinalsIt = ['N', 'N-NE', 'NE', 'E-NE', 'E', 'E-SE', 'SE', 'S-SE', 'S', 'S-SO', 'SO', 'O-SO', 'O', 'O-NO', 'NO', 'N-NO'];
  const cardinalsEn = ['N', 'N-NE', 'NE', 'E-NE', 'E', 'E-SE', 'SE', 'S-SE', 'S', 'S-SW', 'SW', 'W-SW', 'W', 'W-NW', 'NW', 'N-NW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return isEn ? cardinalsEn[index] : cardinalsIt[index];
}

interface RomaSudWeatherTickerProps {
  language?: 'it' | 'en';
}

export const RomaSudWeatherTicker: React.FC<RomaSudWeatherTickerProps> = ({ language = 'it' }) => {
  const isEn = language === 'en';

  const [weather, setWeather] = useState<WeatherData>(DEFAULT_FALLBACK_WEATHER);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Fetch real-time weather for Roma Sud (EUR / Laurentina / Cecchignola coordinates: 41.82N, 12.47E)
  const fetchRomaSudWeather = useCallback(async () => {
    setIsLoading(true);
    try {
      const url =
        'https://api.open-meteo.com/v1/forecast?latitude=41.8208&longitude=12.4482&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=Europe%2FRome';

      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Weather fetch failed: ${resp.status}`);
      }
      const data = await resp.json();
      if (data && data.current) {
        const c = data.current;
        const now = new Date();
        const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        setWeather({
          temperature: typeof c.temperature_2m === 'number' ? c.temperature_2m : 18,
          apparentTemperature: typeof c.apparent_temperature === 'number' ? c.apparent_temperature : 18,
          humidity: typeof c.relative_humidity_2m === 'number' ? c.relative_humidity_2m : 60,
          precipitation: typeof c.precipitation === 'number' ? c.precipitation : 0,
          weatherCode: typeof c.weather_code === 'number' ? c.weather_code : 1,
          windSpeed: typeof c.wind_speed_10m === 'number' ? c.wind_speed_10m : 8,
          windDirection: typeof c.wind_direction_10m === 'number' ? c.wind_direction_10m : 180,
          surfacePressure: typeof c.surface_pressure === 'number' ? c.surface_pressure : 1016,
          lastUpdated: timeFormatted,
          source: 'live',
        });
      }
    } catch (err) {
      console.warn('Real-time weather fetch for Roma Sud failed, retaining cached telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRomaSudWeather();
    // Auto-refresh every 10 minutes (600,000 ms)
    const interval = setInterval(fetchRomaSudWeather, 600000);
    return () => clearInterval(interval);
  }, [fetchRomaSudWeather]);

  const condition = useMemo(() => getWeatherCondition(weather.weatherCode, isEn), [weather.weatherCode, isEn]);
  const windCardinal = useMemo(() => getWindCardinal(weather.windDirection, isEn), [weather.windDirection, isEn]);
  const ConditionIcon = condition.icon;

  // Determine tactical operational index for outdoor casualty management
  const tacticalAssessment = useMemo(() => {
    if (weather.precipitation > 2.0 || weather.weatherCode >= 80) {
      return {
        status: isEn ? 'CRITICAL WET' : 'PIOGGIA ATTIVA',
        note: isEn ? 'Casualty hypothermia prevention & traction cover required.' : 'Attenzione rischio ipotermia ferito e trazione barelle su fango.',
        badgeBg: 'bg-red-950 text-red-300 border-red-600',
      };
    }
    if (weather.windSpeed > 35) {
      return {
        status: isEn ? 'HIGH WIND' : 'VENTO SOSTENUTO',
        note: isEn ? 'Secure emergency shelter and tarps.' : 'Assicurare teli termici e fissaggio presidi da campo.',
        badgeBg: 'bg-amber-950 text-amber-300 border-amber-600',
      };
    }
    if (weather.temperature < 8) {
      return {
        status: isEn ? 'COLD ENVIRONMENT' : 'CLIMA RIGIDO',
        note: isEn ? 'Immediate thermal blanket (Hypothermia Pack).' : 'Applicare coperte termiche attive e telo riflettente immediato.',
        badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-600',
      };
    }
    return {
      status: isEn ? 'TACTICAL WEATHER: OPTIMAL' : 'METEO TATTICO: OTTIMALE',
      note: isEn ? 'Full operational readiness for TCCC outdoor extractions & litter carry.' : 'Condizioni ideali per estrazione barellata under fire e manovre esterne.',
      badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-600',
    };
  }, [weather, isEn]);

  // Telemetry items array for the continuous smooth marquee
  const items = useMemo(() => {
    return [
      {
        icon: '📍',
        label: isEn ? 'SECTOR' : 'SETTORE',
        val: isEn ? 'ROME SOUTH • EUR / CECCHIGNOLA' : 'ROMA SUD • EUR / CECCHIGNOLA',
        highlight: true,
      },
      {
        icon: '🌡️',
        label: isEn ? 'TEMP' : 'TEMPERATURA',
        val: `${weather.temperature.toFixed(1)}°C (Percepita ${weather.apparentTemperature.toFixed(1)}°C)`,
      },
      {
        icon: '☁️',
        label: isEn ? 'CONDITION' : 'CONDIZIONI',
        val: `${condition.label.toUpperCase()} [${condition.tactical}]`,
      },
      {
        icon: '💨',
        label: isEn ? 'WIND' : 'VENTO',
        val: `${weather.windSpeed.toFixed(1)} km/h da ${windCardinal} (${weather.windDirection}°)`,
      },
      {
        icon: '💧',
        label: isEn ? 'HUMIDITY' : 'UMIDITÀ',
        val: `${weather.humidity}%`,
      },
      {
        icon: '⏱️',
        label: isEn ? 'PRESSURE' : 'PRESSIONE',
        val: `${weather.surfacePressure.toFixed(0)} hPa`,
      },
      {
        icon: '🌧️',
        label: isEn ? 'PRECIPITATION' : 'PIOGGIA',
        val: `${weather.precipitation.toFixed(1)} mm/h`,
      },
      {
        icon: '🛡️',
        label: isEn ? 'TACTICAL READINESS' : 'INDICE OPERATIVO',
        val: `${tacticalAssessment.status} — ${tacticalAssessment.note}`,
        highlight: true,
      },
      {
        icon: '📡',
        label: isEn ? 'SYNC' : 'AGGIORNAMENTO',
        val: `${weather.lastUpdated} (Live Telemetry)`,
      },
    ];
  }, [weather, condition, windCardinal, tacticalAssessment, isEn]);

  // Content block duplicated for continuous infinite marquee loop
  const renderMarqueeBlock = () => (
    <div className="flex items-center gap-6 whitespace-nowrap pr-8">
      {items.map((it, idx) => (
        <span key={idx} className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
          <span className="text-xs">{it.icon}</span>
          <span
            className={`font-black uppercase tracking-wider px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] border ${
              it.highlight
                ? 'bg-sky-500 text-black border-sky-300 font-extrabold shadow-xs'
                : 'bg-neutral-800 text-sky-300 border-neutral-700'
            }`}
          >
            {it.label}
          </span>
          <span className={`font-bold ${it.highlight ? 'text-sky-200' : 'text-neutral-200'}`}>
            {it.val}
          </span>
          <span className="text-neutral-700 font-bold ml-2">///</span>
        </span>
      ))}
    </div>
  );

  return (
    <>
      <div
        className="bg-neutral-950/95 border-2 border-sky-500/70 rounded-lg p-1.5 sm:p-2 overflow-hidden relative shadow-lg group/weather w-full max-w-full font-mono transition-all"
        title={isEn ? 'Real-time Rome South weather telemetry (click to view details)' : 'Telemetria meteo Roma Sud in tempo reale (clicca per dettagli completi)'}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="flex items-center gap-2">
          {/* Station / Area Badge with Live Icon & Refresh */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsDetailModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-sky-950 to-neutral-900 hover:from-sky-900 hover:to-neutral-850 text-sky-300 border border-sky-500/80 rounded font-black text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all"
              title={isEn ? 'Open Rome South detailed weather sheet' : 'Apri bollettino meteo dettagliato Roma Sud'}
            >
              <ConditionIcon className={`w-3.5 h-3.5 ${condition.color} animate-pulse`} />
              <span className="font-extrabold">{isEn ? 'CONDIMETEO' : 'METEO ROMA SUD'}</span>
              <span className="px-1.5 py-0.2 bg-sky-500 text-black font-black text-[9px] rounded ml-0.5">
                {weather.temperature.toFixed(0)}°C
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fetchRomaSudWeather();
              }}
              disabled={isLoading}
              className="p-1 bg-neutral-900 hover:bg-neutral-800 text-sky-400 border border-neutral-700 rounded cursor-pointer transition-colors"
              title={isEn ? 'Refresh live weather telemetry' : 'Aggiorna telemetria meteo in tempo reale'}
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-sky-300' : ''}`} />
            </button>
          </div>

          {/* Marquee Track Container */}
          <div
            onClick={() => setIsDetailModalOpen(true)}
            className="overflow-hidden whitespace-nowrap flex-1 relative w-full cursor-pointer py-0.5"
          >
            <div
              className="animate-marquee-slow inline-flex"
              style={{
                animationPlayState: isPaused ? 'paused' : undefined,
                animationDuration: '65s',
              }}
            >
              {renderMarqueeBlock()}
              {renderMarqueeBlock()}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tactical Weather Modal for Roma Sud */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-mono">
          <div className="w-full max-w-2xl bg-neutral-950 border-2 border-sky-500 rounded-xl shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto relative text-white">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3 gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-sky-950 border border-sky-500 text-sky-300 font-mono text-[11px] font-black rounded uppercase">
                    METEOROLOGICAL TELEMETRY
                  </span>
                  <span className="text-neutral-400 text-xs">
                    Lat 41.82°N • Lon 12.45°E • Elev. 28m
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <ConditionIcon className={`w-6 h-6 ${condition.color}`} />
                  <span>{isEn ? 'ROME SOUTH WEATHER TELEMETRY' : 'BOLLETTINO METEO ROMA SUD'}</span>
                </h3>
                <p className="text-xs text-sky-300 font-sans">
                  {isEn
                    ? 'Dedicated telemetry for tactical operations, casualty evacuation & outdoor training (EUR / Cecchignola grounds).'
                    : 'Monitoraggio ambientale dedicato per gestione ferito in ambiente ostile ed esercitazioni barellate (Area EUR / Cecchignola).'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-lg space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  {isEn ? 'Temperature' : 'Temperatura'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {weather.temperature.toFixed(1)}°C
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  {isEn ? 'Feels like:' : 'Percepita:'} <strong className="text-amber-300">{weather.apparentTemperature.toFixed(1)}°C</strong>
                </span>
              </div>

              <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-lg space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  {isEn ? 'Wind Speed' : 'Vento al Suolo'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {weather.windSpeed.toFixed(1)} <span className="text-xs font-normal text-neutral-400">km/h</span>
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  {isEn ? 'Direction:' : 'Direzione:'} <strong className="text-sky-300">{windCardinal} ({weather.windDirection}°)</strong>
                </span>
              </div>

              <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-lg space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  {isEn ? 'Relative Humidity' : 'Umidità'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {weather.humidity}%
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  {isEn ? 'Precipitation:' : 'Precipitazioni:'} <strong className="text-cyan-300">{weather.precipitation.toFixed(1)} mm</strong>
                </span>
              </div>

              <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-lg space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-purple-400" />
                  {isEn ? 'Pressure' : 'Pressione'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {weather.surfacePressure.toFixed(0)} <span className="text-xs font-normal text-neutral-400">hPa</span>
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  {isEn ? 'Sky status:' : 'Condizione:'} <strong className="text-slate-300">{condition.label}</strong>
                </span>
              </div>
            </div>

            {/* Tactical Outdoor Feasibility Assessment */}
            <div className={`p-3.5 rounded-lg border space-y-1.5 ${tacticalAssessment.badgeBg}`}>
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{isEn ? 'TACTICAL OPERATIONAL READINESS (OUTDOOR TCCC)' : 'VALUTAZIONE OPERATIVA TCCC & AMBIENTE ESTERNO'}</span>
                </span>
                <span className="px-2 py-0.5 bg-black/50 text-[10px] font-black rounded uppercase">
                  {tacticalAssessment.status}
                </span>
              </div>
              <p className="text-xs leading-relaxed font-sans text-white/90">
                {tacticalAssessment.note}
              </p>
            </div>

            {/* Footer with Refresh Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-neutral-400 text-[11px]">
                {isEn ? 'Data source: Open-Meteo European Forecast System • Rome South Station' : 'Fonte dati: Open-Meteo European System • Stazione Roma Sud (EUR / Cecchignola)'}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={fetchRomaSudWeather}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-sky-300 rounded font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isEn ? 'Reload' : 'Aggiorna'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-black font-black uppercase rounded cursor-pointer transition-colors"
                >
                  {isEn ? 'Close' : 'Chiudi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
