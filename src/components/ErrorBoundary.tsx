import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex items-center justify-center bg-void">
            <div className="text-center">
              <h1 className="font-display text-3xl text-gold mb-3">
                Algo deu errado
              </h1>
              <p className="text-sm text-text-muted mb-4">
                Ocorreu um erro inesperado.
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="text-xs font-mono text-gold tracking-wider uppercase hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
