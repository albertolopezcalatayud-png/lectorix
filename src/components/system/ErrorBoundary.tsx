import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logError } from '@/services/errorLog';
import { useI18n } from '@/i18n';

/**
 * If a screen fails while drawing, show a friendly way out instead of a blank (or black) screen.
 * The error is saved on the device for the error report in Settings.
 */
function Fallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-bg text-fg">
      <div className="text-6xl mb-4">🧩</div>
      <h1 className="font-heading font-black text-xl mb-2">{t('err_title')}</h1>
      <p className="text-sm text-fg-muted mb-6 max-w-xs">{t('err_desc')}</p>
      <button onClick={onRetry} className="w-full max-w-xs py-3 rounded-2xl bg-accent text-white font-bold mb-3">{t('err_retry')}</button>
      <button onClick={() => { window.location.hash = '#/'; onRetry(); }} className="w-full max-w-xs py-3 rounded-2xl bg-accent-pale text-accent font-bold">{t('err_home')}</button>
    </div>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error.message, `${error.stack || ''}\n${info.componentStack || ''}`);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    // Moving to another screen clears the error
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (this.state.failed) return <Fallback onRetry={() => this.setState({ failed: false })} />;
    return this.props.children;
  }
}
