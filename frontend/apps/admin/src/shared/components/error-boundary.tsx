import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
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
    console.error("Uncaught error in admin app:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "30px",
          margin: "20px",
          border: "2px solid #ef4444",
          borderRadius: "12px",
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          fontFamily: "system-ui, sans-serif",
          lineHeight: "1.5"
        }}>
          <h2 style={{ marginTop: 0, fontSize: "20px", fontWeight: "bold" }}>
            ❌ Error de Renderizado en el ERP
          </h2>
          <p style={{ fontSize: "14px", color: "#7f1d1d" }}>
            La aplicación ha fallado al renderizar. A continuación se detalla el error:
          </p>
          <pre style={{
            padding: "15px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            overflowX: "auto",
            fontSize: "12px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap"
          }}>
            {this.state.error?.toString()}
          </pre>
          <p style={{ fontSize: "12px", color: "#991b1b", fontWeight: "semibold", marginTop: "15px" }}>
            Pila de llamadas (Stack Trace):
          </p>
          <pre style={{
            padding: "15px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            overflowX: "auto",
            fontSize: "11px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            maxHeight: "300px"
          }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            Limpiar sesión y Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
