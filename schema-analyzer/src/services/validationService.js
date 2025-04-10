/**
 * Service for validating and providing suggestions about Schema.org data
 */

// Schema.org type definitions and their properties
const schemaDefinitions = {
  // Common types
  Movie: {
    description: 'A movie.',
    requiredProperties: ['name', 'director'],
    recommendedProperties: ['actor', 'datePublished', 'description', 'image', 'genre', 'duration'],
    propertyTypes: {
      name: { type: 'Text', description: 'The title of the movie.' },
      director: { type: 'Person', description: 'The director of the movie.' },
      actor: { type: 'Person', description: 'An actor appearing in the movie.' },
      datePublished: { type: 'Date', description: 'The release date of the movie.' },
      description: { type: 'Text', description: 'A description of the movie.' },
      image: { type: 'URL', description: 'An image of the movie.' },
      genre: { type: 'Text', description: 'The genre of the movie.' },
      duration: { type: 'Duration', description: 'The duration of the movie.' }
    }
  },
  Person: {
    description: 'A person.',
    requiredProperties: ['name'],
    recommendedProperties: ['givenName', 'familyName', 'birthDate', 'image'],
    propertyTypes: {
      name: { type: 'Text', description: 'The full name of the person.' },
      givenName: { type: 'Text', description: 'The given name of the person.' },
      familyName: { type: 'Text', description: 'The family name of the person.' },
      birthDate: { type: 'Date', description: 'The birth date of the person.' },
      image: { type: 'URL', description: 'An image of the person.' }
    }
  },
  Product: {
    description: 'A product.',
    requiredProperties: ['name'],
    recommendedProperties: ['image', 'description', 'brand', 'offers', 'review'],
    propertyTypes: {
      name: { type: 'Text', description: 'The name of the product.' },
      image: { type: 'URL', description: 'An image of the product.' },
      description: { type: 'Text', description: 'A description of the product.' },
      brand: { type: 'Brand', description: 'The brand of the product.' },
      offers: { type: 'Offer', description: 'An offer to purchase the product.' },
      review: { type: 'Review', description: 'A review of the product.' }
    }
  },
  WebPage: {
    description: 'A web page.',
    requiredProperties: ['name'],
    recommendedProperties: ['description', 'datePublished', 'author', 'image'],
    propertyTypes: {
      name: { type: 'Text', description: 'The title of the web page.' },
      description: { type: 'Text', description: 'A description of the web page.' },
      datePublished: { type: 'Date', description: 'The publication date of the web page.' },
      author: { type: 'Person', description: 'The author of the web page.' },
      image: { type: 'URL', description: 'A representative image of the web page.' }
    }
  },
  Article: {
    description: 'An article.',
    requiredProperties: ['headline', 'author', 'datePublished'],
    recommendedProperties: ['image', 'description', 'articleBody', 'publisher'],
    propertyTypes: {
      headline: { type: 'Text', description: 'The headline of the article.' },
      author: { type: 'Person', description: 'The author of the article.' },
      datePublished: { type: 'Date', description: 'The publication date of the article.' },
      image: { type: 'URL', description: 'A representative image of the article.' },
      description: { type: 'Text', description: 'A description of the article.' },
      articleBody: { type: 'Text', description: 'The main content of the article.' },
      publisher: { type: 'Organization', description: 'The organization that published the article.' }
    }
  },
  Organization: {
    description: 'An organization.',
    requiredProperties: ['name'],
    recommendedProperties: ['logo', 'url', 'address', 'contactPoint'],
    propertyTypes: {
      name: { type: 'Text', description: 'The name of the organization.' },
      logo: { type: 'URL', description: 'The logo of the organization.' },
      url: { type: 'URL', description: 'The URL of the organization\'s website.' },
      address: { type: 'PostalAddress', description: 'The address of the organization.' },
      contactPoint: { type: 'ContactPoint', description: 'A contact point for the organization.' }
    }
  },
  Event: {
    description: 'An event.',
    requiredProperties: ['name', 'startDate', 'location'],
    recommendedProperties: ['endDate', 'description', 'image', 'performer', 'offers'],
    propertyTypes: {
      name: { type: 'Text', description: 'The name of the event.' },
      startDate: { type: 'DateTime', description: 'The start date and time of the event.' },
      location: { type: 'Place', description: 'The location where the event is held.' },
      endDate: { type: 'DateTime', description: 'The end date and time of the event.' },
      description: { type: 'Text', description: 'A description of the event.' },
      image: { type: 'URL', description: 'A representative image of the event.' },
      performer: { type: 'Person', description: 'A performer at the event.' },
      offers: { type: 'Offer', description: 'An offer to purchase tickets for the event.' }
    }
  }
};

