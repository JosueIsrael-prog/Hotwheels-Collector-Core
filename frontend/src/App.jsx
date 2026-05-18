import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [hotwheels, setHotwheels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    fetchHotwheels();
  }, []);

  const fetchHotwheels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/hotwheels');
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      const data = await response.json();
      setHotwheels(data);
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateProjections = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setAnalysis(null);
    setIsAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const response = await fetch(`/api/v1/hotwheels/${vehicle.id}/analisis`);
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setAnalysisError(err.message || 'Error al calcular las proyecciones.');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const getRarityBadge = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'treasure hunt':
        return <span className="badge badge-warning">Treasure Hunt</span>;
      case 'super treasure hunt':
        return <span className="badge badge-success">Super Treasure Hunt</span>;
      case 'exclusive':
        return <span className="badge badge-info">Exclusive</span>;
      default:
        return <span className="badge badge-secondary">{rarity || 'Common'}</span>;
    }
  };

  return (
    <div className="container">
      <header className="text-center mb-4">
        <h1>Dashboard Analítico Core (MSVP)</h1>
        <p className="card-text">Sistema de Proyecciones de Valor Estándar de Mercado para Hotwheels</p>
      </header>

      {/* Sección 1: Catálogo Maestro */}
      <section className="mb-4">
        <h2>Catálogo Maestro</h2>
        
        {isLoading && (
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!isLoading && !error && hotwheels.length === 0 && (
          <div className="alert alert-info">
            No se encontraron vehículos en el catálogo.
          </div>
        )}

        <div className="row">
          {hotwheels.map((hw) => (
            <div className="col-md-4" key={hw.id}>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="card-title" style={{ margin: 0 }}>{hw.modelName || hw.name}</h3>
                    {getRarityBadge(hw.rarity)}
                  </div>
                  <div className="card-text">
                    <strong>Año:</strong> {hw.year} <br/>
                    <strong>Serie:</strong> {hw.series} <br/>
                    <strong>Valor Base:</strong> ${hw.baseValue}
                  </div>
                  <button 
                    className="btn btn-primary mt-auto"
                    onClick={() => handleCalculateProjections(hw)}
                    disabled={isAnalysisLoading && selectedVehicle?.id === hw.id}
                  >
                    {isAnalysisLoading && selectedVehicle?.id === hw.id ? 'Calculando...' : 'Calcular Proyecciones MSVP'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección 2 y 3: Panel Analítico MSVP y Resultados */}
      {selectedVehicle && (
        <section className="mt-4">
          <h2>Panel Analítico MSVP: {selectedVehicle.modelName || selectedVehicle.name}</h2>
          <div className="card">
            <div className="card-body">
              {isAnalysisLoading && (
                <div className="loader-container">
                  <div className="spinner"></div>
                  <span style={{marginLeft: '10px'}}>Generando proyecciones a 1, 5, 10 y 20 años...</span>
                </div>
              )}

              {analysisError && (
                <div className="alert alert-danger">
                  <strong>Error de Análisis:</strong> {analysisError}
                </div>
              )}

              {analysis && !isAnalysisLoading && (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Periodo de Proyección</th>
                        <th>Multiplicador MSVP</th>
                        <th>Valor Proyectado (USD)</th>
                        <th>Riesgo / Rareza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* En caso de que el backend devuelva las proyecciones como array 'projections' */}
                      {analysis.projections?.map((proj, index) => (
                        <tr key={index}>
                          <td>{proj.years} Año{proj.years > 1 ? 's' : ''}</td>
                          <td>x{proj.multiplier.toFixed(2)}</td>
                          <td><strong>${proj.projectedValue.toFixed(2)}</strong></td>
                          <td>{getRarityBadge(selectedVehicle.rarity)}</td>
                        </tr>
                      ))}
                      {/* En caso de que el backend devuelva las proyecciones directamente como un array en analysis */}
                      {Array.isArray(analysis) && analysis.map((proj, index) => (
                        <tr key={index}>
                          <td>{proj.years} Año{proj.years > 1 ? 's' : ''}</td>
                          <td>x{proj.multiplier?.toFixed(2) || (proj.multiplier)}</td>
                          <td><strong>${proj.projectedValue?.toFixed(2) || (proj.projectedValue)}</strong></td>
                          <td>{getRarityBadge(selectedVehicle.rarity)}</td>
                        </tr>
                      ))}
                      {/* Si el backend devuelve un objeto con fields individuales por año */}
                      {!analysis.projections && !Array.isArray(analysis) && analysis.year1 && (
                         <>
                           <tr>
                             <td>1 Año</td>
                             <td>x{analysis.year1.multiplier?.toFixed(2)}</td>
                             <td><strong>${analysis.year1.projectedValue?.toFixed(2)}</strong></td>
                             <td>{getRarityBadge(selectedVehicle.rarity)}</td>
                           </tr>
                           <tr>
                             <td>5 Años</td>
                             <td>x{analysis.year5.multiplier?.toFixed(2)}</td>
                             <td><strong>${analysis.year5.projectedValue?.toFixed(2)}</strong></td>
                             <td>{getRarityBadge(selectedVehicle.rarity)}</td>
                           </tr>
                           <tr>
                             <td>10 Años</td>
                             <td>x{analysis.year10.multiplier?.toFixed(2)}</td>
                             <td><strong>${analysis.year10.projectedValue?.toFixed(2)}</strong></td>
                             <td>{getRarityBadge(selectedVehicle.rarity)}</td>
                           </tr>
                           <tr>
                             <td>20 Años</td>
                             <td>x{analysis.year20.multiplier?.toFixed(2)}</td>
                             <td><strong>${analysis.year20.projectedValue?.toFixed(2)}</strong></td>
                             <td>{getRarityBadge(selectedVehicle.rarity)}</td>
                           </tr>
                         </>
                      )}
                    </tbody>
                  </table>
                  <div className="mt-4">
                    <button className="btn btn-secondary" onClick={() => setSelectedVehicle(null)} style={{width: 'auto'}}>Cerrar Panel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
