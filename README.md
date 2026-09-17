# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## 📝 Documentación del Proyecto

* **[Guía de Conexión de API al Backend](file:///home/diegou/Documentos/Tesis_BienestarUniversitario/docs/CONEXION_API.md)**: Explica el cliente centralizado de Axios, interceptores de tokens y cómo realizar peticiones protegidas.

## ⚙️ Configuración Inicial

1. Copia el archivo de ejemplo para configurar tus variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Modifica el archivo `.env` configurando la variable `VITE_API_URL` con la dirección de tu backend (por defecto: `http://localhost:8000/api/v1`).

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

