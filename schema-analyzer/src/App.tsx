import { useState } from 'react'
import { Container, Navbar, Alert } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

// Componentes
import UrlForm from './components/UrlForm'
import ResultDisplay from './components/ResultDisplay'

// Servicios
import { extractSchemaFromUrl } from './services/schemaService'

// Definición de tipos
interface AnalyzeParams {
  url: string;
  schemaType: string;
}

function App() {
  const [schemaData, setSchemaData] = useState<any[]>([])
  const [url, setUrl] = useState('')
  const [schemaType, setSchemaType] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async ({ url, schemaType }: AnalyzeParams) => {
    setLoading(true)
    setError(null)
    setUrl(url)
    setSchemaType(schemaType)

    try {
      const data = await extractSchemaFromUrl(url)
      setSchemaData(data)
      if (data.length === 0) {
        setError('No se encontraron datos de Schema.org en la URL proporcionada')
      }
    } catch (err: any) {
      setError(`Error: ${err.message || 'Desconocido'}`)
      setSchemaData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Schema.org Analyzer</Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h1>Analizador de Schema.org</h1>
        <p className="lead">
          Ingresa una URL y selecciona el tipo de Schema.org que esperas encontrar.
          La herramienta analizará la página y verificará si la implementación es correcta.
        </p>

        <UrlForm onAnalyze={handleAnalyze} />

        {loading && (
          <Alert variant="info" className="mt-4">
            Analizando la URL... Por favor espera.
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mt-4">
            {error}
          </Alert>
        )}

        {!loading && !error && schemaData && (
          <ResultDisplay
            schemaData={schemaData}
            url={url}
            schemaType={schemaType}
          />
        )}
      </Container>
    </>
  )
}

export default App
