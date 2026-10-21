import { Component } from 'react';

/**
 * ISO/IEC 25010 — Fiabilidad (recuperabilidad): si un componente falla al renderizar, se
 * muestra un mensaje con la opción de recargar en lugar de dejar la pantalla en blanco.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Error de interfaz capturado:', error, info?.componentStack);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div role="alert" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px 16px', background: '#f4f7fa' }}>
                <div style={{ maxWidth: '440px', textAlign: 'center', background: '#fff', borderRadius: '14px', padding: '28px', boxShadow: '0 10px 30px rgba(0,32,64,0.08)' }}>
                    <h1 style={{ fontSize: '20px', color: '#002040', margin: '0 0 8px' }}>Algo salió mal</h1>
                    <p style={{ fontSize: '14px', color: '#475467', margin: '0 0 18px' }}>
                        Ocurrió un error inesperado en esta pantalla. Tus datos guardados no se han perdido.
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        style={{ padding: '11px 20px', borderRadius: '10px', border: 'none', background: '#002040', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Recargar la página
                    </button>
                </div>
            </div>
        );
    }
}
