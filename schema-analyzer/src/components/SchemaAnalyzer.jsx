import { useState } from 'react';
import { Accordion, Badge, Button } from 'react-bootstrap';
import validationService from '../services/validationService';

const SchemaAnalyzer = ({ schema, validationResult, expectedType, collapsed = false }) => {
  const [showSuggestions, setShowSuggestions] = useState(!collapsed);
  const [showCorrectedCode, setShowCorrectedCode] = useState(false);

  if (!schema) {
    return (
      <div className="analysis-section">
        <p>No Schema.org data found to analyze.</p>
      </div>
    );
  }

  // If no validation result is provided, generate one
  const validation = validationResult || validationService.validateSchema(schema, expectedType);

  // Generate corrected code
  const correctedCode = validationService.generateCorrectedExample(schema, expectedType);

  // Determine style classes based on scores
  const getScoreClass = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  // Icons for property states
  const getPropertyIcon = (present) => {
    return present ? '✅' : '❌';
  };

  // Icons for suggestions
  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'suggestion': return '💡';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="analysis-section fade-in">
      {collapsed ? (
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <div className="d-flex align-items-center w-100 justify-content-between">
                <span>
                  <Badge
                    bg={validation.type.matches ? 'success' : 'danger'}
                    className="me-2"
                  >
                    {validation.type.detected || 'No type'}
                  </Badge>
                  Score: <span className={`text-${getScoreClass(validation.overallScore)}`}>{validation.overallScore}%</span>
                </span>
                <span className="text-muted small">
                  {validation.formatValidation.format} |
                  {validation.requiredProperties.missing.length > 0 ?
                    <span className="text-danger">Missing required properties</span> :
                    <span className="text-success">All required properties present</span>
                  }
                </span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              {renderAnalysisContent()}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      ) : (
        renderAnalysisContent()
      )}
    </div>
  );

  function renderAnalysisContent() {
    return (
      <>
        <div className="mb-4">
          <h4 className="analysis-title">
            <span className="me-2">🔍</span>
            Schema.org Analysis
          </h4>

          <div className="d-flex align-items-center mb-3">
            <Badge
              bg={validation.type.matches ? 'success' : 'danger'}
              className="me-2"
            >
              Detected type: {validation.type.detected || 'No type'}
            </Badge>

            {validation.type.expected && (
              <Badge
                bg="info"
                className="me-2"
              >
                Expected type: {validation.type.expected}
              </Badge>
            )}

            <Badge
              bg={validation.formatValidation.isPreferred ? 'success' : 'warning'}
            >
              Format: {validation.formatValidation.format}
            </Badge>
          </div>

          <div className="score-container">
            <div className="score-label">
              <span>Overall score:</span>
              <span className={`text-${getScoreClass(validation.overallScore)}`}>
                {validation.overallScore}%
              </span>
            </div>
            <div className="score-bar">
              <div
                className={`score-fill ${getScoreClass(validation.overallScore)}`}
                style={{ width: `${validation.overallScore}%` }}
              ></div>
            </div>
          </div>

          <div className="score-container">
            <div className="score-label">
              <span>Required properties:</span>
              <span className={`text-${getScoreClass(validation.requiredProperties.score)}`}>
                {validation.requiredProperties.score}%
              </span>
            </div>
            <div className="score-bar">
              <div
                className={`score-fill ${getScoreClass(validation.requiredProperties.score)}`}
                style={{ width: `${validation.requiredProperties.score}%` }}
              ></div>
            </div>
          </div>

          <div className="score-container">
            <div className="score-label">
              <span>Recommended properties:</span>
              <span className={`text-${getScoreClass(validation.recommendedProperties.score)}`}>
                {validation.recommendedProperties.score}%
              </span>
            </div>
            <div className="score-bar">
              <div
                className={`score-fill ${getScoreClass(validation.recommendedProperties.score)}`}
                style={{ width: `${validation.recommendedProperties.score}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h5 className="analysis-title">
            <span className="me-2">📌</span>
            Required Properties
          </h5>

          {validation.requiredProperties.present.length === 0 && validation.requiredProperties.missing.length === 0 ? (
            <p>No required properties defined for this type.</p>
          ) : (
            <ul className="property-list">
              {validation.requiredProperties.present.map((prop, index) => (
                <li key={`req-present-${index}`} className="property-item success">
                  <span className="property-icon">{getPropertyIcon(true)}</span>
                  <span className="property-name">{prop}</span>
                  <span>Present</span>
                </li>
              ))}

              {validation.requiredProperties.missing.map((prop, index) => (
                <li key={`req-missing-${index}`} className="property-item danger">
                  <span className="property-icon">{getPropertyIcon(false)}</span>
                  <span className="property-name">{prop}</span>
                  <span>Missing</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <h5 className="analysis-title">
            <span className="me-2">💫</span>
            Recommended Properties
          </h5>

          {validation.recommendedProperties.present.length === 0 && validation.recommendedProperties.missing.length === 0 ? (
            <p>No recommended properties defined for this type.</p>
          ) : (
            <ul className="property-list">
              {validation.recommendedProperties.present.map((prop, index) => (
                <li key={`rec-present-${index}`} className="property-item success">
                  <span className="property-icon">{getPropertyIcon(true)}</span>
                  <span className="property-name">{prop}</span>
                  <span>Present</span>
                </li>
              ))}

              {validation.recommendedProperties.missing.map((prop, index) => (
                <li key={`rec-missing-${index}`} className="property-item warning">
                  <span className="property-icon">⚠️</span>
                  <span className="property-name">{prop}</span>
                  <span>Recommended</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {validation.suggestions.length > 0 && (
          <div className="suggestion-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="analysis-title mb-0">
                <span className="me-2">💡</span>
                Improvement Suggestions
              </h5>

              <Button
                variant="link"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="p-0"
              >
                {showSuggestions ? 'Hide' : 'Show'}
              </Button>
            </div>

            {showSuggestions && (
              <div>
                {validation.suggestions.map((suggestion, index) => (
                  <div key={index} className={`suggestion-item ${suggestion.type}`}>
                    <div className="suggestion-title">
                      <span className="me-2">{getSuggestionIcon(suggestion.type)}</span>
                      {suggestion.message}
                    </div>

                    {suggestion.description && (
                      <p className="suggestion-description">{suggestion.description}</p>
                    )}

                    {suggestion.example && (
                      <pre className="code-example">{suggestion.example}</pre>
                    )}

                    {suggestion.link && (
                      <a href={suggestion.link} target="_blank" rel="noopener noreferrer">
                        More information
                      </a>
                    )}
                  </div>
                ))}

                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowCorrectedCode(!showCorrectedCode)}
                  >
                    {showCorrectedCode ? 'Hide corrected code' : 'Show corrected code'}
                  </Button>

                  {showCorrectedCode && correctedCode && (
                    <pre className="code-example mt-3">{correctedCode}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  }
};

export default SchemaAnalyzer;
