import { Component, ReactNode, Suspense } from 'react';

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
          <h3>No se pudo cargar el módulo "{this.props.label}"</h3>
          <p>{this.state.error.message}</p>
          <p>Los demás módulos de la plataforma siguen funcionando con normalidad.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ModuleBoundary({ label, children }: Props) {
  return (
    <ModuleErrorBoundary label={label}>
      <Suspense fallback={<div className="module-loading">Cargando módulo “{label}”…</div>}>
        {children}
      </Suspense>
    </ModuleErrorBoundary>
  );
}
