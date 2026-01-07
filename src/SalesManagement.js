// SalesManagement.js
import React, { useState, useEffect } from 'react';

function SalesManagement() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [currentSale, setCurrentSale] = useState(null);

    const [loggedInUser, setLoggedInUser] = useState(null); // Estado para el usuario logeado

    const [formData, setFormData] = useState({
        dni: '', nombres: '', fecha: '', cantidad: '', precio_unitario: ''
    });

    const isDniCompleto = formData.dni.length === 8;

    //Cmbio para el DNI 1
    const [loadingDNI, setLoadingDNI] = useState(false);

    //const API_URL = 'http://127.0.0.1:8000';
    const API_URL = 'https://backend-ventas-ekhi.onrender.com';
   

    // Cargar información del usuario logeado al inicio
    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        if (user) {
            setLoggedInUser(JSON.parse(user));
        } else {
            setError("No hay información del usuario logeado. Por favor, inicie sesión.");
        }
    }, []);

    // --- Funciones de Interacción con la API ---

    const fetchSales = async () => {
        setLoading(true);
        setError('');
        if (!loggedInUser || !loggedInUser.id) { // No intentar cargar ventas sin user ID
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/sales/`, {
                headers: {
                    'User-Id-Header': loggedInUser.id // Pasar el ID del usuario logeado en el header
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.detail
                                    ? (Array.isArray(errorData.detail)
                                       ? errorData.detail.map(err => err.msg).join(', ')
                                       : errorData.detail)
                                    : 'Error al obtener ventas';
                throw new Error(errorMessage);
            }
            const data = await response.json();
            setSales(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


     // Cambio por el DNI 2
    const fetchNombrePorDNI = async (dni) => {
        if (dni.length !== 8) return;

        setLoadingDNI(true);
        try {
            const response = await fetch(`${API_URL}/dni/${dni}`);
            if (!response.ok) return;

            const data = await response.json();
            setFormData(prev => ({
                ...prev,
                nombres: data.nombre_completo.toUpperCase()
            }));
        } catch (error) {
            console.error("Error consultando DNI");
        } finally {
            setLoadingDNI(false);
        }
    };


    const handleCreateSale = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        if (!loggedInUser || !loggedInUser.id) {
            setError("Error: Usuario no autenticado para crear la venta.");
            return;
        }

        // Validaciones básicas de campos (puedes añadir más)
        if (!formData.dni || !formData.nombres || !formData.fecha || !formData.cantidad || !formData.precio_unitario) {
            setError("Todos los campos de comprador y precio son obligatorios.");
            return;
        }
        if (isNaN(formData.cantidad) || parseInt(formData.cantidad) <= 0) {
            setError("La cantidad debe ser un número positivo.");
            return;
        }
        if (isNaN(formData.precio_unitario) || parseFloat(formData.precio_unitario) <= 0) {
            setError("El precio unitario debe ser un número positivo.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/sales/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id-Header': loggedInUser.id // Pasar el ID del usuario logeado
                },
                body: JSON.stringify({
                    ...formData,
                    cantidad: parseInt(formData.cantidad),
                    precio_unitario: parseFloat(formData.precio_unitario),
                    fecha: new Date(formData.fecha).toISOString().split('T')[0] // Formatear fecha a YYYY-MM-DD
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.detail
                                    ? (Array.isArray(errorData.detail)
                                       ? errorData.detail.map(err => err.msg).join(', ')
                                       : errorData.detail)
                                    : 'Error al crear venta';
                throw new Error(errorMessage);
            }
            setSuccess('Venta creada exitosamente');
            setFormData({ dni: '', nombres: '', fecha: '', cantidad: '', precio_unitario: '' });
            setShowForm(false);
            fetchSales();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateSale = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        if (!currentSale || !loggedInUser || !loggedInUser.id) return;

        // Recopilar solo los campos modificables y sus nuevos valores
        const updateData = {
            ...formData, // Esto incluye dni, nombres, fecha, cantidad, precio_unitario
            cantidad: parseInt(formData.cantidad),
            precio_unitario: parseFloat(formData.precio_unitario),
            fecha: new Date(formData.fecha).toISOString().split('T')[0]
        };

        try {
            const response = await fetch(`${API_URL}/sales/${currentSale.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id-Header': loggedInUser.id // Pasar el ID del usuario logeado
                },
                body: JSON.stringify(updateData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.detail
                                    ? (Array.isArray(errorData.detail)
                                       ? errorData.detail.map(err => err.msg).join(', ')
                                       : errorData.detail)
                                    : 'Error al actualizar venta';
                throw new Error(errorMessage);
            }
            setSuccess('Venta actualizada exitosamente');
            setFormData({ dni: '', nombres: '', fecha: '', cantidad: '', precio_unitario: '' });
            setCurrentSale(null);
            setShowForm(false);
            fetchSales();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteSale = async (saleId) => {
        setError('');
        setSuccess('');
        if (!window.confirm('¿Está seguro de que desea eliminar esta venta?')) {
            return;
        }
        if (!loggedInUser || !loggedInUser.id) {
            setError("Error: Usuario no autenticado para eliminar la venta.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/sales/${saleId}`, {
                method: 'DELETE',
                headers: {
                    'User-Id-Header': loggedInUser.id // Pasar el ID del usuario logeado
                }
            });
            if (response.status === 204) {
                 setSuccess('Venta eliminada exitosamente');
            } else if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.detail
                                    ? (Array.isArray(errorData.detail)
                                       ? errorData.detail.map(err => err.msg).join(', ')
                                       : errorData.detail)
                                    : 'Error al eliminar venta';
                throw new Error(errorMessage);
            }
            fetchSales();
        } catch (err) {
            setError(err.message);
        }
    };

    // --- Hooks y Manejadores de Eventos ---

    useEffect(() => {
        if (loggedInUser) { // Solo cargar ventas si hay un usuario logeado
            fetchSales();
        }
    }, [loggedInUser]); // Dependencia del efecto para recargar cuando el usuario logeado cambie

    
    // Cambio del DNI 3
    //const handleInputChange = (e) => {
    //    const { name, value } = e.target;
    //    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    //};

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "dni") {
            const dni = value.replace(/\D/g, "");
            setFormData(prev => ({ ...prev, dni }));

            if (dni.length === 8) {
                fetchNombrePorDNI(dni);
            } else {
                setFormData(prev => ({ ...prev, nombres: "" }));
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };


    const openCreateForm = () => {
        setCurrentSale(null);
        setFormData({ dni: '', nombres: '', fecha: '', cantidad: '', precio_unitario: '' });
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    const startEdit = (sale) => {
        setCurrentSale(sale);
        setFormData({
            dni: sale.dni,
            nombres: sale.nombres,
            fecha: sale.fecha, // Asume que la fecha ya está en formato YYYY-MM-DD
            cantidad: sale.cantidad,
            precio_unitario: sale.importe // Recalcular precio unitario
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setCurrentSale(null);
        setFormData({ dni: '', nombres: '', fecha: '', cantidad: '', precio_unitario: '' });
        setShowForm(false);
    };


    // --- Renderizado del Componente ---

    return (
        <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Gestión de Registro de Asistencia</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            {/* Bloque para mostrar los datos del usuario logeado */}
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

            <button onClick={openCreateForm} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>
                Crear Registro de Asistencia
            </button>

            {showForm && (
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
                    <h3>{currentSale ? 'Editar Venta' : 'Crear Venta'}</h3>
                    <form onSubmit={currentSale ? handleUpdateSale : handleCreateSale}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>DNI Comprador:</label>
                            <input type="text" name="dni" value={formData.dni} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Nombres Comprador:</label>
                            {/* Cambio por el DNI 4 */} 
                            {/*<input type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />*/}
                            <input
                                type="text"
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleInputChange}
                                readOnly={formData.dni.length === 8}
                                style={{
                                    backgroundColor: isDniCompleto ? '#e9ecef' : 'white',
                                    cursor: isDniCompleto ? 'not-allowed' : 'text',
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            />                        
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Fecha de Compra:</label>
                            <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Cantidad de Entradas:</label>
                            <input type="number" name="cantidad" value={formData.cantidad} onChange={handleInputChange} required min="1" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Precio Unitario:</label>
                            <input type="number" name="precio_unitario" value={formData.precio_unitario} onChange={handleInputChange} required min="0.01" step="0.01" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        
                        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                            {currentSale ? 'Actualizar' : 'Crear'} Venta
                        </button>
                        <button type="button" onClick={closeForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                    </form>
                </div>
            )}

            <h3>Listado de Ventas</h3>
            {loading ? (
                <p>Cargando ventas...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>DNI</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Comprador</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fecha</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cantidad</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Importe</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Total</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Promo</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => (
                            <tr key={sale.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sale.id}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sale.dni}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sale.nombres}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sale.fecha}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sale.cantidad}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sale.importe.toFixed(2)}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sale.total.toFixed(2)}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sale.promo}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button onClick={() => startEdit(sale)} style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>
                                        Editar
                                    </button>
                                    <button onClick={() => handleDeleteSale(sale.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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

export default SalesManagement;