/**
 * Validates a Schema.org object against its definition
 * @param {Object} schema - The Schema.org object to validate
 * @param {string} expectedType - The expected type (optional)
 * @returns {Object} - Validation results
 */
export const validateSchema = (schema, expectedType = null) => {
  const result = {
    isValid: true,
    type: {
      detected: schema['@type'],
      expected: expectedType,
      matches: expectedType ? schema['@type'] === expectedType : true
    },
    requiredProperties: {
      present: [],
      missing: [],
      score: 0
    },
    recommendedProperties: {
      present: [],
      missing: [],
      score: 0
    },
    propertyValidation: {},
    formatValidation: {
      format: schema._format || 'desconocido',
      isPreferred: schema._format === 'json-ld' // JSON-LD es el formato preferido
    },
    overallScore: 0,
    suggestions: []
  };

  // If it doesn't have a type, it's not valid
  if (!schema['@type']) {
    result.isValid = false;
    result.suggestions.push({
      type: 'error',
      message: 'The Schema.org object does not have a defined type (@type).',
      example: '{ "@type": "Movie", "name": "Example Movie" }'
    });
    return result;
  }

  // Get the type definition
  const typeDefinition = schemaDefinitions[schema['@type']];
  if (!typeDefinition) {
    // If we don't have the definition, we can't validate in detail
    result.suggestions.push({
      type: 'warning',
      message: `We don't have a detailed definition for the type "${schema['@type']}".`,
      link: `https://schema.org/${schema['@type']}`
    });
    return result;
  }

  // Validar propiedades requeridas
  if (typeDefinition.requiredProperties) {
    typeDefinition.requiredProperties.forEach(prop => {
      if (schema[prop] !== undefined) {
        result.requiredProperties.present.push(prop);
      } else {
        result.requiredProperties.missing.push(prop);
        result.isValid = false;

        // Agregar sugerencia para la propiedad faltante
        result.suggestions.push({
          type: 'error',
          message: `Falta la propiedad requerida "${prop}".`,
          property: prop,
          description: typeDefinition.propertyTypes[prop]?.description || '',
          example: generatePropertyExample(prop, typeDefinition.propertyTypes[prop]?.type)
        });
      }
    });

    // Calcular puntuación de propiedades requeridas
    const totalRequired = typeDefinition.requiredProperties.length;
    result.requiredProperties.score = totalRequired > 0
      ? Math.round((result.requiredProperties.present.length / totalRequired) * 100)
      : 100;
  }

  // Validar propiedades recomendadas
  if (typeDefinition.recommendedProperties) {
    typeDefinition.recommendedProperties.forEach(prop => {
      if (schema[prop] !== undefined) {
        result.recommendedProperties.present.push(prop);
      } else {
        result.recommendedProperties.missing.push(prop);

        // Agregar sugerencia para la propiedad recomendada faltante
        result.suggestions.push({
          type: 'suggestion',
          message: `Se recomienda agregar la propiedad "${prop}".`,
          property: prop,
          description: typeDefinition.propertyTypes[prop]?.description || '',
          example: generatePropertyExample(prop, typeDefinition.propertyTypes[prop]?.type)
        });
      }
    });

    // Calcular puntuación de propiedades recomendadas
    const totalRecommended = typeDefinition.recommendedProperties.length;
    result.recommendedProperties.score = totalRecommended > 0
      ? Math.round((result.recommendedProperties.present.length / totalRecommended) * 100)
      : 100;
  }

  // Validar tipos de propiedades
  if (typeDefinition.propertyTypes) {
    Object.keys(schema).forEach(prop => {
      // Ignorar propiedades especiales
      if (prop === '@type' || prop === '@context' || prop === '_format') return;

      const propDef = typeDefinition.propertyTypes[prop];
      if (propDef) {
        result.propertyValidation[prop] = validatePropertyValue(schema[prop], propDef.type);

        // Si la propiedad no es válida, agregar sugerencia
        if (!result.propertyValidation[prop].isValid) {
          result.isValid = false;
          result.suggestions.push({
            type: 'error',
            message: `La propiedad "${prop}" no tiene un formato válido. Se esperaba ${propDef.type}.`,
            property: prop,
            description: propDef.description,
            example: generatePropertyExample(prop, propDef.type)
          });
        }
      }
    });
  }

  // Calcular puntuación general
  result.overallScore = Math.round(
    (result.requiredProperties.score * 0.7) +
    (result.recommendedProperties.score * 0.3)
  );

  // Sugerencias sobre el formato
  if (!result.formatValidation.isPreferred) {
    result.suggestions.push({
      type: 'suggestion',
      message: `Se recomienda usar JSON-LD en lugar de ${result.formatValidation.format}.`,
      example: generateJsonLdExample(schema['@type'])
    });
  }

  return result;
};

