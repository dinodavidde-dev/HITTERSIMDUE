import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Globe, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error in Trauma Sim:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoToPublic = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = `${window.location.origin}${window.location.pathname}?view=public`;
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] w-full flex items-center justify-center p-4">
          <div className="bg-neutral-950 border-2 border-red-500 rounded-xl p-6 sm:p-8 max-w-xl w-full text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center mx-auto text-red-500 animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-0.5 bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono font-black uppercase tracking-widest rounded">
                PROTOCOLLO RECUPERO SCHERMATA
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {this.props.fallbackTitle || 'Visuale Temporaneamente Non Disponibile'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 font-mono leading-relaxed">
                Si è verificato un disallineamento temporaneo nel caricamento della schermata. Nessun dato è andato perduto.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded text-left font-mono text-[10px] text-red-300/80 max-h-24 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto min-h-[42px] px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ricarica Schermata</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoToPublic}
                className="w-full sm:w-auto min-h-[42px] px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span>Torna a Visuale Pubblica</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
