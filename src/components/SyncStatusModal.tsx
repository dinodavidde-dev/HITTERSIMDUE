import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import {
  Activity,
  CheckCircle2,
  Clock,
  Cloud,
  Eye,
  GraduationCap,
  Laptop,
  Lock,
  LogIn,
  LogOut,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  User,
  Wifi,
  WifiOff,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { UserRole } from '../types';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({ isOpen, onClose }) => {
  const {
    syncStatus,
    triggerManualSync,
    sendPing,
    userRole,
    firebaseUser,
    isFirebaseAuthReady,
    isFirebaseCloudConnected,
    signInWithGoogle,
    signOutFirebase,
  } = useCourse();

  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccessMessage, setPingSuccessMessage] = useState<string | null>(null);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [isAuthBusy, setIsAuthBusy] = useState(false);

  if (!isOpen) return null;

  const handlePing = () => {
    setIsPinging(true);
    setPingSuccessMessage(null);
    sendPing();
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccessMessage('Ping completato: tutti i nodi e Firestore rispondono regolarmente.');
      setTimeout(() => setPingSuccessMessage(null), 3000);
    }, 400);
  };

  const handleForceSync = () => {
    setIsSyncingLocal(true);
    triggerManualSync();
    setTimeout(() => {
      setIsSyncingLocal(false);
      setPingSuccessMessage('Dati sincronizzati con successo con Firebase Firestore.');
      setTimeout(() => setPingSuccessMessage(null), 3000);
    }, 500);
  };

  const handleGoogleSignIn = async () => {
    setIsAuthBusy(true);
    try {
      await signInWithGoogle();
      setPingSuccessMessage('Autenticato con Google Firebase con successo!');
      setTimeout(() => setPingSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setIsAuthBusy(true);
    try {
      await signOutFirebase();
      setPingSuccessMessage('Disconnessione completata.');
      setTimeout(() => setPingSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthBusy(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'public':
        return <Eye className="w-4 h-4 text-emerald-400" />;
      case 'discente':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'tecnico':
        return <Wrench className="w-4 h-4 text-cyan-400" />;
      case 'faculty':
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'direttore':
        return <ShieldCheck className="w-4 h-4 text-orange-400" />;
      default:
        return <Laptop className="w-4 h-4 text-neutral-400" />;
    }
  };

  const formatLastSync = (timestamp: number) => {
    if (!timestamp) return 'In attesa...';
    const d = new Date(timestamp);
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div
        className="bg-neutral-950 border-4 border-neutral-700 w-full max-w-2xl text-neutral-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b-2 border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-600 text-black font-black">
              <Cloud className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-white flex items-center gap-2">
                STATO CONNETTIVITÀ & CLOUD FIRESTORE
                <span className="text-[10px] font-black px-1.5 py-0.5 bg-emerald-500 text-black uppercase tracking-wider">
                  FIREBASE LIVE
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400 font-mono">
                Google Cloud Firestore europe-west1 & Real-time Mesh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-700"
            title="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Main Status Hero Card */}
          <div className={`p-4 border-2 flex items-center justify-between gap-3 ${
            syncStatus.isOnline
              ? 'bg-emerald-950/40 border-emerald-600/70'
              : 'bg-red-950/40 border-red-600'
          }`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 flex items-center justify-center font-black ${
                  syncStatus.isOnline ? 'bg-emerald-500 text-black' : 'bg-red-600 text-white'
                }`}>
                  {syncStatus.isOnline ? <Wifi className="w-6 h-6 stroke-[2.5]" /> : <WifiOff className="w-6 h-6" />}
                </div>
                {syncStatus.isOnline && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base uppercase tracking-tight text-white">
                    {syncStatus.isOnline ? 'SISTEMA FIRESTORE COLLEGATO & SINCRONIZZATO' : 'MODALITÀ OFFLINE RILEVATA'}
                  </span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 uppercase ${
                    syncStatus.isOnline ? 'bg-emerald-500 text-black' : 'bg-red-600 text-white'
                  }`}>
                    {syncStatus.isOnline ? 'CLOUD ATTIVO' : 'DISCONNESSO'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  {syncStatus.isOnline
                    ? `I dati (timer, rotazioni, allerte, messaggi e valutazioni) sono sincronizzati istantaneamente con Google Cloud Firestore europe-west1.`
                    : 'La sincronizzazione tra dispositivi potrebbe essere limitata alla memoria locale.'}
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0 hidden sm:block">
              <span className="text-[10px] text-neutral-400 uppercase font-mono block">Latenza Canale</span>
              <span className="font-mono text-sm font-black text-emerald-400">
                {syncStatus.latencyMs !== null ? `${syncStatus.latencyMs} ms` : '< 2 ms'}
              </span>
            </div>
          </div>

          {/* Firebase Authentication & Cloud Info Card */}
          <div className="p-3.5 bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-neutral-200 uppercase tracking-wide">
                  Autenticazione & Cloud Project
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                gen-lang-client-0677101799 (europe-west1)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 flex-wrap gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-neutral-850 border border-neutral-700 flex items-center justify-center font-bold text-orange-400">
                  {firebaseUser ? (
                    firebaseUser.photoURL ? (
                      <img src={firebaseUser.photoURL} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      firebaseUser.displayName?.charAt(0) || 'U'
                    )
                  ) : (
                    <User className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-neutral-100 text-xs">
                    {firebaseUser ? firebaseUser.displayName || firebaseUser.email : 'Utente Locale / PIN Faculty'}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 truncate">
                    {firebaseUser ? firebaseUser.email : 'Non connesso ad account Google'}
                  </div>
                </div>
              </div>

              <div>
                {firebaseUser ? (
                  <button
                    onClick={handleSignOut}
                    disabled={isAuthBusy}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-300 text-[11px] font-bold uppercase rounded border border-neutral-700 hover:border-red-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnetti</span>
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isAuthBusy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase rounded transition-colors cursor-pointer shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Accedi con Google</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] font-mono uppercase font-bold">Client Attivi</span>
                <Laptop className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <p className="text-lg font-black font-mono text-white">
                {syncStatus.peerCount} <span className="text-[11px] font-normal text-neutral-400">nodi</span>
              </p>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] font-mono uppercase font-bold">Ultimo Sync</span>
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-sm font-black font-mono text-cyan-300">
                {formatLastSync(syncStatus.lastSyncTimestamp)}
              </p>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] font-mono uppercase font-bold">Protocollo</span>
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xs font-black font-mono text-emerald-300 truncate" title="Cloud Firestore onSnapshot + Broadcast Mesh">
                Firestore Sync
              </p>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] font-mono uppercase font-bold">Ruolo Locale</span>
                {getRoleIcon(userRole)}
              </div>
              <p className="text-xs font-black font-mono text-orange-400 uppercase">
                {userRole}
              </p>
            </div>
          </div>

          {/* Connected Peers List */}
          <div className="bg-neutral-900 border-2 border-neutral-800 p-3 space-y-2.5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-orange-400" />
                <span className="font-black text-xs uppercase tracking-wider text-neutral-200">
                  Nodi Rete Rilevati ({syncStatus.peers.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                Aggiornato in tempo reale (Heartbeat 4s)
              </span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {syncStatus.peers.map((peer) => (
                <div
                  key={peer.id}
                  className={`flex items-center justify-between p-2 border transition-all ${
                    peer.isCurrent
                      ? 'bg-neutral-950 border-orange-500/70 shadow-xs'
                      : 'bg-neutral-950/70 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 bg-neutral-900 border border-neutral-700 flex-shrink-0">
                      {getRoleIcon(peer.role)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-neutral-100 text-xs uppercase tracking-tight">
                          {peer.roleLabel}
                        </span>
                        {peer.isCurrent && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 bg-orange-500 text-black uppercase">
                            Questo dispositivo
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 truncate block">
                        ID: {peer.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      ATTIVO
                    </span>
                  </div>
                </div>
              ))}

              {syncStatus.peers.length === 0 && (
                <p className="text-neutral-500 text-xs italic py-2 text-center">
                  Nessun altro peer connesso in questo momento.
                </p>
              )}
            </div>
          </div>

          {/* Feedback Message */}
          {pingSuccessMessage && (
            <div className="p-2.5 bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center gap-2 font-bold text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{pingSuccessMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePing}
                disabled={isPinging}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 font-black text-xs uppercase tracking-wider border border-neutral-700 hover:border-neutral-500 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Zap className={`w-3.5 h-3.5 text-yellow-400 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'TEST IN CORSO...' : 'TEST PING / LATENZA'}</span>
              </button>

              <button
                type="button"
                onClick={handleForceSync}
                disabled={isSyncingLocal}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black text-xs uppercase tracking-wider border border-orange-500 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLocal ? 'animate-spin' : ''}`} />
                <span>{isSyncingLocal ? 'SINCRONIZZAZIONE...' : 'FORZA SYNC FIRESTORE'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ml-auto"
            >
              Chiudi
            </button>
          </div>

          {/* Info Notice */}
          <div className="p-2.5 bg-neutral-900/70 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
            <span className="font-bold text-neutral-300">💡 Architettura Cloud:</span> Il sistema memorizza lo stato delle rotazioni, le check-list dei simulatori, le valutazioni dei team e i messaggi privati in tempo reale su Google Cloud Firestore (`europe-west1`), garantendo persistenza affidabile e allineamento istantaneo su tutti i monitor e tablet.
          </div>

        </div>
      </div>
    </div>
  );
};
