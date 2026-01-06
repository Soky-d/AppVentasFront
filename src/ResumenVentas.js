import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx'; // Importar la librería para exportar a Excel

function ResumenVentas() {
    const [resumenVentas, setResumenVentas] = useState([]);;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loggedInUser, setLoggedInUser] = useState(null);

    //const API_URL = 'http://127.0.0.1:8000';
    const API_URL = 'https://backend-ventas-ekhi.onrender.com';

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        if (user) {
            setLoggedInUser(JSON.parse(user));
        } else {
            setError("No hay información del usuario logeado. Por favor, inicie sesión.");
        }
    }, []);

    const fetchResumenVentas = useCallback(async () => {
        setLoading(true);
        setError('');
        setResumenVentas(null);

        if (!loggedInUser || !loggedInUser.id) {
            setError("Error: Usuario no autenticado.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/ResumenVentas/`, {
                headers: {
                    'User-Id-Header': loggedInUser.id
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al obtener resume de ventas');
            }
            const data = await response.json();
            setResumenVentas(data);
            setSuccess('Resumen de Ventas cargado exitosamente.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [loggedInUser, API_URL]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResumenVentas();
    };


    const exportToExcel = () => {
        if (!Array.isArray(resumenVentas) || resumenVentas.length === 0) {
            setError("No hay datos para exportar.");
            return;
        }

        const dataToExport = resumenVentas.map(t => ({
            Promocion: t.promo,
            Cantidad: t.Cantidad,
            Importe: parseFloat(t.total).toFixed(2),
            Pago: parseFloat(t.pagos).toFixed(2),
            Saldo: parseFloat(t.saldo).toFixed(2)
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Resumen de Ventas");

        XLSX.writeFile(wb, `Resumen_Ventas.xlsx`);
        setSuccess("Reporte exportado a Excel.");
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Consulta de Ventas</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {'Resumen de Ventas'}
                    </button>
                    <button type="button" onClick={exportToExcel} disabled={!Array.isArray(resumenVentas) || fetchResumenVentas.length === 0} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Exportar a Excel
                    </button>
                </div>
            </form>

            {resumenVentas && (
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h3>Consulat de Ventas:</h3>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Promocion</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Cantidad</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Total</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Pagos</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resumenVentas.map((t, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{t.promo}</td>
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

export default ResumenVentas;