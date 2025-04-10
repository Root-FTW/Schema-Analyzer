# Schema.org Analyzer

Una herramienta para analizar y validar implementaciones de Schema.org en sitios web.

## Características

- Soporte para múltiples formatos (JSON-LD, Microdata, RDFa)
- Validación detallada de esquemas
- Sugerencias de corrección
- Exportación de resultados
- Interfaz moderna y responsiva

## Tecnologías

- React
- Vite
- Bootstrap
- React Syntax Highlighter
- Express (para el servidor proxy)

## Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/Root-FTW/Schema-Analyzer.git

# Entrar al directorio
cd Schema-Analyzer

# Instalar dependencias del frontend
cd schema-analyzer
npm install

# Volver al directorio raíz e instalar dependencias del servidor
cd ..
npm install express cors axios

# Iniciar el servidor proxy
node server.js

# En otra terminal, iniciar el frontend
cd schema-analyzer
npm run dev
```

## Despliegue en Vercel

1. Haz fork o clona este repositorio en tu cuenta de GitHub
2. Inicia sesión en [Vercel](https://vercel.com)
3. Haz clic en "New Project"
4. Importa tu repositorio de GitHub
5. Configura el proyecto:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: cd schema-analyzer && npm install && npm run build
   - Output Directory: schema-analyzer/dist
6. Haz clic en "Deploy"

## Uso

1. Ingresa una URL que contenga datos de Schema.org
2. Selecciona el tipo de Schema.org que esperas encontrar
3. Haz clic en "Analizar"
4. Explora los resultados en las diferentes pestañas:
   - Análisis: Muestra la validación del esquema más relevante
   - Todas las estructuras: Muestra todos los esquemas encontrados
   - Datos sin procesar: Muestra los datos JSON con formato
   - Exportar: Permite exportar los resultados en diferentes formatos

## Licencia

MIT
