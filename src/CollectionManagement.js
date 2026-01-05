import React, { useState, useEffect, useCallback } from 'react';

function CollectionManagement() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [currentCollection, setCurrentCollection] = useState(null);

    const [loggedInUser, setLoggedInUser] = useState(null); // Estado para el usuario logeado

    const [formData, setFormData] = useState({
        dni: '', fecha: '', pago: '', tipo: '', det_tipo: ''
    });
    const [clientBalance, setClientBalance] = useState(null); // Para almacenar el saldo del cliente

    const API_URL = 'http://127.0.0.1:8000'; // Asegúrate de que esta URL sea la correcta para tu backend

    // Cargar información del usuario logeado al inicio
    // useEffect(() => {
    //    const user = localStorage.getItem('loggedInUser');
    //    if (user) {
    //        setLoggedInUser(JSON.parse(user));
    //    } else {
    //        setError("No hay información del usuario logeado. Por favor, inicie sesión.");
    //    }
    //}, []);

    const USER_TYPE_LABELS = {
        E: 'Efectivo',
        T: 'Tarjeta',
        P: 'Plin',
        Y: 'Yape',
        R: 'Transferencia'
    };
    useEffect(() => {
            const user = localStorage.getItem('loggedInUser');
            if (user) {
                setLoggedInUser(JSON.parse(user));
            } else {
                setError("No hay información del usuario logeado. Por favor, inicie sesión.");
            }
        }, []);
    
    // --- Funciones de Interacción con la API ---

    const fetchCollections = useCallback(async () => {
        setLoading(true);
        setError('');
        if (!loggedInUser || !loggedInUser.id) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/payments/`, {
                headers: {
                    'User-Id-Header': loggedInUser.id // Pasar el usuario logeado en el header
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al obtener cobranzas');
            }
            const data = await response.json();
            setCollections(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [loggedInUser, API_URL]);

    const fetchClientBalance = useCallback(async (dni) => {
        setError('');
        if (!dni || !loggedInUser || !loggedInUser.id) {
            setClientBalance(null);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/payments/balance/${dni}`, {
                headers: {
                    'User-Id-Header': loggedInUser.id
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al obtener saldo del cliente');
            }
            const data = await response.json();
            setClientBalance(data);
        } catch (err) {
            setError(err.message);
            setClientBalance(null); // Limpiar saldo si hay error
        }
    }, [loggedInUser, API_URL]);

    const handleCreateCollection = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        if (!loggedInUser || !loggedInUser.id) {
            setError("Error: Usuario no autenticado para crear la cobranza.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/payments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id-Header': loggedInUser.id
                },
                body: JSON.stringify({
                    ...formData,
                    pago: parseFloat(formData.pago),
                    fecha: new Date(formData.fecha).toISOString().split('T')[0]
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al crear cobranza');
            }
            setSuccess('Cobranza creada exitosamente');
            setFormData({ dni: '', fecha: '', pago: '', tipo: '', det_tipo: '' });
            setShowForm(false);
            fetchCollections();
            if (clientBalance && clientBalance.dni === formData.dni) { // Refrescar saldo si aplica
                fetchClientBalance(formData.dni);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateCollection = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        if (!currentCollection || !loggedInUser || !loggedInUser.usuario) return;

        try {
            const response = await fetch(`${API_URL}/payments/${currentCollection.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id-Header': loggedInUser.id
                },
                body: JSON.stringify({
                    ...formData,
                    pago: parseFloat(formData.pago),
                    fecha: new Date(formData.fecha).toISOString().split('T')[0]
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al actualizar cobranza');
            }
            setSuccess('Cobranza actualizada exitosamente');
            setFormData({ dni: '', fecha: '', pago: '', tipo: '', det_tipo: '' });
            setCurrentCollection(null);
            setShowForm(false);
            fetchCollections();
            if (clientBalance && clientBalance.dni === formData.dni) { // Refrescar saldo si aplica
                fetchClientBalance(formData.dni);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCollection = async (collectionId) => {
        setError('');
        setSuccess('');
        if (!window.confirm('¿Está seguro de que desea eliminar esta cobranza?')) {
            return;
        }
        if (!loggedInUser || !loggedInUser.usuario) {
            setError("Error: Usuario no autenticado para eliminar la cobranza.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/payments/${collectionId}`, {
                method: 'DELETE',
                headers: {
                    'User-Id-Header': loggedInUser.id
                }
            });
            if (response.status === 204) {
                 setSuccess('Cobranza eliminada exitosamente');
            } else if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al eliminar cobranza');
            }
            fetchCollections();
            if (clientBalance && clientBalance.dni === formData.dni) { // Refrescar saldo si aplica
                fetchClientBalance(formData.dni);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // --- Hooks y Manejadores de Eventos ---

    useEffect(() => {
        if (loggedInUser) {
            fetchCollections();
        }
    }, [loggedInUser, fetchCollections]);

    useEffect(() => {
        if (formData.dni) {
            fetchClientBalance(formData.dni);
        } else {
            setClientBalance(null);
        }
    }, [formData.dni, fetchClientBalance]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openCreateForm = () => {
        setCurrentCollection(null);
        setFormData({ dni: '', fecha: '', pago: '', tipo: '', det_tipo: '' });
        setClientBalance(null); // Limpiar saldo al abrir formulario
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    const startEdit = (collection) => {
        setCurrentCollection(collection);
        setFormData({
            dni: collection.dni,
            fecha: collection.fecha,
            pago: collection.pago,
            tipo: collection.tipo,
            det_tipo: collection.det_tipo || ''
        });
        setShowForm(true);
        fetchClientBalance(collection.dni); // Cargar saldo para el DNI editado
    };

    const closeForm = () => {
        setCurrentCollection(null);
        setFormData({ dni: '', fecha: '', pago: '', tipo: '', det_tipo: '' });
        setClientBalance(null);
        setShowForm(false);
    };

    // --- Renderizado del Componente ---

    return (
        <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Gestión de Cobranzas</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            {/* Bloque para mostrar los datos del usuario logeado 
            {loggedInUser ? (
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
                    <h3>Datos del Usuario Logeado:</h3>
                    <p><strong>Usuario:</strong> {loggedInUser.nombres} {loggedInUser.apel_pat} {loggedInUser.apel_mat}</p>
                    <p><strong>ID de Usuario:</strong> {loggedInUser.id}</p>
                    <p><strong>Promo:</strong> {loggedInUser.promo}</p>
                </div>
            ) : (
                <p style={{ color: 'orange' }}>Cargando datos del usuario...</p>
            )}
            */}
            <button onClick={openCreateForm} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>
                Registrar Nueva Cobranza
            </button>

            {showForm && (
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
                    <h3>{currentCollection ? 'Editar Cobranza' : 'Registrar Cobranza'}</h3>
                    <form onSubmit={currentCollection ? handleUpdateCollection : handleCreateCollection}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>DNI Cliente:</label>
                            <input type="text" name="dni" value={formData.dni} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>

                        {clientBalance && (
                            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e6ffed', borderLeft: '5px solid #28a745', borderRadius: '4px' }}>
                                <p><strong>Nombre Cliente:</strong> {clientBalance.nombres || 'No disponible'}</p>
                                <p><strong>Total Compras:</strong> S/. {clientBalance.total_compras.toFixed(2)}</p>
                                <p><strong>Total Pagos:</strong> S/. {clientBalance.total_pagos.toFixed(2)}</p>
                                <p><strong>Saldo Pendiente:</strong> S/. {clientBalance.saldo_pendiente.toFixed(2)}</p>
                            </div>
                        )}

                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Fecha de Pago:</label>
                            <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Importe a Pagar:</label>
                            <input type="number" name="pago" value={formData.pago} onChange={handleInputChange} required min="0.01" step="0.01" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Tipo de Pago:</label>
                            <select name="tipo" value={formData.tipo} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}>
                                <option value="">Seleccione</option>
                                <option value="E">Efectivo</option>
                                <option value="T">Tarjeta</option>
                                <option value="P">Plin</option>
                                <option value="Y">Yape</option>
                                <option value="R">Transferencia</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Detalle Tipo Pago (Opcional):</label>
                            <input type="text" name="det_tipo" value={formData.det_tipo} onChange={handleInputChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        
                        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                            {currentCollection ? 'Actualizar' : 'Registrar'} Cobranza
                        </button>
                        <button type="button" onClick={closeForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                    </form>
                </div>
            )}

            <h3>Listado de Cobranzas</h3>
            {loading ? (
                <p>Cargando cobranzas...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>DNI</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fecha</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Pago</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tipo</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Detalle</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Promo</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {collections.map(col => (
                            <tr key={col.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{col.dni}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{col.fecha}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{parseFloat(col.pago).toFixed(2)}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{USER_TYPE_LABELS[col.tipo] || 'Desconocido'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{col.det_tipo}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{col.promo}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button onClick={() => startEdit(col)} style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>
                                        Editar
                                    </button>
                                    <button onClick={() => handleDeleteCollection(col.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default CollectionManagement;