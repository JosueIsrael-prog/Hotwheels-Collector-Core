import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRol, setRegRol] = useState('Coleccionista');
  const [regError, setRegError] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [hotwheels, setHotwheels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [factores, setFactores] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPiece, setNewPiece] = useState({ nombre: '', modelo: '', precioBase: '', rareza: 'Mainline', categoryId: '' });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Credenciales inválidas.');
      }
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setActiveTab('dashboard');
    setSelectedVehicle(null);
    setAnalysis(null);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [hwRes, catRes, facRes] = await Promise.all([
        fetch('/api/v1/hotwheels'),
        fetch('/api/v1/categories'),
        fetch('/api/v1/factoresexternos')
      ]);
      if (!hwRes.ok || !catRes.ok || !facRes.ok) throw new Error('Error al conectar con el backend.');
      setHotwheels(await hwRes.json());
      setCategories(await catRes.json());
      setFactores(await facRes.json());
    } catch (err) {
      setError(err.message);
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
      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
      setAnalysis(await response.json());
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newPiece, precioBase: parseFloat(newPiece.precioBase), categoryId: parseInt(newPiece.categoryId, 10) };
      const response = await fetch('/api/v1/hotwheels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Error al registrar la pieza.');
      setIsModalOpen(false);
      setNewPiece({ nombre: '', modelo: '', precioBase: '', rareza: 'Mainline', categoryId: categories.length > 0 ? categories[0].id : '' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const getRarityBadge = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'sth': return <span className="badge badge-success">STH</span>;
      case 'rlc': return <span className="badge badge-info">RLC</span>;
      case 'mainline': return <span className="badge badge-secondary">Mainline</span>;
      default: return <span className="badge badge-secondary">{rarity || '—'}</span>;
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.nombre : '—';
  };

  const filteredHotwheels = selectedCategory ? hotwheels.filter(hw => hw.categoryId === selectedCategory) : hotwheels;

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    setRegSuccess(null);
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: regName, email: regEmail, password: regPassword, rol: regRol })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error en el registro.');
      setRegSuccess('Cuenta creada exitosamente. Inicia sesión.');
      setRegName(''); setRegEmail(''); setRegPassword(''); setRegRol('Coleccionista');
      setTimeout(() => { setIsRegistering(false); setRegSuccess(null); }, 1500);
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h2>Hot Wheels Analytics</h2>
          <p>{isRegistering ? 'Crea una cuenta para acceder al sistema.' : 'Ingresa tus credenciales para acceder al sistema.'}</p>

          {!isRegistering ? (
            <>
              {loginError && <div className="alert alert-danger">{loginError}</div>}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" required className="form-control" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input type="password" required className="form-control" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-block mt-3" disabled={loginLoading}>
                  {loginLoading ? 'Verificando...' : 'Iniciar Sesión'}
                </button>
              </form>
              <p style={{textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>¿No tienes cuenta? </span>
                <span style={{color: 'var(--accent-blue)', cursor: 'pointer'}} onClick={() => { setIsRegistering(true); setLoginError(null); }}>Regístrate aquí</span>
              </p>
            </>
          ) : (
            <>
              {regError && <div className="alert alert-danger">{regError}</div>}
              {regSuccess && <div className="alert alert-info">{regSuccess}</div>}
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input type="text" required className="form-control" value={regName} onChange={e => setRegName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" required className="form-control" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input type="password" required className="form-control" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select className="form-control" value={regRol} onChange={e => setRegRol(e.target.value)}>
                    <option value="Coleccionista">Coleccionista</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-success btn-block mt-3" disabled={regLoading}>
                  {regLoading ? 'Registrando...' : 'Crear Cuenta'}
                </button>
              </form>
              <p style={{textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>¿Ya tienes cuenta? </span>
                <span style={{color: 'var(--accent-blue)', cursor: 'pointer'}} onClick={() => { setIsRegistering(false); setRegError(null); setRegSuccess(null); }}>Inicia sesión</span>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const renderAdminPanel = () => (
    <section>
      <div className="section-header">
        <div>
          <h1>Panel de Administración</h1>
          <div className="section-subtitle">Factores Externos Macroeconómicos activos en el MSVP</div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Factor</th>
              <th>Impacto (%)</th>
            </tr>
          </thead>
          <tbody>
            {factores.map(f => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.nombreFactor}</td>
                <td>{(f.impactoPorcentaje * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderAnalisis = () => {
    if (!selectedVehicle) {
      return (
        <div className="placeholder-view">
          <h2>Seleccione un vehículo desde el Dashboard para generar proyecciones.</h2>
        </div>
      );
    }

    return (
      <section>
        <div className="section-header">
          <h2>Análisis MSVP: {selectedVehicle.nombre}</h2>
          <button className="btn btn-secondary" onClick={() => { setSelectedVehicle(null); setActiveTab('dashboard'); }}>Cerrar Panel</button>
        </div>

        {isAnalysisLoading && <div className="loader-container"><div className="spinner"></div><span style={{marginLeft: '8px'}}>Procesando matriz de factores...</span></div>}
        {analysisError && <div className="alert alert-danger">{analysisError}</div>}

        {analysis && !isAnalysisLoading && (
          <>
            <div className="card mb-4">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Periodo</th>
                        <th>Valor Base</th>
                        <th>Ajuste Factores</th>
                        <th>Valor Final</th>
                        <th>Multiplicador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.proyecciones?.map(p => (
                        <tr key={p.anio}>
                          <td>{p.anio} {p.anio === 1 ? 'Año' : 'Años'}</td>
                          <td>${p.valorBase.toFixed(2)}</td>
                          <td style={{color: 'var(--accent-green)'}}>+${p.ajusteFactores.toFixed(2)}</td>
                          <td style={{fontWeight: 600}}>${p.valorFinal.toFixed(2)}</td>
                          <td>x{p.multiplicador.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {analysis.proyecciones?.length > 0 && (
              <div className="card mb-4">
                <div className="card-body">
                  <h3 style={{marginBottom: '1rem'}}>Desglose de Factores Externos (Proyección a {analysis.proyecciones[analysis.proyecciones.length - 1].anio} años)</h3>
                  {analysis.proyecciones[analysis.proyecciones.length - 1].factores?.map((f, i) => (
                    <div className="factor-row" key={i}>
                      <span className="factor-name">{f.nombreFactor}</span>
                      <span className="factor-pct">{(f.porcentaje * 100).toFixed(0)}%</span>
                      <span className="factor-val">+${f.incrementoAbsoluto.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.modelosSimilares?.length > 0 && (
              <>
                <h3 className="mt-4 mb-3">Modelos Similares</h3>
                <div className="row">
                  {analysis.modelosSimilares.map(sim => (
                    <div className="col-md-4" key={sim.id}>
                      <div className="card">
                        <div className="card-body">
                          <h4 className="card-title">{sim.nombre}</h4>
                          <div className="mb-2">{getRarityBadge(sim.rareza)}</div>
                          <div className="card-text">Modelo: {sim.modelo} — ${sim.precioBase}</div>
                          <button className="btn btn-primary" onClick={() => handleCalculateProjections(sim)}>Analizar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    );
  };

  const renderDashboard = () => (
    <section>
      <div className="section-header">
        <div>
          <h1>Dashboard Analítico (MSVP)</h1>
          <div className="section-subtitle">Catálogo Maestro — Mercado Global</div>
        </div>
        <button className="btn btn-success" onClick={() => { setIsModalOpen(true); if (categories.length > 0 && !newPiece.categoryId) setNewPiece(prev => ({...prev, categoryId: categories[0].id})); }}>+ Registrar Pieza</button>
      </div>

      {!isLoading && categories.length > 0 && (
        <div className="d-flex mb-4" style={{ flexWrap: 'wrap', gap: '0.4rem' }}>
          <button className={`btn ${selectedCategory === null ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCategory(null)}>Todos</button>
          {categories.map(cat => (
            <button key={cat.id} className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCategory(cat.id)}>{cat.nombre}</button>
          ))}
        </div>
      )}

      {isLoading && <div className="loader-container"><div className="spinner"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!isLoading && !error && filteredHotwheels.length === 0 && <div className="alert alert-info">No se encontraron vehículos en esta categoría.</div>}

      <div className="row">
        {filteredHotwheels.map(hw => (
          <div className="col-md-4" key={hw.id}>
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="card-title" style={{margin: 0}}>{hw.nombre}</h3>
                  {getRarityBadge(hw.rareza)}
                </div>
                <div className="mb-2"><span className="badge badge-category">{getCategoryName(hw.categoryId)}</span></div>
                <div className="card-text">Modelo: {hw.modelo} — <strong>${hw.precioBase}</strong></div>
                <button className="btn btn-primary" onClick={() => handleCalculateProjections(hw)} disabled={isAnalysisLoading && selectedVehicle?.id === hw.id}>
                  {isAnalysisLoading && selectedVehicle?.id === hw.id ? 'Calculando...' : 'Proyecciones MSVP'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderContent = () => {
    if (activeTab === 'admin' && user.rol === 'Administrador') return renderAdminPanel();
    if (activeTab === 'analisis') return renderAnalisis();
    if (activeTab === 'inventario' || activeTab === 'configuracion') return <div className="placeholder-view"><h2>Módulo en desarrollo</h2></div>;
    return renderDashboard();
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-title">HW Analytics</div>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user.nombre}</div>
          <div className="sidebar-user-role">{user.rol}</div>
        </div>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`nav-item ${activeTab === 'analisis' ? 'active' : ''}`} onClick={() => setActiveTab('analisis')}>Análisis Core</button>
          {user.rol === 'Administrador' && (
            <button className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>Factores Externos</button>
          )}
          <button className={`nav-item ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => setActiveTab('inventario')}>Inventario</button>
          <div className="nav-divider"></div>
          <button className="nav-item logout" onClick={handleLogout}>Cerrar Sesión</button>
        </nav>
      </aside>
      <main className="main-content">{renderContent()}</main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-3">Registrar Nueva Pieza</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group"><label className="form-label">Nombre</label><input required type="text" className="form-control" value={newPiece.nombre} onChange={e => setNewPiece({...newPiece, nombre: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Modelo / Año</label><input required type="text" className="form-control" value={newPiece.modelo} onChange={e => setNewPiece({...newPiece, modelo: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Precio Base (USD)</label><input required type="number" step="0.01" className="form-control" value={newPiece.precioBase} onChange={e => setNewPiece({...newPiece, precioBase: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Rareza</label>
                <select className="form-control" value={newPiece.rareza} onChange={e => setNewPiece({...newPiece, rareza: e.target.value})}>
                  <option value="Mainline">Mainline</option><option value="STH">Super Treasure Hunt</option><option value="RLC">Redline Club</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Categoría</label>
                <select className="form-control" value={newPiece.categoryId} onChange={e => setNewPiece({...newPiece, categoryId: e.target.value})}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="d-flex justify-content-between mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-success">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
