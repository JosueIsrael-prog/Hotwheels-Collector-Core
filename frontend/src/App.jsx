import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [hotwheels, setHotwheels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPiece, setNewPiece] = useState({
    nombre: '',
    modelo: '',
    precioBase: '',
    rareza: 'Mainline',
    categoryId: ''
  });

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
      
      if (catData.length > 0 && !newPiece.categoryId) {
        setNewPiece(prev => ({ ...prev, categoryId: catData[0].id }));
      }
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
    setActiveTab('analisis');

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newPiece,
        precioBase: parseFloat(newPiece.precioBase),
        categoryId: parseInt(newPiece.categoryId, 10)
      };

      const response = await fetch('/api/v1/hotwheels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al registrar la pieza.');

      setIsModalOpen(false);
      setNewPiece({
        nombre: '',
        modelo: '',
        precioBase: '',
        rareza: 'Mainline',
        categoryId: categories.length > 0 ? categories[0].id : ''
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const getRarityBadge = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'treasure hunt': return <span className="badge badge-warning">Treasure Hunt</span>;
      case 'super treasure hunt':
      case 'sth': return <span className="badge badge-success">Super Treasure Hunt</span>;
      case 'exclusive':
      case 'rlc': return <span className="badge badge-info" style={{ color: '#000' }}>Redline Club</span>;
      case 'mainline': return <span className="badge badge-secondary">Mainline</span>;
      default: return <span className="badge badge-secondary">{rarity || 'Common'}</span>;
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nombre : 'Sin Categoría';
  };

  const filteredHotwheels = selectedCategory 
    ? hotwheels.filter(hw => hw.categoryId === selectedCategory)
    : hotwheels;

  const renderContent = () => {
    if (activeTab === 'inventario' || activeTab === 'configuracion') {
      return (
        <div className="placeholder-view">
          <h2>🚧 Módulo en desarrollo</h2>
          <p>Esta sección estará disponible en el próximo release.</p>
        </div>
      );
    }

    if (activeTab === 'analisis') {
      if (!selectedVehicle) {
        return (
          <div className="placeholder-view">
            <h2>🔍 Seleccione un vehículo desde el catálogo en el Dashboard para generar sus proyecciones financieras.</h2>
          </div>
        );
      }

      return (
        <section>
          <header className="mb-4 d-flex justify-content-between align-items-center">
            <h2 style={{ margin: 0 }}>Panel Analítico MSVP: {selectedVehicle.nombre}</h2>
            <button className="btn btn-secondary" onClick={() => { setSelectedVehicle(null); setActiveTab('dashboard'); }}>
              Cerrar Panel
            </button>
          </header>
          
          <div className="card mb-4">
            <div className="card-body">
              {isAnalysisLoading && (
                <div className="loader-container">
                  <div className="spinner"></div><span style={{marginLeft: '10px'}}>Generando proyecciones...</span>
                </div>
              )}
              {analysisError && <div className="alert alert-danger"><strong>Error de Análisis:</strong> {analysisError}</div>}
              
              {analysis && !isAnalysisLoading && (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Periodo</th>
                        <th>Multiplicador MSVP</th>
                        <th>Valor Proyectado (USD)</th>
                        <th>Rareza Base</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.proyecciones && Object.entries(analysis.proyecciones).map(([years, projectedValue]) => {
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
                </div>
              )}
            </div>
          </div>

          {analysis?.modelosSimilares && analysis.modelosSimilares.length > 0 && (
            <>
              <h3 className="mt-4 mb-3">Modelos Similares en el Mercado</h3>
              <div className="row">
                {analysis.modelosSimilares.map(sim => (
                  <div className="col-md-4" key={sim.id}>
                    <div className="card">
                      <div className="card-body">
                        <h4 className="card-title" style={{ fontSize: '1.1rem' }}>{sim.nombre}</h4>
                        <div className="mb-2">{getRarityBadge(sim.rareza)}</div>
                        <div className="card-text mt-2 mb-3">
                          <strong>Año:</strong> {sim.modelo} <br/>
                          <strong>Valor:</strong> ${sim.precioBase}
                        </div>
                        <button 
                          className="btn btn-primary mt-auto" 
                          onClick={() => handleCalculateProjections(sim)}
                        >
                          Analizar este modelo
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      );
    }

    if (activeTab === 'dashboard') {
      return (
        <section>
          <header className="mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Dashboard Analítico Core (MSVP)</h1>
              <p className="card-text" style={{ marginTop: '0.25rem' }}>Sistema de Proyecciones de Valor Estándar de Mercado</p>
            </div>
            <button className="btn btn-success" onClick={() => setIsModalOpen(true)}>
              + Registrar Nueva Pieza
            </button>
          </header>

          <div className="d-flex justify-content-between align-items-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>Catálogo Maestro (Mercado Global)</h2>
            {!isLoading && categories.length > 0 && (
              <div className="category-filters d-flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <button 
                  className={`btn ${selectedCategory === null ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedCategory(null)}
                >Todos</button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >{cat.nombre}</button>
                ))}
              </div>
            )}
          </div>
          
          {isLoading && <div className="loader-container"><div className="spinner"></div></div>}
          {error && <div className="alert alert-danger"><strong>Error:</strong> {error}</div>}
          {!isLoading && !error && filteredHotwheels.length === 0 && (
            <div className="alert alert-info">No se encontraron vehículos en esta categoría.</div>
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
                      <span className="badge" style={{ backgroundColor: '#e9ecef', color: '#212529', border: '1px solid #ced4da', fontSize: '0.8rem' }}>
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
      );
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-title">HOTWHEELS COLLECTOR</div>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`nav-item ${activeTab === 'analisis' ? 'active' : ''}`} onClick={() => setActiveTab('analisis')}>Análisis Core</button>
          <button className={`nav-item ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => setActiveTab('inventario')}>Inventario</button>
          <button className={`nav-item ${activeTab === 'configuracion' ? 'active' : ''}`} onClick={() => setActiveTab('configuracion')}>Configuración</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Modal Creación */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-3">Registrar Nueva Pieza</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre del Vehículo</label>
                <input required type="text" className="form-control" value={newPiece.nombre} onChange={e => setNewPiece({...newPiece, nombre: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Modelo / Año</label>
                <input required type="text" className="form-control" value={newPiece.modelo} onChange={e => setNewPiece({...newPiece, modelo: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Precio Base (USD)</label>
                <input required type="number" step="0.01" className="form-control" value={newPiece.precioBase} onChange={e => setNewPiece({...newPiece, precioBase: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Rareza</label>
                <select className="form-control" value={newPiece.rareza} onChange={e => setNewPiece({...newPiece, rareza: e.target.value})}>
                  <option value="Mainline">Mainline</option>
                  <option value="STH">Super Treasure Hunt</option>
                  <option value="RLC">Redline Club</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select className="form-control" value={newPiece.categoryId} onChange={e => setNewPiece({...newPiece, categoryId: e.target.value})}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="d-flex justify-content-between mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-success">Guardar Pieza</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
