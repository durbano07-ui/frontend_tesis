# Guía de Conexión del Frontend con el Backend API

Esta guía describe cómo está configurada la integración de la API en el frontend del **Sistema de Bienestar Universitario**, detallando las variables de entorno, el cliente HTTP, la gestión de autenticación y ejemplos prácticos de uso.

---

## 1. Configuración de Variables de Entorno

El proyecto utiliza **Vite** como empaquetador, lo que requiere que las variables de entorno destinadas al navegador comiencen con el prefijo `VITE_`.

### Archivo `.env` (Local)
Para conectar tu frontend con el backend local, crea un archivo `.env` o `.env.local` en la raíz del proyecto (basado en [.env.example](file:///home/diegou/Documentos/Tesis_BienestarUniversitario/.env.example)):

```env
# URL de la API del Backend (Laravel u otro)
VITE_API_URL=http://localhost:8000/api/v1
```

> [!NOTE]
> Si no se define esta variable, el cliente HTTP utilizará por defecto `http://localhost:8000/api/v1`.

---

## 2. Cliente HTTP Centralizado (Axios)

Toda la comunicación de red se realiza mediante la instancia personalizada de **Axios** ubicada en [axios.js](file:///home/diegou/Documentos/Tesis_BienestarUniversitario/src/api/axios.js).

### Características Clave:
1. **URL Base Dinámica**: Toma la propiedad `baseURL` desde `import.meta.env.VITE_API_URL`.
2. **Encabezados por Defecto**: Configura automáticamente `'Content-Type': 'application/json'` y `'Accept': 'application/json'`.
3. **Interceptor de Peticiones**: Agrega de manera automática el Token de Portador (`Bearer Token`) a los encabezados de cualquier petición si el usuario ya inició sesión.

### Código de la Configuración:
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor para inyectar automáticamente el Bearer Token en cada request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
```

---

## 3. Almacenamiento y Estado de Autenticación (Zustand)

El estado de la sesión (usuario y token) se gestiona a través de la biblioteca de estado ligero **Zustand** en [authStore.js](file:///home/diegou/Documentos/Tesis_BienestarUniversitario/src/stores/authStore.js).

Este almacén (`store`) guarda las credenciales tanto en memoria reactiva como en el almacenamiento local (`localStorage`) para que la sesión persista tras recargar la página.

### Acciones Principales:
* **`login(user, token)`**: Guarda el token y el usuario en `localStorage` y actualiza el estado global de la app.
* **`logout()`**: Elimina el token y el usuario de `localStorage` y limpia el estado global.
* **`updateUser(user)`**: Actualiza el perfil del usuario activo (por ejemplo, tras modificar datos personales).

---

## 4. Ejemplos Prácticos de Consumo de API

A continuación se muestran ejemplos reales de cómo interactuar con el backend importando la instancia de `api`.

### A. Autenticación de Usuario (Login)
Implementado en [Login.jsx](file:///home/diegou/Documentos/Tesis_BienestarUniversitario/src/pages/auth/Login.jsx#L29-L55):

```javascript
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';

// Dentro del componente
const loginStore = useAuthStore((state) => state.login);

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await api.post('/auth/login', { email, password });
        const { user, token } = response.data;

        // Se guarda en el estado global e inyecta el token en futuras peticiones
        loginStore(user, token);
        
        // Redirección según rol
        if (user?.roles?.includes('enfermero')) {
            navigate('/enfermeria');
        } else {
            navigate('/dashboard');
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Error de autenticación');
    }
};
```

### B. Petición Protegida GET (Búsqueda de Paciente)
Este endpoint requiere autenticación. Axios inyecta el encabezado `Authorization: Bearer <token>` automáticamente gracias al interceptor.

```javascript
import api from '../../api/axios';

const buscarPaciente = async (cedula) => {
    try {
        const response = await api.get('/users/search-by-cedula', {
            params: { cedula }
        });
        return response.data; // Retorna los datos del paciente
    } catch (err) {
        console.error('Error al buscar paciente', err);
    }
};
```

### C. Petición POST/PUT (Guardar o Actualizar Datos)
Ejemplo de creación o actualización de registros clínicos:

```javascript
import api from '../../api/axios';

const guardarFichaClinica = async (pacienteId, datosFicha) => {
    try {
        // Ejemplo POST
        const res = await api.post('/psicologia/motivo-consulta', { 
            id_usuario_paciente: pacienteId, 
            detalle_motivo: datosFicha.motivo 
        });
        return res.data;
    } catch (err) {
        console.error('Error al guardar', err);
    }
};
```

---

## 5. Manejo Recomendado de Errores

Para ofrecer una buena experiencia de usuario, captura siempre los errores de red de la siguiente forma:

```javascript
try {
    const response = await api.get('/dashboard/stats');
} catch (error) {
    if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error('Error del Servidor:', error.response.data.message);
        alert(error.response.data.message || 'Ocurrió un error en el servidor.');
    } else if (error.request) {
        // La petición se hizo pero no se recibió respuesta (ej. caída de red)
        console.error('Sin conexión con el servidor:', error.request);
        alert('No se pudo establecer conexión con el servidor. Verifica tu internet.');
    } else {
        // Ocurrió algún error al configurar la petición
        console.error('Error:', error.message);
    }
}
```

---

## 6. Despliegue en Producción

Cuando compiles la aplicación para producción con `npm run build`:
1. Asegúrate de configurar la variable de entorno `VITE_API_URL` en tu plataforma de despliegue (Vercel, Netlify, VPS, etc.) apuntando a la URL pública del backend de producción (por ejemplo, `https://api.tuuniversidad.edu.ec/api/v1`).
2. Si usas subdominios, valida que los encabezados de CORS del servidor permitan peticiones desde el dominio de tu frontend.
