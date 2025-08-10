import { Component } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error ke console atau service monitoring
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="text-red-400 text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Terjadi Kesalahan
            </h1>
            <p className="text-dark-300 mb-6">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang mengatasinya.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="btn-secondary w-full flex items-center justify-center space-x-2"
              >
                <FiHome className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-dark-400 cursor-pointer hover:text-white">
                  Detail Error (Development)
                </summary>
                <div className="mt-2 p-3 bg-dark-800 rounded-lg text-xs text-red-300 overflow-auto">
                  <pre>{this.state.error.toString()}</pre>
                  <pre className="mt-2">{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
