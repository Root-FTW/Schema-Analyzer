import axios from 'axios';

const PROXY_URL = '/api/fetch-url';

/**
 * Extrae los datos de Schema.org de una URL
 * @param {string} url - La URL a analizar
 * @returns {Promise<Object>} - Un objeto con los datos de Schema.org encontrados y metadatos
 */
export const extractSchemaFromUrl = async (url) => {
  try {
    console.log('Intentando extraer Schema.org de:', url);

    // Usar el servidor proxy para evitar problemas de CORS
    const response = await axios.post(PROXY_URL, { url }, {
      timeout: 15000, // Aumentar el timeout a 15 segundos
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !response.data.html) {
      console.error('Respuesta del proxy inválida:', response.data);
      throw new Error('Respuesta del servidor proxy inválida');
    }

    const html = response.data.html;
    console.log('HTML recibido correctamente, longitud:', html.length);

    // Extraer los datos de Schema.org del HTML
    const result = extractSchemaFromHtml(html);

    // Obtener estadísticas de formatos
    const formatStats = {
      jsonld: result.filter(schema => schema._format === 'json-ld').length,
      microdata: result.filter(schema => schema._format === 'microdata').length,
      rdfa: result.filter(schema => schema._format === 'rdfa').length
    };

    // Obtener formatos únicos encontrados
    const formats = Object.keys(formatStats).filter(format => formatStats[format] > 0);

    console.log('Schemas encontrados:', result.length);
    console.log('Formatos encontrados:', formats);
    console.log('Estadísticas de formatos:', formatStats);

    return {
      schemas: result,
      formats: formats,
      stats: formatStats
    };
  } catch (error) {
    console.error('Error al extraer Schema.org:', error);
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Respuesta del servidor:', error.response.status, error.response.data);
      throw new Error(`Error del servidor: ${error.response.status}`);
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor');
      throw new Error('No se recibió respuesta del servidor');
    } else {
      // Algo sucedió al configurar la solicitud
      throw new Error(`Error de red: ${error.message}`);
    }
  }
};

/**
 * Extrae los datos de Schema.org del HTML
 * @param {string} html - El HTML a analizar
 * @returns {Object} - Un objeto con los datos de Schema.org encontrados y sus formatos
 */
const extractSchemaFromHtml = (html) => {
  const result = {
    schemas: [],
    formats: [],
    stats: {
      jsonld: 0,
      microdata: 0,
      rdfa: 0
    }
  };

  try {
    // 1. Extraer JSON-LD
    const jsonldSchemas = extractJsonLd(html);
    if (jsonldSchemas.length > 0) {
      result.schemas.push(...jsonldSchemas);
      result.formats.push('json-ld');
      result.stats.jsonld = jsonldSchemas.length;
    }

    // 2. Extraer Microdata
    const microdataSchemas = extractMicrodata(html);
    if (microdataSchemas.length > 0) {
      result.schemas.push(...microdataSchemas);
      result.formats.push('microdata');
      result.stats.microdata = microdataSchemas.length;
    }

    // 3. Extraer RDFa
    const rdfaSchemas = extractRdfa(html);
    if (rdfaSchemas.length > 0) {
      result.schemas.push(...rdfaSchemas);
      result.formats.push('rdfa');
      result.stats.rdfa = rdfaSchemas.length;
    }

    console.log('Formatos encontrados:', result.formats);
    console.log('Estadísticas de extracción:', result.stats);

    return result.schemas;
  } catch (error) {
    console.error('Error al extraer Schema.org del HTML:', error);
    return [];
  }
};

/**
 * Extrae datos de Schema.org en formato JSON-LD
 * @param {string} html - El HTML a analizar
 * @returns {Array} - Un array con los datos de Schema.org en formato JSON-LD
 */
const extractJsonLd = (html) => {
  const schemas = [];

  try {
    // Buscar scripts de tipo application/ld+json
    const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      try {
        const jsonStr = match[1].trim();
        const data = JSON.parse(jsonStr);

        // Manejar tanto objetos individuales como arrays de objetos
        if (Array.isArray(data)) {
          schemas.push(...data.map(item => ({ ...item, _format: 'json-ld' })));
        } else if (data['@graph'] && Array.isArray(data['@graph'])) {
          // Manejar el caso de @graph que contiene un array de objetos
          schemas.push(...data['@graph'].map(item => ({ ...item, _format: 'json-ld' })));
        } else {
          schemas.push({ ...data, _format: 'json-ld' });
        }
      } catch (jsonError) {
        console.warn('Error al parsear JSON de Schema.org:', jsonError);
      }
    }

    return schemas;
  } catch (error) {
    console.error('Error al extraer JSON-LD:', error);
    return [];
  }
};

