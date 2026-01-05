import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx'; // Importar la librería para exportar a Excel

function ConsultaVentasprm() {
    const [promo, setPromo] = useState('');
    const [consultaVentas, setConsultaVentas] = useState([]);;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loggedInUser, setLoggedInUser] = useState(null);

    const API_URL = 'http://127.0.0.1:8000';

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        if (user) {
            setLoggedInUser(JSON.parse(user));
        } else {
            setError("No hay información del usuario logeado. Por favor, inicie sesión.");
        }

        if (loggedInUser?.tipo === 2) {
            setPromo(loggedInUser.promo); // ← valor por defecto
        }
    }, [loggedInUser]);

    const fetchConsultaVentas = useCallback(async () => {
        setLoading(true);
        setError('');
        setConsultaVentas(null);

        if (!promo) {
            setError("Por favor, ingrese Año de la promoción para consultar el ventas.");
            setLoading(false);
            return;
        }
        if (!loggedInUser || !loggedInUser.id) {
            setError("Error: Usuario no autenticado.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/PromoVentas/${promo}`, {
                headers: {
                    'User-Id-Header': loggedInUser.id
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al obtener consulta de ventas');
            }
            const data = await response.json();
            setConsultaVentas(data);
            setSuccess('Consulta de Ventas cargado exitosamente.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [promo, loggedInUser, API_URL]);

    const handlePromoChange = (e) => {
        setPromo(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchConsultaVentas();
    };


    const exportToExcel = () => {
        if (!Array.isArray(consultaVentas) || consultaVentas.length === 0) {
            setError("No hay datos para exportar.");
            return;
        }

        const dataToExport = consultaVentas.map(t => ({
            Dni: t.dni,
            Nombre: t.nombres,
            Cantidad: t.Cantidad,
            Importe: parseFloat(t.total).toFixed(2),
            Pago: parseFloat(t.pagos).toFixed(2),
            Saldo: parseFloat(t.saldo).toFixed(2)
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Consulta de Ventas");

        XLSX.writeFile(wb, `Consulta_Ventas.xlsx`);
        setSuccess("Reporte exportado a Excel.");
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Consulta de Ventas - Promoción</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                        <div style={{ flexGrow: 1 }}>
                        <label htmlFor="promoInput" style={{ display: 'block', marginBottom: '5px' }}>Año Promoción:</label>
                        <input
                            type="text"
                            id="promoInput"
                            value={promo}
                            onChange={handlePromoChange}
                            required
                            disabled={loggedInUser?.tipo === 2}
                            style={{ width: '100%', 
                                     padding: '8px', 
                                     boxSizing: 'border-box', 
                                     border: '1px solid #ddd', 
                                     borderRadius: '4px',
                                     backgroundColor: loggedInUser?.tipo === 2 ? '#eee' : 'white' }}
                            placeholder="Ingrese Año Promoción"
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {'Consultar de Ventas por Promoción'}
                    </button>
                    <button type="button" onClick={exportToExcel} disabled={!Array.isArray(consultaVentas) || consultaVentas.length === 0} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Exportar a Excel
                    </button>
                </div>
            </form>

            {consultaVentas && (
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h3>Consulta de Ventas - Promoción:</h3>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Dni</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Cantidad</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Total</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Pagos</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Saldo</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {consultaVentas.map((t, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{t.dni}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{t.nombres}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{parseFloat(t.cantidad).toFixed(2)}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{parseFloat(t.total).toFixed(2)}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{parseFloat(t.pagos).toFixed(2)}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{parseFloat(t.saldo).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ConsultaVentasprm;