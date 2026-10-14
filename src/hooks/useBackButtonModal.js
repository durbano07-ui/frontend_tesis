import { useState, useEffect, useCallback } from 'react';

/**
 * Estado de apertura de un modal que se cierra con el botón "atrás" del celular/navegador.
 * Al abrir, agrega una entrada al historial (misma URL); al presionar atrás se consume
 * esa entrada y el modal se cierra en lugar de salir de la página.
 *
 * @returns {[boolean, Function, Function]} [isOpen, open, close]
 */
export const useBackButtonModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const handlePopState = () => {
            if (!window.history.state?.modalOpen) setIsOpen(false);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen]);

    const open = useCallback(() => {
        if (!window.history.state?.modalOpen) {
            // Se conserva el estado de React Router para que no detecte un cambio de ruta
            window.history.pushState({ ...window.history.state, modalOpen: true }, '');
        }
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        if (window.history.state?.modalOpen) {
            // El listener de popstate se encarga de cerrar el modal
            window.history.back();
        } else {
            setIsOpen(false);
        }
    }, []);

    return [isOpen, open, close];
};
