import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Shield, RotateCcw, AlertCircle } from 'lucide-react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SIGPAT ErrorBoundary capturou erro:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl shadow-xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#002B49] uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-[#C4A052]" />
                <span>SIGPAT Transportes • TJPR</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Instabilidade Temporária no Módulo
              </h2>
              <p className="text-xs text-slate-500">
                O sistema recuperou a estabilidade da sessão oficial. Você pode recarregar a visualização sem perder os dados.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-[#002B49] hover:bg-[#003C66] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recarregar SIGPAT Transportes</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
