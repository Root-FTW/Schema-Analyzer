import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

const UrlForm = ({ onAnalyze }) => {
  const [url, setUrl] = useState('');
  const [schemaType, setSchemaType] = useState('Article');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    onAnalyze({ url, schemaType });
  };

  // List of common Schema.org types
  const schemaTypes = [
    'Article',
    'NewsArticle',
    'BlogPosting',
    'Product',
    'Review',
    'LocalBusiness',
    'Restaurant',
    'Movie',
    'Event',
    'Person',
    'Organization',
    'WebPage',
    'FAQPage',
    'Recipe',
    'HowTo'
  ];

  return (
    <div className="form-container fade-in">
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group controlId="url">
              <Form.Label>URL to analyze</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="input-modern"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="schemaType">
              <Form.Label>Schema Type</Form.Label>
              <Form.Select
                value={schemaType}
                onChange={(e) => setSchemaType(e.target.value)}
                className="select-modern"
              >
                {schemaTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
          className="btn-modern"
        >
          {isLoading ? (
            <>
              <span className="spinner-sm"></span>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span className="icon-search">🔍</span>
              <span>Analyze Schema</span>
            </>
          )}
        </Button>
      </Form>
    </div>
  );
};

export default UrlForm;
