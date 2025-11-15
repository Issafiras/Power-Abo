/**
 * ErrorBoundary komponent
 * Fanger React fejl og viser en fallback UI i stedet for at crashe hele appen
 */

import React from 'react';
import Icon from './Icon';
import COPY from '../../constants/copy';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Opdater state så næste render viser fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log fejlen kun i development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    // TODO: I production, send til error reporting service (fx Sentry)
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <Icon name="warning" size={64} />
            </div>
            <h1 className="error-boundary-title">Ups, noget gik galt</h1>
            <p className="error-boundary-message">
              Der opstod en uventet fejl. Lad os finde en løsning sammen.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary-details">
                <summary className="error-boundary-summary">Tekniske detaljer (kun i development)</summary>
                <pre className="error-boundary-pre">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="error-boundary-actions">
              <button
                onClick={this.handleReset}
                className="btn btn-premium"
                aria-label="Prøv igen"
              >
                <Icon name="refresh" size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Prøv igen
              </button>
              <button
                onClick={this.handleReload}
                className="btn btn-glass"
                aria-label="Genindlæs side"
              >
                <Icon name="refresh" size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Genindlæs side
              </button>
            </div>

            <div className="error-boundary-help">
              <p className="error-boundary-help-text">
                Hvis problemet fortsætter, kan du kontakte support.
              </p>
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
              width: 100%;
              padding: var(--spacing-3xl);
              background: var(--glass-bg);
              border: 2px solid var(--glass-border-strong);
              border-radius: var(--radius-xl);
              text-align: center;
              box-shadow: var(--shadow-2xl);
              backdrop-filter: blur(var(--blur-xl)) saturate(180%);
            }

            .error-boundary-icon {
              margin-bottom: var(--spacing-xl);
              color: var(--color-danger);
            }

            .error-boundary-title {
              font-size: var(--font-3xl);
              font-weight: var(--font-extrabold);
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
              margin: var(--spacing-xl) 0;
              padding: var(--spacing-md);
              background: rgba(0, 0, 0, 0.3);
              border-radius: var(--radius-md);
              text-align: left;
            }

            .error-boundary-summary {
              cursor: pointer;
              font-weight: var(--font-semibold);
              color: var(--text-primary);
              margin-bottom: var(--spacing-sm);
            }

            .error-boundary-pre {
              font-size: var(--font-sm);
              color: var(--text-muted);
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
              margin: 0;
              padding: var(--spacing-md);
              background: rgba(0, 0, 0, 0.2);
              border-radius: var(--radius-sm);
            }

            .error-boundary-actions {
              display: flex;
              gap: var(--spacing-md);
              justify-content: center;
              margin-bottom: var(--spacing-xl);
            }

            .error-boundary-help {
              padding-top: var(--spacing-xl);
              border-top: 1px solid var(--glass-border);
            }

            .error-boundary-help-text {
              font-size: var(--font-sm);
              color: var(--text-muted);
              margin: 0;
            }

            @media (max-width: 900px) {
              .error-boundary-content {
                padding: var(--spacing-xl);
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

