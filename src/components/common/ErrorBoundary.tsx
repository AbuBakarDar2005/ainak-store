import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Checklist #20: Error Monitoring] Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-luxury-950 flex items-center justify-center p-6 text-white text-center">
          <div className="max-w-lg w-full bg-luxury-900 border border-white/10 p-8 rounded-2xl shadow-2xl text-left">
            <div className="w-12 h-12 rounded-full bg-red-950 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2 text-center">Something unexpected occurred</h2>
            <p className="text-xs text-luxury-400 mb-4 leading-relaxed text-center">
              We encountered a client-side glitch. Our optical interface is safeguarded by automatic error recovery.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-black/60 border border-red-500/30 text-xs font-mono text-red-300 overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                <div className="font-bold text-red-400 mb-1">{this.state.error.name}: {this.state.error.message}</div>
                {this.state.error.stack && (
                  <div className="text-[10px] text-luxury-400 mt-2 font-mono">
                    {this.state.error.stack}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-white text-luxury-950 hover:bg-zinc-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reload Experience
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (e) {}
                  window.location.href = '/';
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-all"
              >
                Clear Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
