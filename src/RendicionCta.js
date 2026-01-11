import React, { useState, useEffect, useCallback } from 'react';

function RendicionCta() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [currentCollection, setCurrentCollection] = useState({
            usuario_lq: "", promo: "", fecha: null, pago: 0, tipo: "", det_tipo: ""
        });

    const [loggedInUser, setLoggedInUser] = useState(null); // Estado para el usuario logeado

    const [formData, setFormData] = useState({
        usuario_lq: '',promo: '', fecha: '', pago: '', tipo: '', det_tipo: ''
    });
    const [PromotorBalance, setPromotorBalance] = useState(null); // Para almacenar el saldo del cliente

    //const API_URL = 'http://127.0.0.1:8000'; // Asegúrate de que esta URL sea la correcta para tu backend
    const API_URL = 'https://backend-ventas-ekhi.onrender.com';
 

    const USER_TYPE_LABELS = {
        E: 'Efectivo',
        T: 'Tarjeta',
        P: 'Plin',
        Y: 'Yape',
        R: 'Transferencia'
    };



    const [promoters, setPromoters] = useState([]);
    const [selectedPromoter, setSelectedPromoter] = useState({
            id: "",
            usuario: "",
            promo: ""
        });

    useEffect(() => {
        if (!loggedInUser?.id) return;

        fetch(`${API_URL}/promoters/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Id-Header': loggedInUser.id
            }
        })
            .then(res => res.json())
            .then(data => setPromoters(data))
            .catch(err => console.error(err));
    }, [loggedInUser]);


    useEffect(() => {
        console.log("selectedPromoter:", selectedPromoter);
    }, [selectedPromoter]);

    useEffect(() => {
            const user = localStorage.getItem('loggedInUser');
            if (user) {
                setLoggedInUser(JSON.parse(user));
            } else {
                setError("No hay información del usuario logeado. Por favor, inicie sesión.");
            }
        }, []);

     
    useEffect(() => {
            if (PromotorBalance?.promo) {
                setFormData(prev => ({
                    ...prev,
                    promo: PromotorBalance.promo
                }));
            }
        }, [PromotorBalance]);   
    
    // --- Funciones de Interacción con la API ---

    const fetchCollections = useCallback(async () => {
        setLoading(true);
        setError('');
        if (!loggedInUser || !loggedInUser.id) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/liquida/`, {
                headers: {
                    'User-Id-Header': loggedInUser.id // Pasar el usuario logeado en el header
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al obtener rendición de cuenta');
            }
            const data = await response.json();
            setCollections(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [loggedInUser, API_URL]);

    const fetchClientBalance = useCallback(async (user_lq) => {
        setError('');
        if (!user_lq || !loggedInUser || !loggedInUser.id) {
            setPromotorBalance(null);
            return;
        }
        try {
            user_lq = user_lq.toUpperCase();
            const response = await fetch(`${API_URL}/liquida/balance/${user_lq}`, {
                headers: {
                    'User-Id-Header': loggedInUser.id
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al obtener saldo del del promotor');
            }
            const data = await response.json();
            setPromotorBalance(data);
        } catch (err) {
            setError(err.message);
            setPromotorBalance(null); // Limpiar saldo si hay error
        }
    }, [loggedInUser, API_URL]);

    const handleCreateCollection = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        if (!loggedInUser || !loggedInUser.id) {
            setError("Error: Usuario no autenticado para crear la rendición de cuenta.");
            return;
        }  
        if (!formData.usuario_lq || !formData.fecha || !formData.pago) {
            setError("Complete todos los campos obligatorios");
            return;
        }

        const payload = {
            usuario_lq: formData.usuario_lq.toUpperCase(),
            promo: formData.promo,
            fecha: formData.fecha,
            pago: Number(formData.pago),
            tipo: formData.tipo,
            det_tipo: formData.det_tipo
        };

        try {
            const response = await fetch(`${API_URL}/liquida/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id-Header': loggedInUser.id
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al crear rendición de cuenta');
            }
            setSuccess('Rendición de Cuenta creada exitosamente');
            setFormData({ usuario_lq: '', promo: '', fecha: '', pago: '', tipo: '', det_tipo: '' });
            setShowForm(false);
            fetchCollections();
            //if (PromotorBalance && PromotorBalance.usuario_lq === formData.usuario_lq) { // Refrescar saldo si aplica
            //    fetchClientBalance(formData.usuario_lq);
            //}
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
            const response = await fetch(`${API_URL}/liquida/${currentCollection.id}`, {
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
                throw new Error(errorData.detail || 'Error al actualizar rendición de cuenta');
            }
            setSuccess('Rendición de Cuenta actualizada exitosamente');
            setFormData({ usuario_lq: '', promo: '', fecha: '', pago: '', tipo: '', det_tipo: '' });
            setCurrentCollection(null);
            setShowForm(false);
            fetchCollections();
            if (PromotorBalance && PromotorBalance.usuario_lq === formData.usuario_lq) { // Refrescar saldo si aplica
                fetchClientBalance(formData.usuario_lq);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCollection = async (collectionId) => {
        setError('');
        setSuccess('');
        if (!window.confirm('¿Está seguro de que desea eliminar esta Rendición de Cuenta?')) {
            return;
        }
        if (!loggedInUser || !loggedInUser.usuario) {
            setError("Error: Usuario no autenticado para eliminar la rendición de cuenta.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/liquida/${collectionId}`, {
                method: 'DELETE',
                headers: {
                    'User-Id-Header': loggedInUser.id
                }
            });
            if (response.status === 204) {
                 setSuccess('Rendición de Cuenta eliminada exitosamente');
            } else if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al eliminar rendición de cuenta');
            }
            fetchCollections();
            if (PromotorBalance && PromotorBalance.usuario_lq === formData.usuario_lq) { // Refrescar saldo si aplica
                fetchClientBalance(formData.usuario_lq);
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
        if (formData.usuario_lq) {
            fetchClientBalance(formData.usuario_lq);
        } else {
            setPromotorBalance(null);
        }
    }, [formData.usuario_lq, fetchClientBalance]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openCreateForm = () => {
        setCurrentCollection(null);
        setFormData({ usuario_lq: '', promo: '', fecha: '', pago: '', tipo: '', det_tipo: '' });
        setPromotorBalance(null); // Limpiar saldo al abrir formulario
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    const startEdit = (collection) => {
        setCurrentCollection(collection);
        setFormData({
            usuario_lq: collection.usuario_lq,
            nombres: collection.nombres,
            promo: collection.promo,
            fecha: collection.fecha,
            pago: collection.pago,
            tipo: collection.tipo,
            det_tipo: collection.det_tipo || ''
        });
        setShowForm(true);
        fetchClientBalance(collection.usuario_lq); // Cargar saldo para el DNI editado
    };

    const closeForm = () => {
        setCurrentCollection(null);
        setFormData({ usuario_lq: '', promo: '', fecha: '', pago: '', tipo: '', det_tipo: ''});
        setPromotorBalance(null);
        setShowForm(false);
    };

    // --- Renderizado del Componente ---

    return (
        <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Gestión de Rendición de Cuenta</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <button onClick={openCreateForm} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>
                Registrar Nueva Rendición de Cuenta
            </button>

            {showForm && (
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
                    <h3>{currentCollection ? 'Editar Pagos' : 'Registrar Nuevo Pago'}</h3>
                    <form onSubmit={currentCollection ? handleUpdateCollection : handleCreateCollection}>

                        <select
                            onChange={(e) => {
                                const promoterId = Number(e.target.value);
                                const promoter = promoters.find(p => p.id === promoterId);

                                if (!promoter) {
                                    setSelectedPromoter({ id: "", usuario: "", promo: "" });
                                    setFormData(prev => ({
                                        ...prev,
                                        usuario_lq: "",
                                        promo: ""
                                    }));
                                    return;
                                }

                                setSelectedPromoter(promoter);

                                setFormData(prev => ({
                                    ...prev,
                                    usuario_lq: promoter.usuario,
                                    promo: promoter.promo
                                }));
                            }}
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px',textTransform: 'uppercase' }}
                        >
                            <option value="">Seleccione promotor</option>
                            {promoters.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nombres}
                                </option>
                            ))}
                        </select>

                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Promotor:</label>
                            <input type="text" name="usuario_lq" value={formData.usuario_lq} readOnly onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px',textTransform: 'uppercase' }} />
                        </div>

                        {PromotorBalance && (
                            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e6ffed', borderLeft: '5px solid #28a745', borderRadius: '4px' }}>
                                <p><strong>Nombre Promotor:</strong> {PromotorBalance.nombres || 'No disponible'}</p>
                                <p><strong>Total Ventas:</strong> S/. {PromotorBalance.total_ventas.toFixed(2)}</p>
                                <p><strong>Total Pagos:</strong> S/. {PromotorBalance.total_pagos.toFixed(2)}</p>
                                <p><strong>Saldo Pendiente:</strong> S/. {PromotorBalance.saldo_pendiente.toFixed(2)}</p>
                                <p><strong>Cobranza Promotor:</strong> S/. {PromotorBalance.total_cobros.toFixed(2)}</p>
                            </div>
                        )}
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Promoción</label>
                            {/*<input type="text" name="promo" value={PromotorBalance?.promo} onChange={handleInputChange} readOnly style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />*/}
                            <input  type="text"  name="promo"  value={formData.promo}  readOnly onChange={handleInputChange} readOnly style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>

                        
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
                            {currentCollection ? 'Actualizar' : 'Registrar'} Pagos
                        </button>
                        <button type="button" onClick={closeForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                    </form>
                </div>
            )}

            <h3>Listado de Pagos</h3>
            {loading ? (
                <p>Cargando pagos...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Usuario</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Promotor</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Promo</th>
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
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{col.usuario_lq}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{col.nombres}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{col.promo}</td>
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

export default RendicionCta;