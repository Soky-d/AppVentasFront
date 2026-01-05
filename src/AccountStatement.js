// src/AccountStatement.js
import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx'; // Importar la librería para exportar a Excel

function AccountStatement() {
    const [dni, setDni] = useState('');
    const [accountStatement, setAccountStatement] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    //const [loggedInUser, setLoggedInUser] = useState(null);

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));


    const API_URL = 'http://127.0.0.1:8000';

    //useEffect(() => {
    //    const user = localStorage.getItem('loggedInUser');
    //    if (user) {
    //        setLoggedInUser(JSON.parse(user));
    //    } else {
    //        setError("No hay información del usuario logeado. Por favor, inicie sesión.");
    //    }
    //}, []);

    useEffect(() => {
        if (loggedInUser) {
            // Usuario tipo 3 → DNI fijo
            if (loggedInUser.tipo === 3) {
                setDni(loggedInUser.dni);
                }
             }
    }, [loggedInUser]);


    const fetchAccountStatement = useCallback(async () => {
        setLoading(true);
        setError('');
        setAccountStatement(null);

        if (!dni) {
            setError("Por favor, ingrese un DNI para consultar el estado de cuenta.");
            setLoading(false);
            return;
        }
        if (!loggedInUser || !loggedInUser.id) {
            setError("Error: Usuario no autenticado.");
            setLoading(false);
            return;
        }


        try {
            const response = await fetch(`${API_URL}/account-statement/${dni}`, {
                headers: {
                    'User-Id-Header': loggedInUser.id
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al obtener el estado de cuenta');
            }
            const data = await response.json();
            setAccountStatement(data);
            setSuccess('Estado de cuenta cargado exitosamente.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [dni, loggedInUser, API_URL]);

    const handleDniChange = (e) => {
        setDni(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAccountStatement();
    };

    const exportToExcel = () => {
        if (!accountStatement || accountStatement.transacciones.length === 0) {
            setError("No hay datos para exportar.");
            return;
        }

        const dataToExport = accountStatement.transacciones.map(t => ({
            Fecha: t.fecha,
            Descripcion: t.descripcion,
            "Tipo Transaccion": t.tipo_transaccion,
            Monto: parseFloat(t.monto).toFixed(2),
            "Saldo Acumulado": parseFloat(t.saldo_acumulado).toFixed(2)
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Estado de Cuenta");

        XLSX.writeFile(wb, `EstadoDeCuenta_${accountStatement.dni}.xlsx`);
        setSuccess("Reporte exportado a Excel.");
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Consulta de Estado de Cuenta</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flexGrow: 1 }}>
                        <label htmlFor="dniInput" style={{ display: 'block', marginBottom: '5px' }}>DNI del Cliente:</label>
                        <input
                            type="text"
                            id="dniInput"
                            value={dni}
                            onChange={handleDniChange}
                            required
                            disabled={loggedInUser?.tipo === 3}
                            style={{ width: '100%', 
                                     padding: '8px', 
                                     boxSizing: 'border-box', 
                                     border: '1px solid #ddd', 
                                     borderRadius: '4px',
                                     backgroundColor: loggedInUser?.tipo === 3 ? '#eee' : 'white' }}
                            placeholder="Ingrese DNI"
                        />
                    </div>
                    <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Buscando...' : 'Consultar Estado de Cuenta'}
                    </button>
                    <button type="button" onClick={exportToExcel} disabled={!accountStatement || accountStatement.transacciones.length === 0} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Exportar a Excel
                    </button>
                </div>
            </form>

            {accountStatement && (
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h3>Estado de Cuenta para: {accountStatement.nombres_cliente || accountStatement.dni}</h3>
                    {accountStatement.promocion_cliente && <p><strong>Promoción:</strong> {accountStatement.promocion_cliente}</p>}
                    <p><strong>Saldo Final:</strong> S/. {parseFloat(accountStatement.saldo_final).toFixed(2)}</p>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fecha</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Descripción</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tipo</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Monto</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accountStatement.transacciones.map((t, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{t.fecha}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{t.descripcion}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{t.tipo_transaccion}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{parseFloat(t.monto).toFixed(2)}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{parseFloat(t.saldo_acumulado).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AccountStatement;