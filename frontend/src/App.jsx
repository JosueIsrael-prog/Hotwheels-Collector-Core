import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [hotwheels, setHotwheels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [hwResponse, catResponse] = await Promise.all([
        fetch('/api/v1/hotwheels'),
        fetch('/api/v1/categories')
      ]);

      if (!hwResponse.ok || !catResponse.ok) {
        throw new Error('Error al conectar con los servicios del backend.');
      }

      const hwData = await hwResponse.json();
      const catData = await catResponse.json();

      setHotwheels(hwData);
      setCategories(catData);
    } catch (err) {
      setError(err.message || 'Error desconocido al cargar el dashboard.');
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
      setAnalysisError(err.message || 'Error al calcular las proyecciones financieras.');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const getRarityBadge = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'treasure hunt':
        return <span className="badge badge-warning">Treasure Hunt</span>;
      case 'super treasure hunt':
      case 'sth':
        return <span className="badge badge-success">Super Treasure Hunt</span>;
      case 'exclusive':
      case 'rlc':
        return <span className="badge badge-info" style={{ color: '#000' }}>Redline Club</span>;
      case 'mainline':
        return <span className="badge badge-secondary">Mainline</span>;
      default:
        return <span className="badge badge-secondary">{rarity || 'Common'}</span>;
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nombre : 'Sin Categoría';
  };

  const filteredHotwheels = selectedCategory 
    ? hotwheels.filter(hw => hw.categoryId === selectedCategory)
    : hotwheels;

  return (
    <div className="container">
      <header className="text-center mb-4">
        <h1>Dashboard Analítico Core (MSVP)</h1>
        <p className="card-text">Sistema de Proyecciones de Valor Estándar de Mercado para Hotwheels</p>
      </header>

      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0 }}>Catálogo Maestro</h2>
          {!isLoading && categories.length > 0 && (
            <div className="category-filters d-flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
              <button 
                className={`btn ${selectedCategory === null ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory(null)}
                style={{ width: 'auto' }}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{ width: 'auto' }}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
        
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

        {!isLoading && !error && filteredHotwheels.length === 0 && (
          <div className="alert alert-info">
            No se encontraron vehículos en esta categoría.
          </div>
        )}

        <div className="row">
          {filteredHotwheels.map((hw) => (
            <div className="col-md-4" key={hw.id}>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className="card-title" style={{ margin: 0 }}>{hw.nombre}</h3>
                    {getRarityBadge(hw.rareza)}
                  </div>
                  <div className="mb-3">
                    <span className="badge" style={{ backgroundColor: '#e9ecef', color: '#212529', border: '1px solid #ced4da', fontSize: '0.8rem', padding: '0.4em 0.8em' }}>
                      {getCategoryName(hw.categoryId)}
                    </span>
                  </div>
                  <div className="card-text">
                    <strong>Modelo/Año:</strong> {hw.modelo} <br/>
                    <strong>Valor Base:</strong> ${hw.precioBase}
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

      {selectedVehicle && (
        <section className="mt-4">
          <h2>Panel Analítico MSVP: {selectedVehicle.nombre}</h2>
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
                      {analysis.proyecciones && typeof analysis.proyecciones === 'object' && Object.entries(analysis.proyecciones).map(([years, projectedValue]) => {
                        const multiplier = selectedVehicle.precioBase > 0 ? (projectedValue / selectedVehicle.precioBase) : 0;
                        return (
                          <tr key={years}>
                            <td>{years} Años</td>
                            <td>x{multiplier.toFixed(2)}</td>
                            <td><strong>${projectedValue.toFixed(2)}</strong></td>
                            <td>{getRarityBadge(selectedVehicle.rareza)}</td>
                          </tr>
                        );
                      })}
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