/**
 * Extrae datos de Schema.org en formato Microdata
 * @param {string} html - El HTML a analizar
 * @returns {Array} - Un array con los datos de Schema.org en formato Microdata
 */
const extractMicrodata = (html) => {
  const schemas = [];

  try {
    // Crear un DOM a partir del HTML para poder analizarlo
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Buscar elementos con el atributo itemscope
    const itemscopes = doc.querySelectorAll('[itemscope]');

    // Función para procesar un elemento con itemscope
    const processItemScope = (element) => {
      const schema = { _format: 'microdata' };

      // Obtener el tipo
      const itemtype = element.getAttribute('itemtype');
      if (itemtype) {
        // Extraer el tipo de la URL (ej: http://schema.org/Person -> Person)
        const typeMatch = itemtype.match(/\/([^\/]+)$/);
        if (typeMatch && typeMatch[1]) {
          schema['@type'] = typeMatch[1];
        } else {
          schema['@type'] = itemtype;
        }
      }

      // Obtener las propiedades
      const itemprops = element.querySelectorAll('[itemprop]');
      itemprops.forEach(prop => {
        const propName = prop.getAttribute('itemprop');
        let propValue;

        // Si tiene itemscope, es un objeto anidado
        if (prop.hasAttribute('itemscope')) {
          propValue = processItemScope(prop);
        } else {
          // Obtener el valor según el tipo de elemento
          if (prop.tagName === 'META') {
            propValue = prop.getAttribute('content');
          } else if (prop.tagName === 'IMG') {
            propValue = prop.getAttribute('src');
          } else if (prop.tagName === 'A') {
            propValue = prop.getAttribute('href');
          } else if (prop.tagName === 'TIME') {
            propValue = prop.getAttribute('datetime') || prop.textContent;
          } else {
            propValue = prop.textContent.trim();
          }
        }

        // Agregar la propiedad al schema
        if (propName && propValue !== undefined) {
          schema[propName] = propValue;
        }
      });

      return schema;
    };

    // Procesar todos los elementos con itemscope que no están anidados
    itemscopes.forEach(itemscope => {
      // Solo procesar elementos de nivel superior (no anidados)
      if (!itemscope.closest('[itemscope] [itemscope]')) {
        schemas.push(processItemScope(itemscope));
      }
    });

    return schemas;
  } catch (error) {
    console.error('Error al extraer Microdata:', error);
    return [];
  }
};

/**
 * Extrae datos de Schema.org en formato RDFa
 * @param {string} html - El HTML a analizar
 * @returns {Array} - Un array con los datos de Schema.org en formato RDFa
 */
const extractRdfa = (html) => {
  const schemas = [];

  try {
    // Crear un DOM a partir del HTML para poder analizarlo
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Buscar elementos con el atributo typeof (indica el tipo en RDFa)
    const typeofElements = doc.querySelectorAll('[typeof]');

    // Función para procesar un elemento con typeof
    const processTypeofElement = (element) => {
      const schema = { _format: 'rdfa' };

      // Obtener el tipo
      const typeValue = element.getAttribute('typeof');
      if (typeValue) {
        schema['@type'] = typeValue.replace('schema:', '');
      }

      // Obtener las propiedades
      const propElements = element.querySelectorAll('[property]');
      propElements.forEach(prop => {
        const propName = prop.getAttribute('property').replace('schema:', '');
        let propValue;

        // Si tiene typeof, es un objeto anidado
        if (prop.hasAttribute('typeof')) {
          propValue = processTypeofElement(prop);
        } else {
          // Obtener el valor según el tipo de elemento
          if (prop.hasAttribute('content')) {
            propValue = prop.getAttribute('content');
          } else if (prop.tagName === 'IMG') {
            propValue = prop.getAttribute('src');
          } else if (prop.tagName === 'A') {
            propValue = prop.getAttribute('href');
          } else if (prop.tagName === 'TIME') {
            propValue = prop.getAttribute('datetime') || prop.textContent;
          } else {
            propValue = prop.textContent.trim();
          }
        }

        // Agregar la propiedad al schema
        if (propName && propValue !== undefined) {
          schema[propName] = propValue;
        }
      });

      return schema;
    };

    // Procesar todos los elementos con typeof que no están anidados
    typeofElements.forEach(element => {
      // Solo procesar elementos de nivel superior (no anidados)
      if (!element.closest('[typeof] [typeof]')) {
        schemas.push(processTypeofElement(element));
      }
    });

    return schemas;
  } catch (error) {
    console.error('Error al extraer RDFa:', error);
    return [];
  }
};

export default {
  extractSchemaFromUrl
};