/**
 * Valida el valor de una propiedad según su tipo esperado
 * @param {any} value - El valor a validar
 * @param {string} expectedType - El tipo esperado
 * @returns {Object} - Resultado de la validación
 */
const validatePropertyValue = (value, expectedType) => {
  const result = {
    isValid: true,
    expectedType: expectedType,
    actualType: typeof value,
    message: ''
  };

  switch (expectedType) {
    case 'Text':
      if (typeof value !== 'string') {
        result.isValid = false;
        result.message = 'Se esperaba un texto.';
      }
      break;
    case 'URL':
      if (typeof value !== 'string' || !isValidUrl(value)) {
        result.isValid = false;
        result.message = 'Se esperaba una URL válida.';
      }
      break;
    case 'Date':
    case 'DateTime':
      if (typeof value !== 'string' || !isValidDate(value)) {
        result.isValid = false;
        result.message = 'Se esperaba una fecha válida en formato ISO (YYYY-MM-DD).';
      }
      break;
    case 'Number':
      if (typeof value !== 'number') {
        result.isValid = false;
        result.message = 'Se esperaba un número.';
      }
      break;
    case 'Duration':
      if (typeof value !== 'string' || !isValidDuration(value)) {
        result.isValid = false;
        result.message = 'Se esperaba una duración en formato ISO (PT1H30M).';
      }
      break;
    // Para tipos complejos (Person, Organization, etc.), verificamos que sea un objeto
    default:
      if (typeof value !== 'object') {
        result.isValid = false;
        result.message = `Se esperaba un objeto de tipo ${expectedType}.`;
      }
  }

  return result;
};

/**
 * Verifica si una cadena es una URL válida
 * @param {string} url - La URL a validar
 * @returns {boolean} - true si es válida, false en caso contrario
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Verifica si una cadena es una fecha válida
 * @param {string} date - La fecha a validar
 * @returns {boolean} - true si es válida, false en caso contrario
 */
const isValidDate = (date) => {
  // Formato ISO: YYYY-MM-DD o YYYY-MM-DDThh:mm:ss
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;
  return isoDateRegex.test(date) && !isNaN(new Date(date).getTime());
};

/**
 * Verifica si una cadena es una duración válida en formato ISO
 * @param {string} duration - La duración a validar
 * @returns {boolean} - true si es válida, false en caso contrario
 */
const isValidDuration = (duration) => {
  // Formato ISO: PT1H30M, P1DT2H, etc.
  const isoDurationRegex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;
  return isoDurationRegex.test(duration);
};

/**
 * Genera un ejemplo de valor para una propiedad según su tipo
 * @param {string} property - El nombre de la propiedad
 * @param {string} type - El tipo de la propiedad
 * @returns {string} - Un ejemplo en formato string
 */
const generatePropertyExample = (property, type) => {
  switch (type) {
    case 'Text':
      return `"${property}": "Ejemplo de ${property}"`;
    case 'URL':
      return `"${property}": "https://ejemplo.com/${property.toLowerCase()}"`;
    case 'Date':
      return `"${property}": "2023-01-01"`;
    case 'DateTime':
      return `"${property}": "2023-01-01T12:00:00Z"`;
    case 'Number':
      return `"${property}": 42`;
    case 'Duration':
      return `"${property}": "PT2H30M"`;
    case 'Person':
      return `"${property}": { "@type": "Person", "name": "Nombre Apellido" }`;
    case 'Organization':
      return `"${property}": { "@type": "Organization", "name": "Nombre de la Organización" }`;
    default:
      return `"${property}": "Valor de ejemplo"`;
  }
};

/**
 * Genera un ejemplo de código JSON-LD para un tipo específico
 * @param {string} type - El tipo de Schema.org
 * @returns {string} - Un ejemplo de código JSON-LD
 */
