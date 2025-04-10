import { useState } from 'react';
import { Tab, Tabs, Button, Card, ButtonGroup } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SchemaAnalyzer from './SchemaAnalyzer';
import validationService from '../services/validationService';
import exportService from '../services/exportService';

const ResultDisplay = ({ analysisResult }) => {
  const { url, expectedType, schemas, formats, stats } = analysisResult;
  const [activeTab, setActiveTab] = useState('analysis');
  const [validationResults, setValidationResults] = useState(() => {
    // Validate all found schemas
    return schemas.map(schema => validationService.validateSchema(schema, expectedType));
  });
  const [selectedSchemaIndex, setSelectedSchemaIndex] = useState(0);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  if (!schemas || schemas.length === 0) {
    return (
      <div className="result-container fade-in">
        <div className="result-header">
          <h4 className="result-title">No Schema.org data found</h4>
          <p className="result-subtitle">
            The provided URL does not contain Schema.org data or it could not be extracted correctly.
          </p>
        </div>
      </div>
    );
  }

  // Find the most relevant schema to show first
  const mostRelevantSchemaIndex = findMostRelevantSchemaIndex(schemas, expectedType);

  // Handle results export
  const handleExport = async (format) => {
    const exportData = {
      url,
      expectedType,
      schemas,
      formats,
      stats,
      validationResults
    };

    switch (format) {
      case 'json':
        const jsonData = exportService.exportToJson(exportData);
        downloadFile(jsonData, 'schema-analysis.json', 'application/json');
        break;
      case 'html':
        const htmlData = exportService.exportToHtml(exportData);
        downloadFile(htmlData, 'schema-analysis.html', 'text/html');
        break;
      case 'clipboard':
        await exportService.copyToClipboard(exportData);
        alert('Results copied to clipboard');
        break;
      default:
        console.error('Unsupported export format:', format);
    }
  };

  // Function to download a file
  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="result-container fade-in">
      <div className="result-header">
        <h4 className="result-title">Results for: {url}</h4>
        <p className="result-subtitle">
          Found {schemas.length} Schema.org structures.
          {expectedType && ` Expected type: ${expectedType}`}
        </p>

        {formats && formats.length > 0 && (
          <div className="format-badges">
            {formats.map(format => (
              <span key={format} className={`format-badge ${format}`}>
                {format === 'json-ld' ? 'JSON-LD' :
                 format === 'microdata' ? 'Microdata' :
                 format === 'rdfa' ? 'RDFa' : format}
                {stats && stats[format.replace('-', '')] > 1 && ` (${stats[format.replace('-', '')]})`}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="result-body">
        <Tabs
          activeKey={activeTab}
          onSelect={setActiveTab}
          className="mb-4"
        >
          <Tab eventKey="analysis" title="Analysis">
            {schemas.length > 1 ? (
              <div>
                <p>Analyzing the most relevant structure (#{mostRelevantSchemaIndex + 1}).</p>
                <SchemaAnalyzer
                  schema={schemas[mostRelevantSchemaIndex]}
                  validationResult={validationResults[mostRelevantSchemaIndex]}
                  expectedType={expectedType}
                />
              </div>
            ) : (
              <SchemaAnalyzer
                schema={schemas[0]}
                validationResult={validationResults[0]}
                expectedType={expectedType}
              />
            )}
          </Tab>

          <Tab eventKey="all" title="All Structures">
            {schemas.map((schema, index) => (
              <div key={index} className="mb-4">
                <h5>Structure #{index + 1}: {schema['@type'] || 'No type'}</h5>
                <SchemaAnalyzer
                  schema={schema}
                  validationResult={validationResults[index]}
                  expectedType={expectedType}
                  collapsed={true}
                />
              </div>
            ))}
          </Tab>

          <Tab eventKey="raw" title="Raw Data">
            <div className="raw-data-container">
              <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center raw-data-header">
                  <div className="schema-navigation">
                    <span className="me-2">Schema {selectedSchemaIndex + 1} of {schemas.length}</span>
                    {schemas.length > 1 && (
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-secondary"
                          disabled={selectedSchemaIndex === 0}
                          onClick={() => setSelectedSchemaIndex(prev => Math.max(0, prev - 1))}
                        >
                          ← Prev
                        </Button>
                        <Button
                          variant="outline-secondary"
                          disabled={selectedSchemaIndex === schemas.length - 1}
                          onClick={() => setSelectedSchemaIndex(prev => Math.min(schemas.length - 1, prev + 1))}
                        >
                          Next →
                        </Button>
                      </ButtonGroup>
                    )}
                  </div>
                  <div className="theme-controls">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => setIsDarkTheme(!isDarkTheme)}
                    >
                      {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(schemas[selectedSchemaIndex], null, 2));
                        setShowCopiedMessage(true);
                        setTimeout(() => setShowCopiedMessage(false), 2000);
                      }}
                    >
                      {showCopiedMessage ? '✓ Copied!' : '📋 Copy'}
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="syntax-highlighter-container">
                    <SyntaxHighlighter
                      language="json"
                      style={isDarkTheme ? vscDarkPlus : vs}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0 0 8px 8px',
                        maxHeight: '500px',
                        fontSize: '0.9rem'
                      }}
                    >
                      {JSON.stringify(schemas[selectedSchemaIndex], null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </Card.Body>
              </Card>

              {schemas.length > 1 && (
                <div className="mt-3">
                  <h5>All Schemas</h5>
                  <Card>
                    <Card.Body className="p-0">
                      <div className="syntax-highlighter-container">
                        <SyntaxHighlighter
                          language="json"
                          style={isDarkTheme ? vscDarkPlus : vs}
                          customStyle={{
                            margin: 0,
                            borderRadius: '0 0 8px 8px',
                            maxHeight: '500px',
                            fontSize: '0.9rem'
                          }}
                        >
                          {JSON.stringify(schemas, null, 2)}
                        </SyntaxHighlighter>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </div>
          </Tab>

          <Tab eventKey="export" title="Export">
            <div className="export-container">
              <Button
                variant="outline-primary"
                onClick={() => handleExport('json')}
                className="export-btn"
              >
                <span>📄</span> Export as JSON
              </Button>

              <Button
                variant="outline-primary"
                onClick={() => handleExport('html')}
                className="export-btn"
              >
                <span>📝</span> Export as HTML
              </Button>

              <Button
                variant="outline-primary"
                onClick={() => handleExport('clipboard')}
                className="export-btn"
              >
                <span>📋</span> Copy to clipboard
              </Button>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

// Function to find the index of the most relevant schema based on the selected type
const findMostRelevantSchemaIndex = (schemas, expectedType) => {
  if (!expectedType) return 0;

  // First look for an exact match with the expected type
  const exactMatchIndex = schemas.findIndex(schema => {
    const schemaType = schema['@type'];
    if (!schemaType) return false;

    if (Array.isArray(schemaType)) {
      return schemaType.some(type => {
        if (type.includes('/')) {
          const parts = type.split('/');
          return parts[parts.length - 1] === expectedType;
        }
        return type === expectedType;
      });
    } else {
      if (schemaType.includes('/')) {
        const parts = schemaType.split('/');
        return parts[parts.length - 1] === expectedType;
      }
      return schemaType === expectedType;
    }
  });

  return exactMatchIndex >= 0 ? exactMatchIndex : 0;
};

export default ResultDisplay;
