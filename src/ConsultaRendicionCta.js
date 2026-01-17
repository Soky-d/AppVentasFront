import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx'; // Importar la librería para exportar a Excel

function ConsultaRendicionCta() {
    const [usuario, setUsuario] = useState('');
    const [accountStatement, setAccountStatement] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const [formData, setFormData] = useState({
        usuario_lq: '',promo: '', fecha: '', pago: '', tipo: '', det_tipo: ''
    });

    //const API_URL = 'http://127.0.0.1:8000';
    const API_URL = 'https://backend-ventas-ekhi.onrender.com';

 
    const [promoters, setPromoters] = useState([]);
    const [selectedPromoter, setSelectedPromoter] = useState({
            id: "",
            usuario: "",
            promo: ""
        });


    const fetched = useRef(false);

    useEffect(() => {
        if (!loggedInUser?.id) return;

        if (fetched.current) return;
            fetched.current = true;

        fetch(`${API_URL}/promoters/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Id-Header': loggedInUser.id
            }
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => {
                        throw new Error(err.detail || 'Error al cargar promotores');
                    });
                }
                return res.json();
            })
            .then(data => {
                console.log("RESPUESTA /promoters:", data);

                if (Array.isArray(data)) {
                    setPromoters(data);
                } else if (Array.isArray(data.data)) {
                    setPromoters(data.data);
                } else if (Array.isArray(data.result)) {
                    setPromoters(data.result);
                } else {
                    setPromoters([]);
                }
            })
            .catch(err => {
                console.error("Error cargando promotores:", err.message);
                setPromoters([]);
            });
    }, [loggedInUser]);


    useEffect(() => {
        if (formData.usuario_lq) {
            fetchAccountStatement();
        }
    }, [formData.usuario_lq]);

    const fetchAccountStatement = useCallback(async () => {
        setLoading(true);
        setError('');
        setAccountStatement(null);

        if (!formData.usuario_lq) {
            setLoading(false);
            return;
        }

        if (!loggedInUser?.id) {
            setError("Usuario no autenticado.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/ConsultaLiq/${formData.usuario_lq}`,
                {
                    headers: {
                        'User-Id-Header': loggedInUser.id
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al consultar');
            }

            const data = await response.json();
            setAccountStatement(data);
            setSuccess('Rendición de cuenta cargada.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [formData.usuario_lq, loggedInUser, API_URL]);

    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        XLSX.utils.book_append_sheet(wb, ws, "Consulta de Rendición de Cuenta");

        XLSX.writeFile(wb, `rendicion_cuenta_${accountStatement.usuario_lq}.xlsx`);
        setSuccess("Reporte exportado a Excel.");
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Consulta de Rendición de Cuenta</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flexGrow: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Promotor:</label>
                        <select
                            onChange={(e) => {
                                const promoterUsuario = e.target.value;
                                const promoter = promoters.find(p => p.usuario === promoterUsuario);

                                if (!promoter) {
                                    setSelectedPromoter({ usuario: "", promo: "" });
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
                            style={{
                                width: '100%',
                                padding: '8px',
                                boxSizing: 'border-box',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                            }}
                        >
                            <option value="">Seleccione promotor</option>

                            {Array.isArray(promoters) && promoters.map(p => (
                                <option key={p.usuario} value={p.usuario}>
                                    {p.nombres ?? p.usuario}
                                </option>
                            ))}
                        </select>


                        <div style={{ marginBottom: '10px' }}>
                            <input type="text" name="usuario_lq" value={formData.usuario_lq} readOnly onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px',textTransform: 'uppercase' }} />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Buscando...' : 'Consultar Rendición de Cuenta'}
                    </button>
                    <button type="button" onClick={exportToExcel} disabled={!accountStatement || accountStatement.transacciones.length === 0} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Exportar a Excel
                    </button>
                </div>
            </form>

            {accountStatement && (
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h3>Rendición de cuenta para: {accountStatement.nombres_cliente || accountStatement.usuario_lq}</h3>
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
                            {/* {accountStatement.transacciones.map((t, index) => ( */}
                                {Array.isArray(accountStatement.transacciones) &&  accountStatement.transacciones.map((t, index) => (
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

export default ConsultaRendicionCta;