import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  X,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Crosshair,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCw,
} from 'lucide-react';

export type MapDisplayMode = 'satellite' | 'vector';

export interface ResponsiveTacticalMapProps {
  onClose?: () => void;
  initialMode?: MapDisplayMode;
  showHeader?: boolean;
  className?: string;
}

export const ResponsiveTacticalMap: React.FC<ResponsiveTacticalMapProps> = ({
  onClose,
  initialMode = 'satellite',
  showHeader = true,
  className = '',
}) => {
  const { language, activeDay, activeSlotIndex, currentSlot } = useCourse();

  // Mode: 'satellite' | 'vector'
  const [displayMode, setDisplayMode] = useState<MapDisplayMode>(initialMode);
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);
  const [showRotateHint, setShowRotateHint] = useState<boolean>(true);

  // Zoom and Pan states
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Drag and touch tracking refs
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss orientation hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRotateHint(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Reset zoom & pan when requested
  const handleResetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.6, Number((prev + delta).toFixed(2))), 3.5));
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers with Pinch-to-Zoom & Double-Tap (Optimized for Smartphone Screens)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showRotateHint) setShowRotateHint(false);

    if (e.touches.length === 1) {
      // 1 Finger: Pan & Double-tap check
      const now = Date.now();
      if (now - lastTapRef.current < 320) {
        setZoomLevel((prev) => (prev > 1.2 ? 1 : 2.0));
      }
      lastTapRef.current = now;

      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      };
      initialPinchDistRef.current = null;
    } else if (e.touches.length === 2) {
      // 2 Fingers: Pinch-to-zoom
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialZoomRef.current = zoomLevel;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPanOffset({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && initialPinchDistRef.current) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = currentDist / initialPinchDistRef.current;
      const newZoom = Math.min(Math.max(0.6, initialZoomRef.current * scaleFactor), 3.5);
      setZoomLevel(Number(newZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      initialPinchDistRef.current = null;
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      };
      initialPinchDistRef.current = null;
    }
  };

  const satelliteSrc = '/assets/aistudio/TACTICAL_MAP_PUB_458ca646.jpg';
  const vectorSrc = '/assets/aistudio/TACTICAL_MAP_PUB_VEC_6e4715ef.jpg';

  return (
    <div
      className={`flex flex-col h-full w-full select-none overflow-hidden bg-neutral-950 text-neutral-100 font-sans ${className}`}
      style={{ touchAction: 'none' }}
      onMouseUp={handleMouseUp}
    >
      {/* ============================================================== */}
      {/* 1. TOP HEADER: FLEXBOX LAYOUT (ADAPTIVE TO PHONE & DESKTOP)    */}
      {/* ============================================================== */}
      {showHeader && (
        <header className="flex-shrink-0 bg-neutral-950/95 border-b border-neutral-800 px-2.5 sm:px-4 py-2 sm:py-2.5 shadow-md relative z-30">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 max-w-7xl mx-auto">
            {/* Title & NATO Badge */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 sm:p-1.5 bg-emerald-500/10 border border-emerald-500/40 rounded flex items-center justify-center flex-shrink-0">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[8px] sm:text-[9px] font-black uppercase tracking-wider rounded flex-shrink-0">
                    TACTICAL MAP
                  </span>
                  <span className="font-mono text-[9px] text-emerald-400 font-bold hidden md:inline truncate">
                    NATO MIL-MED: RM-CECCHIGNOLA
                  </span>
                </div>
                <h2 className="text-xs sm:text-sm font-black text-white tracking-wider uppercase font-mono truncate">
                  {language === 'en' ? 'COMPOUND MAP' : 'MAPPA COMPRENSORIO'}
                </h2>
              </div>
            </div>

            {/* Segmented Switch (Satellite vs Vettoriale) - Large touch target on phones */}
            <div className="flex items-center bg-neutral-900 p-0.5 sm:p-1 rounded-lg border border-neutral-700 shadow-inner flex-shrink-0">
              <button
                type="button"
                id="responsive-map-satellite-btn"
                onClick={() => setDisplayMode('satellite')}
                className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-mono font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation ${
                  displayMode === 'satellite'
                    ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-300'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={language === 'en' ? 'Desaturated Satellite aerial imagery' : 'Ripresa aerea satellitare'}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>SATELLITE</span>
              </button>

              <button
                type="button"
                id="responsive-map-vector-btn"
                onClick={() => setDisplayMode('vector')}
                className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-mono font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation ${
                  displayMode === 'vector'
                    ? 'bg-cyan-500 text-black shadow-md ring-1 ring-cyan-200'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={language === 'en' ? 'Tactical vector blueprint with routes & symbols' : 'Blueprint vettoriale e simbologia'}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>VETTORIALE</span>
              </button>
            </div>

            {/* Actions: Desktop Zoom Controls & Optional Close Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-md p-0.5">
                <button
                  type="button"
                  onClick={() => handleZoom(-0.2)}
                  className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  className="px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                  title="Reset Zoom & Position"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom(0.2)}
                  className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 rounded transition-colors cursor-pointer"
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[38px] min-w-[38px] sm:min-h-[34px] sm:min-w-[34px] p-2 bg-red-950/90 hover:bg-red-900 active:bg-red-800 text-red-200 hover:text-white border border-red-700/80 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 font-mono text-xs font-black shadow-md touch-manipulation"
                  title={language === 'en' ? 'Close Map' : 'Chiudi Mappa'}
                >
                  <X className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span className="hidden md:inline">ESC</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ============================================================== */}
      {/* 2. MAIN BODY: RESPONSIVE FLEX/GRID LAYOUT                      */}
      {/* On smartphones: Stacks the map viewport on top and the legend  */}
      {/* below vertically, saving horizontal space and fitting ratios.  */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {/* Map Viewport Area: Takes remaining vertical space */}
        <div
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 min-h-[42vh] sm:min-h-0 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{
            touchAction: 'none',
            backgroundColor: '#070709',
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.04) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 32px 32px, 32px 32px',
          }}
        >
          {/* Tactical HUD Corner Crosshairs */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-500" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-500" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-500" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-500" />
          </div>

          {/* SMARTPHONE ORIENTATION HINT */}
          {showRotateHint && (
            <div className="sm:hidden absolute top-2 inset-x-0 mx-auto w-max max-w-[92vw] px-3 py-1 bg-neutral-900/95 border border-amber-500/60 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 font-mono text-[10px] text-amber-300 z-30 animate-pulse pointer-events-none">
              <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin-slow flex-shrink-0" />
              <span>Pizzica per zoomare • Ruota per vista panoramica</span>
            </div>
          )}

          {/* TRANSFORM WRAPPER: Handles Pan & Pinch Zoom */}
          <div
            className="relative transition-transform duration-75 ease-out will-change-transform flex items-center justify-center max-w-full max-h-full p-2"
            style={{
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Map Frame configured with responsive aspect-ratio and fluid width */}
            <div
              className="relative rounded-lg shadow-2xl border border-neutral-700 bg-neutral-900 overflow-hidden"
              style={{
                width: 'min(96vw, 1080px)',
                aspectRatio: '16/10',
                maxHeight: '68vh',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 25px rgba(16, 185, 129, 0.15)',
              }}
            >
              {displayMode === 'satellite' ? (
                <img
                  src={satelliteSrc}
                  alt="Tactical Map Satellite Base"
                  className="w-full h-full object-contain select-none pointer-events-none filter contrast-105"
                  draggable={false}
                />
              ) : (
                <img
                  src={vectorSrc}
                  alt="Tactical Map Vector Symbols"
                  className="w-full h-full object-contain select-none pointer-events-none"
                  draggable={false}
                />
              )}

              {/* Viewport Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-neutral-950/85 border border-neutral-700 rounded font-mono text-[9px] text-neutral-300 backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    displayMode === 'satellite' ? 'bg-blue-400' : 'bg-cyan-400'
                  }`}
                />
                <span className="font-bold text-white uppercase text-[9px]">
                  {displayMode === 'satellite' ? 'SATELLITE' : 'VETTORIALE'}
                </span>
              </div>
            </div>
          </div>

          {/* FLOATING QUICK TOUCH CONTROLS ON SMARTPHONE VIEWPORT */}
          <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => handleZoom(0.3)}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-neutral-900/90 active:bg-neutral-800 text-white border border-neutral-700 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md cursor-pointer touch-manipulation transition-transform active:scale-95"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </button>

            <button
              type="button"
              onClick={() => handleZoom(-0.3)}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-neutral-900/90 active:bg-neutral-800 text-white border border-neutral-700 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md cursor-pointer touch-manipulation transition-transform active:scale-95"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </button>

            <button
              type="button"
              onClick={handleResetView}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-neutral-900/90 active:bg-neutral-800 text-white border border-neutral-700 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md cursor-pointer touch-manipulation font-mono text-[10px] font-black transition-transform active:scale-95"
              aria-label="Reset position and zoom"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. RESPONSIVE LEGEND STACKED BELOW THE MAP (SAVES HORIZONTAL)  */}
        {/* Uses CSS Grid specifically adapted for smartphone aspect ratios*/}
        {/* ============================================================== */}
        <section
          aria-label="Legenda Settori Operativi"
          className="flex-shrink-0 bg-neutral-950 border-t border-neutral-800 relative z-20 shadow-xl"
        >
          {/* Header toggle bar for the stacked legend */}
          <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between bg-neutral-900/80 border-b border-neutral-850">
            <button
              type="button"
              onClick={() => setIsLegendExpanded(!isLegendExpanded)}
              className="flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-300 hover:text-white uppercase transition-colors cursor-pointer touch-manipulation"
            >
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'OPERATIONAL LEGEND (6 SECTORS)' : 'LEGENDA OPERATIVA (6 SETTORI)'}</span>
              {isLegendExpanded ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />}
            </button>

            <div className="font-mono text-[10px] text-neutral-400 hidden sm:flex items-center gap-3">
              <span>
                {language === 'en' ? 'DAY' : 'GIORNO'} {activeDay} // SLOT {activeSlotIndex + 1}
              </span>
              {currentSlot && <span className="text-amber-400 font-bold truncate max-w-[200px]">{currentSlot.title}</span>}
            </div>
          </div>

          {/* Grid Layout: Stacks vertically below map, saving horizontal space on narrow phones */}
          {isLegendExpanded && (
            <div className="px-2 sm:px-4 py-2 sm:py-2.5 max-h-[30vh] sm:max-h-none overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 text-[10px] font-mono">
                {/* 1. Tracciato Verde */}
                <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-neutral-900/90 border border-neutral-800 rounded-md sm:rounded-lg">
                  <span className="w-3.5 sm:w-4 h-1.5 sm:h-2 bg-emerald-500 rounded-xs sm:rounded-sm flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <div className="truncate">
                    <span className="font-black text-white block text-[10px]">TRACCIATO VERDE</span>
                    <span className="text-neutral-400 text-[8.5px] sm:text-[9px]">Primary IP Route</span>
                  </div>
                </div>

                {/* 2. Tracciato Rosso */}
                <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-neutral-900/90 border border-neutral-800 rounded-md sm:rounded-lg">
                  <span className="w-3.5 sm:w-4 h-1.5 sm:h-2 bg-red-500 rounded-xs sm:rounded-sm flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <div className="truncate">
                    <span className="font-black text-white block text-[10px]">TRACCIATO ROSSO</span>
                    <span className="text-neutral-400 text-[8.5px] sm:text-[9px]">Alternative Evac Route</span>
                  </div>
                </div>

                {/* 3. Shock Room 1-3 */}
                <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-neutral-900/90 border border-neutral-800 rounded-md sm:rounded-lg">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-[10px] sm:text-[11px] flex-shrink-0 shadow-md">
                    +
                  </span>
                  <div className="truncate">
                    <span className="font-black text-white block text-[10px]">SHOCK ROOM (1-3)</span>
                    <span className="text-neutral-400 text-[8.5px] sm:text-[9px]">Ospedale da Campo</span>
                  </div>
                </div>

                {/* 4. Area TCCC 1-3 */}
                <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-neutral-900/90 border border-neutral-800 rounded-md sm:rounded-lg">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-amber-500 text-black rounded font-black text-[9px] sm:text-[10px] flex items-center justify-center flex-shrink-0 shadow-md">
                    T
                  </span>
                  <div className="truncate">
                    <span className="font-black text-white block text-[10px]">AREA TCCC (1-3)</span>
                    <span className="text-neutral-400 text-[8.5px] sm:text-[9px]">Ambiente Sotto Fuoco</span>
                  </div>
                </div>

                {/* 5. Helipad MEDEVAC */}
                <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-neutral-900/90 border border-neutral-800 rounded-md sm:rounded-lg">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-white rounded-full font-black text-[9px] sm:text-[10px] flex items-center justify-center flex-shrink-0 shadow-md">
                    H
                  </span>
                  <div className="truncate">
                    <span className="font-black text-white block text-[10px]">HELIPAD MEDEVAC</span>
                    <span className="text-neutral-400 text-[8.5px] sm:text-[9px]">Elisuperficie</span>
                  </div>
                </div>

                {/* 6. WS1 / WS2 / Tech */}
                <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-neutral-900/90 border border-neutral-800 rounded-md sm:rounded-lg">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-600 text-white rounded font-black text-[8px] sm:text-[9px] flex items-center justify-center flex-shrink-0 shadow-md">
                    WS
                  </span>
                  <div className="truncate">
                    <span className="font-black text-white block text-[10px]">WS1 / WS2 / TECH</span>
                    <span className="text-neutral-400 text-[8.5px] sm:text-[9px]">Vie Aeree, ECO & Tech</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
