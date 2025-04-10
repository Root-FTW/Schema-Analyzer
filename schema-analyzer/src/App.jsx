import { useState } from 'react'
import { Container, Navbar, Alert } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

// Components
import UrlForm from './components/UrlForm'
import ResultDisplay from './components/ResultDisplay'

// Services
import { extractSchemaFromUrl } from './services/schemaService'

function App() {
  const [analysisResult, setAnalysisResult] = useState(null)
  const [url, setUrl] = useState('')
  const [schemaType, setSchemaType] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState('light')

  // Toggle light/dark theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.body.setAttribute('data-theme', newTheme)
  }

  const handleAnalyze = async ({ url, schemaType }) => {
    setLoading(true)
    setError(null)
    setUrl(url)
    setSchemaType(schemaType)

    try {
      const result = await extractSchemaFromUrl(url)

      setAnalysisResult({
        url,
        expectedType: schemaType,
        schemas: result.schemas,
        formats: result.formats,
        stats: result.stats
      })

      if (result.schemas.length === 0) {
        setError('No Schema.org data found in the provided URL')
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
      setAnalysisResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`app-container ${theme}`}>
      <Navbar bg={theme} variant={theme} expand="lg" className="navbar-modern">
        <Container>
          <Navbar.Brand className="brand">Schema.org Analyzer</Navbar.Brand>
          <div className="theme-toggle">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </Container>
      </Navbar>

      <Container className="mt-4 main-content">
        <h1 className="app-title">Schema.org Analyzer</h1>
        <p className="app-description">
          Enter a URL and select the Schema.org type you expect to find.
          The tool will analyze the page and verify if the implementation is correct.
        </p>

        <UrlForm onAnalyze={handleAnalyze} />

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Analyzing URL... Please wait.</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mt-4 error-alert">
            {error}
          </Alert>
        )}

        {!loading && !error && analysisResult && (
          <ResultDisplay
            analysisResult={analysisResult}
          />
        )}
      </Container>

      <footer className="app-footer">
        <Container>
          <p>© {new Date().getFullYear()} Schema.org Analyzer - Tool for analyzing and validating Schema.org implementations</p>
        </Container>
      </footer>
    </div>
  )
}

export default App
