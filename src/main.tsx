import {StrictMode, Component, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  declare props: {children: ReactNode};
  state = { hasError: false, error: null as Error | null };

  constructor(props: {children: ReactNode}) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif' }}>
          <h2>Đã xảy ra lỗi (Application Error)</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fdd', padding: '10px', borderRadius: '5px' }}>
            {this.state.error?.toString()}
          </pre>
          <p>Vui lòng kiểm tra Console (F12) để xem chi tiết.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
