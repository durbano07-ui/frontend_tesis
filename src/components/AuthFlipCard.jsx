import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Componente Wrapper para envolver la caja de los formularios de autenticación
 * brindando una animación 3D Sign-In-Flop suave y elegante solo al panel del formulario.
 */
export const AuthFlipCard = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isFlippingOut, setIsFlippingOut] = useState(false);
    const [mountKey, setMountKey] = useState(location.pathname);

    useEffect(() => {
        setMountKey(location.pathname);
        setIsFlippingOut(false);
    }, [location.pathname]);

    // Función para navegar ejecutando el giro 3D primero
    const flipNavigate = (to, e) => {
        if (e) e.preventDefault();
        if (location.pathname === to) return;

        setIsFlippingOut(true);
        setTimeout(() => {
            navigate(to);
        }, 250); // Tiempo del medio giro (90 grados)
    };

    return (
        <div 
            key={mountKey}
            className={`auth-card-3d ${isFlippingOut ? 'flip-out' : 'animate-flip'}`}
        >
            {children(flipNavigate)}
        </div>
    );
};

export default AuthFlipCard;
