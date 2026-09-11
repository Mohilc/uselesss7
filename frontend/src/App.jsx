import React from 'react';
import Dashboard from './pages/Dashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MoodOS UI Catch Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-rose-500/30 shadow-2xl">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-rose-400 mb-2">MoodOS Core Interrupted</h1>
            <p className="text-xs text-slate-400 mb-4">
              A runtime anomaly was caught. You can reload to restore system operations.
            </p>
            <div className="p-3 bg-black/40 rounded-xl font-mono text-[11px] text-rose-300/90 mb-4 overflow-x-auto text-left">
              {this.state.error?.message || 'Unknown Error'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
            >
              Restart MoodOS Interface
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

export default App;
