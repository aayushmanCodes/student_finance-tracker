import React from 'react';
import { TriangleAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // This catches the error BEFORE it crashes the app
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // This grabs the stack trace so we can see exactly where it broke
  componentDidCatch(error, errorInfo) {
    console.error("System Caught an Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Our custom Crash Screen (styled to match your Gen Z theme)
      return (
        <div className="min-h-screen bg-appBg text-textMain flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-2xl w-full border border-alert/30">
            <div className="flex items-center gap-3 text-alert mb-4">
              <TriangleAlert size={32} />
              <h1 className="text-2xl font-bold font-mono uppercase">System Crash Intercepted</h1>
            </div>
            <p className="mb-4 text-textMuted">The application encountered a fatal error rendering the UI.</p>
            
            {/* The actual error readout */}
            <div className="bg-surface p-4 rounded-xl overflow-x-auto font-mono text-sm border border-black/10 dark:border-white/10">
              <p className="text-alert font-bold">{this.state.error && this.state.error.toString()}</p>
              <pre className="mt-4 text-textMuted opacity-80 whitespace-pre-wrap text-xs">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 w-full transition-opacity"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;