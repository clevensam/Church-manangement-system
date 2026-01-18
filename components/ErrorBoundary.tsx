import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Hitilafu Imetokea</h1>
            <p className="text-slate-500 mb-6 text-sm">
              Samahani, kuna tatizo limejitokeza kwenye mfumo. Tafadhali jaribu kupakia upya ukurasa.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg mb-6 text-left overflow-auto max-h-32 custom-scrollbar">
                <code className="text-xs text-slate-600 font-mono break-all">
                    {this.state.error?.message || 'Unknown Error'}
                </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Pakia Upya
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;