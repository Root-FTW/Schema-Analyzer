# Schema.org Analyzer

Esta aplicación permite analizar y validar la implementación de Schema.org en páginas web. Puedes ingresar una URL, seleccionar el tipo de Schema.org que esperas encontrar (como Article, Product, etc.), y la aplicación verificará si la implementación es correcta.

## Características

- Extracción de datos Schema.org en formato JSON-LD de cualquier URL
- Validación de la estructura según el tipo seleccionado
- Verificación de propiedades requeridas y recomendadas
- Visualización de los datos crudos de Schema.org

## Requisitos previos

- Node.js (versión 14 o superior)
- npm (viene con Node.js)

## Instalación

1. Clona este repositorio o descarga los archivos
2. Navega al directorio del proyecto
3. Instala las dependencias:

```bash
npm install
```

## Ejecución

Para ejecutar la aplicación, necesitas iniciar tanto el servidor proxy como la aplicación React:

1. Inicia el servidor proxy (para evitar problemas de CORS):

```bash
npm run server
```

2. En otra terminal, inicia la aplicación React:

```bash
npm run dev
```

3. Abre tu navegador y ve a `http://localhost:3000`

## Cómo usar

1. Ingresa la URL que deseas analizar
2. Selecciona el tipo de Schema.org que esperas encontrar (Article, Product, etc.)
3. Haz clic en "Analizar Schema"
4. Revisa los resultados del análisis y la validación

## Tecnologías utilizadas

- React
- Bootstrap
- Axios
- Express (para el servidor proxy)

## Limitaciones

- Actualmente solo soporta la extracción de Schema.org en formato JSON-LD
- No soporta la extracción de microdata o RDFa
