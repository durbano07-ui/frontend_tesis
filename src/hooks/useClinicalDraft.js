import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for real-time local auto-drafting and offline resilience in clinical forms.
 *
 * @param {string} moduleKey - Identifier for the module (e.g., 'medicina', 'psicologia', 'odontologia', 'ocupacional', 'enfermeria')
 * @param {string|number} doctorId - ID of the logged in doctor
 * @param {string|number} patientId - ID of the active patient
 * @returns {object} Draft utilities and offline state
 */
export const useClinicalDraft = (moduleKey, doctorId, patientId) => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [draftLastSaved, setDraftLastSaved] = useState(null);
    const debounceTimerRef = useRef(null);

    const storageKey = moduleKey && doctorId && patientId 
        ? `bu_draft_${moduleKey}_doc${doctorId}_pat${patientId}` 
        : null;

    // Monitor internet connectivity
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Save draft data to localStorage
    const saveDraft = useCallback((formData) => {
        if (!storageKey || !formData) return;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            try {
                const timestamp = new Date().toISOString();
                const payload = {
                    updatedAt: timestamp,
                    formData
                };
                localStorage.setItem(storageKey, JSON.stringify(payload));
                setDraftLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            } catch (err) {
                console.warn('Error al guardar borrador local:', err);
            }
        }, 400);
    }, [storageKey]);

    // Load draft from localStorage
    const loadDraft = useCallback(() => {
        if (!storageKey) return null;
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed;
        } catch (err) {
            console.warn('Error al cargar borrador local:', err);
            return null;
        }
    }, [storageKey]);

    // Clear draft from localStorage
    const clearDraft = useCallback(() => {
        if (!storageKey) return;
        try {
            localStorage.removeItem(storageKey);
            setDraftLastSaved(null);
        } catch (err) {
            console.warn('Error al limpiar borrador local:', err);
        }
    }, [storageKey]);

    return {
        isOffline,
        saveDraft,
        loadDraft,
        clearDraft,
        draftLastSaved,
        storageKey
    };
};

export default useClinicalDraft;
