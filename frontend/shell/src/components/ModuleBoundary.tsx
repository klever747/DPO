import { Component, ReactNode, Suspense } from 'react';
import { Icon } from '../ui/Icon';

interface Props {
  label: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Aísla cada módulo remoto: si un módulo falla al cargar o lanza un error en
 * render, solo ese módulo se degrada — el resto de la aplicación (y de los
 * demás módulos) sigue funcionando con normalidad.
 */
class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`Error en el módulo "${this.props.label}":`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="module-error">
          <Icon name="alert-triangle" size={22} />
          <div>
            <h3>No se pudo cargar el módulo "{this.props.label}"</h3>
            <p>{this.state.error.message}</p>
            <p className="dpo-muted">Los demás módulos de la plataforma siguen funcionando con normalidad.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ModuleLoadingFallback({ label }: { label: string }) {
  return (
    <div className="module-loading">
      <div className="module-loading-header">
        <span className="dpo-spinner dpo-spinner-dark" />
        <span>Cargando "{label}"…</span>
      </div>
      <div className="module-loading-skeleton dpo-skeleton" />
      <div className="module-loading-skeleton dpo-skeleton" />
      <div className="module-loading-skeleton dpo-skeleton" style={{ width: '70%' }} />
    </div>
  );
}

export function ModuleBoundary({ label, children }: Props) {
  return (
    <ModuleErrorBoundary label={label}>
      <Suspense fallback={<ModuleLoadingFallback label={label} />}>{children}</Suspense>
    </ModuleErrorBoundary>
  );
}
