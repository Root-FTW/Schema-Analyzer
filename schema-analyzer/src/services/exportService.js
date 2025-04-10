/**
 * Servicio para exportar los resultados del análisis de Schema.org
 */

/**
 * Exporta los resultados a JSON
 * @param {Object} results - Los resultados del análisis
 * @returns {string} - JSON en formato string
 */
export const exportToJson = (results) => {
  try {
    return JSON.stringify(results, null, 2);
  } catch (error) {
    console.error('Error al exportar a JSON:', error);
    return JSON.stringify({ error: 'Error al exportar a JSON' });
  }
};

/**
 * Exporta los resultados a formato HTML
 * @param {Object} results - Los resultados del análisis
 * @returns {string} - HTML en formato string
 */
export const exportToHtml = (results) => {
  try {
    const { url, expectedType, schemas, validationResults } = results;
    
    let html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Análisis de Schema.org para ${url}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .header {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 5px solid #4285f4;
    }
    .section {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .success {
      color: #28a745;
    }
    .warning {
      color: #ffc107;
    }
    .error {
      color: #dc3545;
    }
    .property-list {
      list-style-type: none;
      padding-left: 0;
    }
    .property-list li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .property-list li:last-child {
      border-bottom: none;
    }
    .schema-data {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: monospace;
      white-space: pre;
    }
    .score-bar {
      height: 10px;
      background-color: #e9ecef;
      border-radius: 5px;
      margin-top: 5px;
      overflow: hidden;
    }
    .score-fill {
      height: 100%;
      background-color: #4285f4;
    }
    .suggestion {
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .suggestion.error {
      background-color: rgba(220, 53, 69, 0.1);
      border-left: 3px solid #dc3545;
    }
    .suggestion.warning {
      background-color: rgba(255, 193, 7, 0.1);
      border-left: 3px solid #ffc107;
    }
    .suggestion.suggestion {
      background-color: rgba(13, 110, 253, 0.1);
      border-left: 3px solid #0d6efd;
    }
    .code-example {
      background-color: #282c34;
      color: #abb2bf;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: monospace;
      white-space: pre;
    }
    .formats {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .format-badge {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.8em;
      background-color: #e9ecef;
    }
    .format-badge.json-ld {
      background-color: #4285f4;
      color: white;
    }
    .format-badge.microdata {
      background-color: #34a853;
      color: white;
    }
    .format-badge.rdfa {
      background-color: #fbbc05;
      color: white;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Análisis de Schema.org</h1>
    <p><strong>URL:</strong> ${url}</p>
    <p><strong>Tipo esperado:</strong> ${expectedType || 'No especificado'}</p>
    <div class="formats">
      ${results.formats ? results.formats.map(format => 
        `<span class="format-badge ${format}">${format}</span>`
      ).join('') : ''}
    </div>
  </div>
`;

    // Resumen de resultados
    html += `
  <div class="section">
    <h2>Resumen</h2>
    <p>Se encontraron ${schemas.length} estructuras de Schema.org.</p>
    ${validationResults.map((result, index) => `
    <div>
      <h3>Estructura #${index + 1}: ${result.type.detected || 'Sin tipo'}</h3>
      <p>
        <strong>Puntuación general:</strong> 
        <span class="${getScoreClass(result.overallScore)}">${result.overallScore}%</span>
        <div class="score-bar">
          <div class="score-fill" style="width: ${result.overallScore}%"></div>
        </div>
      </p>
      <p>
        <strong>Propiedades requeridas:</strong> 
        <span class="${getScoreClass(result.requiredProperties.score)}">${result.requiredProperties.score}%</span>
        (${result.requiredProperties.present.length}/${result.requiredProperties.present.length + result.requiredProperties.missing.length})
        <div class="score-bar">
          <div class="score-fill" style="width: ${result.requiredProperties.score}%"></div>
        </div>
      </p>
      <p>
        <strong>Propiedades recomendadas:</strong> 
        <span class="${getScoreClass(result.recommendedProperties.score)}">${result.recommendedProperties.score}%</span>
        (${result.recommendedProperties.present.length}/${result.recommendedProperties.present.length + result.recommendedProperties.missing.length})
        <div class="score-bar">
          <div class="score-fill" style="width: ${result.recommendedProperties.score}%"></div>
        </div>
      </p>
    </div>
    `).join('')}
  </div>
`;

    // Detalles de validación
    html += `
  <div class="section">
    <h2>Detalles de validación</h2>
    ${validationResults.map((result, index) => `
    <div>
      <h3>Estructura #${index + 1}: ${result.type.detected || 'Sin tipo'}</h3>
      
      <h4>Tipo</h4>
      <p>
        <strong>Detectado:</strong> ${result.type.detected || 'No detectado'}<br>
        <strong>Esperado:</strong> ${result.type.expected || 'No especificado'}<br>
        <strong>Coincide:</strong> ${result.type.matches ? 
          '<span class="success">Sí</span>' : 
          '<span class="error">No</span>'}
      </p>
      
      <h4>Formato</h4>
      <p>
        <strong>Detectado:</strong> ${result.formatValidation.format}<br>
        <strong>Es preferido:</strong> ${result.formatValidation.isPreferred ? 
          '<span class="success">Sí</span>' : 
          '<span class="warning">No (se recomienda JSON-LD)</span>'}
      </p>
      
      <h4>Propiedades requeridas</h4>
      <ul class="property-list">
        ${result.requiredProperties.present.map(prop => 
          `<li><span class="success">✓</span> ${prop}</li>`
        ).join('')}
        ${result.requiredProperties.missing.map(prop => 
          `<li><span class="error">✗</span> ${prop}</li>`
        ).join('')}
      </ul>
      
      <h4>Propiedades recomendadas</h4>
      <ul class="property-list">
        ${result.recommendedProperties.present.map(prop => 
          `<li><span class="success">✓</span> ${prop}</li>`
        ).join('')}
        ${result.recommendedProperties.missing.map(prop => 
          `<li><span class="warning">○</span> ${prop}</li>`
        ).join('')}
      </ul>
    </div>
    `).join('')}
  </div>
`;

    // Sugerencias
    html += `
  <div class="section">
    <h2>Sugerencias de mejora</h2>
    ${validationResults.map((result, index) => `
    <div>
      <h3>Estructura #${index + 1}: ${result.type.detected || 'Sin tipo'}</h3>
      ${result.suggestions.length > 0 ? 
        result.suggestions.map(suggestion => `
        <div class="suggestion ${suggestion.type}">
          <p><strong>${suggestion.message}</strong></p>
          ${suggestion.description ? `<p>${suggestion.description}</p>` : ''}
          ${suggestion.example ? `
          <div class="code-example">${suggestion.example}</div>
          ` : ''}
          ${suggestion.link ? `<p><a href="${suggestion.link}" target="_blank">Más información</a></p>` : ''}
        </div>
        `).join('') : 
        '<p>No hay sugerencias. ¡Todo se ve bien!</p>'
      }
    </div>
    `).join('')}
  </div>
`;

    // Datos crudos
    html += `
  <div class="section">
    <h2>Datos crudos</h2>
    ${schemas.map((schema, index) => `
    <div>
      <h3>Estructura #${index + 1}</h3>
      <div class="schema-data">${JSON.stringify(schema, null, 2)}</div>
    </div>
    `).join('')}
  </div>
`;

    // Cerrar HTML
    html += `
</body>
</html>
`;

    return html;
  } catch (error) {
    console.error('Error al exportar a HTML:', error);
    return `<html><body><h1>Error al exportar a HTML</h1><p>${error.message}</p></body></html>`;
  }
};

/**
 * Obtiene la clase CSS según la puntuación
 * @param {number} score - Puntuación (0-100)
 * @returns {string} - Nombre de la clase CSS
 */
const getScoreClass = (score) => {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
};

/**
 * Exporta los resultados a formato PDF
 * @param {Object} results - Los resultados del análisis
 * @returns {Promise<Blob>} - Blob con el PDF
 */
export const exportToPdf = async (results) => {
  // Esta función requeriría una biblioteca como jsPDF o similar
  // Por ahora, simplemente convertimos a HTML y dejamos que el navegador lo imprima como PDF
  const html = exportToHtml(results);
  return new Blob([html], { type: 'text/html' });
};

/**
 * Copia los resultados al portapapeles
 * @param {Object} results - Los resultados del análisis
 * @returns {Promise<boolean>} - true si se copió correctamente
 */
export const copyToClipboard = async (results) => {
  try {
    const text = JSON.stringify(results, null, 2);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error al copiar al portapapeles:', error);
    return false;
  }
};

export default {
  exportToJson,
  exportToHtml,
  exportToPdf,
  copyToClipboard
};
