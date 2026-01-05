// Dashboard.js
import React from 'react';
import { useAuth } from "./auth/AuthContext";
import { Link, Outlet, useNavigate } from 'react-router-dom';

import banner from "./imagenes/logo_ruway.png";

function Dashboard() {
    const navigate = useNavigate();

    const { user } = useAuth();
    const role = Number(user?.tipo);

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser'); // Limpiar datos del usuario al cerrar sesión
        // Aquí podrías limpiar cualquier token o sesión del almacenamiento local
        console.log("Cerrando sesión...");
        navigate('/'); // Redirigir al formulario de login
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            {/* Menú Lateral */}
            <div style={{ width: '250px', backgroundColor: '#343a40', color: 'white', padding: '20px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#61dafb' }}>App Control Entradas</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {role === 1 && (
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/dashboard/users" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em', display: 'block', padding: '10px 15px', borderRadius: '5px', transition: 'background-color 0.3s' }}>
                                Usuarios
                            </Link>
                        </li>
                    )}
                    {(role === 1 || role === 2) && (
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/dashboard/ventas-entradas" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em', display: 'block', padding: '10px 15px', borderRadius: '5px', transition: 'background-color 0.3s' }}>
                                Ventas - Entradas
                            </Link>
                        </li>
                    )}
                    {(role === 1 || role === 2) && (
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/dashboard/cobranza" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em', display: 'block', padding: '10px 15px', borderRadius: '5px', transition: 'background-color 0.3s' }}>
                                Cobranza
                            </Link>
                        </li>
                    )}
                    {(role === 1 || role === 2 || role === 3) && (
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/dashboard/estado-cuenta" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em', display: 'block', padding: '10px 15px', borderRadius: '5px', transition: 'background-color 0.3s' }}>
                                Estado Cuenta
                            </Link>
                        </li>
                    )}
                    {role === 1 && (
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/dashboard/consulta-ventas" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em', display: 'block', padding: '10px 15px', borderRadius: '5px', transition: 'background-color 0.3s' }}>
                                Consulta Ventas
                            </Link>
                        </li>
                    )}
                    {(role === 1 || role === 2) && (
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/dashboard/promo-ventas" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em', display: 'block', padding: '10px 15px', borderRadius: '5px', transition: 'background-color 0.3s' }}>
                                Consulta Ventas por promoción
                            </Link>
                        </li>
                    )}
                    {role === 1 && (
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/dashboard/resumen-ventas" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em', display: 'block', padding: '10px 15px', borderRadius: '5px', transition: 'background-color 0.3s' }}>
                                Resumen de Ventas
                            </Link>
                        </li>
                    )}
                    
                    <li style={{ marginTop: '50px' }}>
                        <button onClick={handleLogout} style={{ width: '100%', padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em', transition: 'background-color 0.3s' }}>
                            Cerrar Sesión
                        </button>
                    </li>
                </ul>

                {/* 👇 IMAGEN DESPUÉS DEL MENÚ */}
                <div style={{ margin: "20px 0", textAlign: "center" }}>
                    <img
                        src={banner}
                        alt="Banner"
                        style={{
                            maxWidth: "50%",
                            height: "auto",
                            borderRadius: "8px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                        }}
                    />
                </div>
            </div>

            {/* Contenido Principal del Dashboard */}
            <div style={{ flexGrow: 1, padding: '20px' }}>
                <h1 style={{ marginBottom: '30px', color: '#333' }}>Asociación de ExAlumnas - Zoila Hora de Robles</h1>
                <Outlet /> {/* Aquí se renderizarán los componentes hijos de las rutas */}
            </div>
        </div>
    );
}

export default Dashboard;