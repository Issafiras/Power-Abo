/**
 * ErrorBoundary - Catch React errors gracefully
 * Tim Cook Rebuild: Implementer robust error handling
 */

import React from 'react';
import Icon from './Icon';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log to error reporting service in production
    // TODO: Integrate with error reporting service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Optionally reload the page
    if (this.props.resetOnError) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <Icon name="alertCircle" size={64} className="error-boundary-icon" />
            <h1 className="error-boundary-title">Noget gik galt</h1>
            <p className="error-boundary-message">
              Vi beklager, men der opstod en uventet fejl. Prøv at opdatere siden eller kontakt support hvis problemet fortsætter.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary-details">
                <summary>Tekniske detaljer (kun i udvikling)</summary>
                <pre className="error-boundary-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-boundary-actions">
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
              >
                Prøv igen
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary"
              >
                Opdater side
              </button>
            </div>
          </div>

          <style>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: var(--spacing-xl);
              background: var(--bg-primary);
            }

            .error-boundary-content {
              max-width: 600px;
              text-align: center;
              padding: var(--spacing-2xl);
              background: var(--glass-bg);
              border-radius: var(--radius-xl);
              border: 1px solid var(--glass-border);
              box-shadow: var(--shadow-xl);
            }

            .error-boundary-icon {
              color: var(--color-danger);
              margin-bottom: var(--spacing-lg);
            }

            .error-boundary-title {
              font-size: var(--font-3xl);
              font-weight: var(--font-bold);
              margin-bottom: var(--spacing-md);
              color: var(--text-primary);
            }

            .error-boundary-message {
              font-size: var(--font-lg);
              color: var(--text-secondary);
              margin-bottom: var(--spacing-xl);
              line-height: var(--leading-relaxed);
            }

            .error-boundary-details {
              margin: var(--spacing-lg) 0;
              text-align: left;
              background: rgba(0, 0, 0, 0.3);
              border-radius: var(--radius-md);
              padding: var(--spacing-md);
            }

            .error-boundary-details summary {
              cursor: pointer;
              font-weight: var(--font-semibold);
              margin-bottom: var(--spacing-sm);
              color: var(--text-secondary);
            }

            .error-boundary-stack {
              font-family: var(--font-family-mono);
              font-size: var(--font-sm);
              color: var(--color-danger);
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-all;
            }

            .error-boundary-actions {
              display: flex;
              gap: var(--spacing-md);
              justify-content: center;
              margin-top: var(--spacing-xl);
            }

            @media (max-width: 900px) {
              .error-boundary-content {
                padding: var(--spacing-lg);
              }

              .error-boundary-actions {
                flex-direction: column;
              }

              .error-boundary-actions .btn {
                width: 100%;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