const generateJsonLdExample = (type) => {
  const definition = schemaDefinitions[type];
  if (!definition) return '';

  let example = '<script type="application/ld+json">\n{\n';
  example += `  "@context": "https://schema.org",\n`;
  example += `  "@type": "${type}",\n`;

  // Agregar propiedades requeridas
  if (definition.requiredProperties) {
    definition.requiredProperties.forEach(prop => {
      const propType = definition.propertyTypes[prop]?.type || 'Text';
      const exampleValue = generatePropertyValueExample(propType);
      example += `  "${prop}": ${exampleValue},\n`;
    });
  }

  // Agregar algunas propiedades recomendadas (máximo 3)
  if (definition.recommendedProperties) {
    const recommendedToShow = definition.recommendedProperties.slice(0, 3);
    recommendedToShow.forEach(prop => {
      const propType = definition.propertyTypes[prop]?.type || 'Text';
      const exampleValue = generatePropertyValueExample(propType);
      example += `  "${prop}": ${exampleValue},\n`;
    });
  }

  // Eliminar la última coma y cerrar el objeto
  example = example.slice(0, -2) + '\n}\n</script>';
  return example;
};

/**
 * Genera un ejemplo de valor para un tipo específico
 * @param {string} type - El tipo de la propiedad
 * @returns {string} - Un ejemplo de valor
 */
const generatePropertyValueExample = (type) => {
  switch (type) {
    case 'Text':
      return '"Ejemplo de texto"';
    case 'URL':
      return '"https://ejemplo.com"';
    case 'Date':
      return '"2023-01-01"';
    case 'DateTime':
      return '"2023-01-01T12:00:00Z"';
    case 'Number':
      return '42';
    case 'Duration':
      return '"PT2H30M"';
    case 'Person':
      return '{ "@type": "Person", "name": "Nombre Apellido" }';
    case 'Organization':
      return '{ "@type": "Organization", "name": "Nombre de la Organización" }';
    default:
      return '"Valor de ejemplo"';
  }
};

/**
 * Genera sugerencias de corrección para un Schema.org
 * @param {Object} schema - El objeto Schema.org
 * @param {string} expectedType - El tipo esperado
 * @returns {Array} - Lista de sugerencias
 */
export const generateSuggestions = (schema, expectedType) => {
  const validationResult = validateSchema(schema, expectedType);
  return validationResult.suggestions;
};

/**
 * Genera un código de ejemplo corregido
 * @param {Object} schema - El objeto Schema.org original
 * @param {string} expectedType - El tipo esperado
 * @returns {string} - Código JSON-LD corregido
 */
export const generateCorrectedExample = (schema, expectedType) => {
  // Si el tipo no coincide, usar el tipo esperado
  const type = expectedType || schema['@type'];
  if (!type) return '';

  const definition = schemaDefinitions[type];
  if (!definition) return '';

  // Crear un nuevo objeto con las propiedades del original
  const corrected = {
    '@context': 'https://schema.org',
    '@type': type,
    ...schema
  };

  // Eliminar propiedades técnicas
  delete corrected._format;

  // Asegurarse de que todas las propiedades requeridas estén presentes
  if (definition.requiredProperties) {
    definition.requiredProperties.forEach(prop => {
      if (corrected[prop] === undefined) {
        const propType = definition.propertyTypes[prop]?.type || 'Text';
        corrected[prop] = generateDummyValue(propType);
      }
    });
  }

  return JSON.stringify(corrected, null, 2);
};

/**
 * Genera un valor dummy para un tipo específico
 * @param {string} type - El tipo de la propiedad
 * @returns {any} - Un valor dummy
 */
const generateDummyValue = (type) => {
  switch (type) {
    case 'Text':
      return 'Ejemplo de texto';
    case 'URL':
      return 'https://ejemplo.com';
    case 'Date':
      return '2023-01-01';
    case 'DateTime':
      return '2023-01-01T12:00:00Z';
    case 'Number':
      return 42;
    case 'Duration':
      return 'PT2H30M';
    case 'Person':
      return { '@type': 'Person', 'name': 'Nombre Apellido' };
    case 'Organization':
      return { '@type': 'Organization', 'name': 'Nombre de la Organización' };
    default:
      return 'Valor de ejemplo';
  }
};

export default {
  validateSchema,
  generateSuggestions,
  generateCorrectedExample,
  schemaDefinitions
};
