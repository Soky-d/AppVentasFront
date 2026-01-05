import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { useAuth } from "./auth/AuthContext";

function LoginForm() {
    const { login } = useAuth();

    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate(); // Inicializar useNavigate

    const API_URL = 'http://127.0.0.1:8000'; // Asegúrate de que esta URL sea la correcta para tu backend
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email_or_username: emailOrUsername,
                    password: password,
                }),
            });

            if (response.ok) {
                // const data = await response.json();
                const userData = await response.json(); // <-- Aquí se define userData
                setSuccess("Login exitoso.");

                //console.log("Login exitoso. ID de usuario:", data.user_id);
                console.log("Login exitoso. Datos de usuario:", userData);  
                
                localStorage.setItem("token", userData.access_token);

                // Almacenar datos del usuario logeado (id, usuario, promo)
                localStorage.setItem('loggedInUser', JSON.stringify({
                    id: userData.id,
                    usuario: userData.usuario,
                    promo: userData.promo,
                    nombres: userData.nombres,
                    apel_pat: userData.apel_pat,
                    apel_mat: userData.apel_mat
                }));

                login({
                    id: userData.id,
                    usuario: userData.usuario,
                    promo: userData.promo,
                    nombres: userData.nombres,
                    apel_pat: userData.apel_pat,
                    apel_mat: userData.apel_mat,
                    tipo: userData.tipo   // 👈 OBLIGATORIO
                });

                navigate('/dashboard'); // <--- AÑADIR ESTA LÍNEA
            } else {
                const errorData = await response.json();
                // Extrayendo el mensaje de error de forma más robusta
                const errorMessage = errorData.detail
                                    ? (Array.isArray(errorData.detail)
                                       ? errorData.detail.map(err => err.msg).join(', ')
                                       : errorData.detail)
                                    : 'Credenciales inválidas o error desconocido';
                setError(errorMessage);
            }
        } catch (err) {
            setError('Error de conexión o de red. Intente de nuevo más tarde.');
            console.error('Error de red:', err);
        }
    };

    return (
       <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h1>App Control de Entradas</h1>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="emailOrUsername" style={{ display: 'block', marginBottom: '5px' }}>Email o Nombre de Usuario:</label>
                    <input
                        type="text"
                        id="emailOrUsername"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Entrar
                </button>
            </form>
            <h2>RUVAY Soft SAC</h2>
            <h5>Contacto - 999181712</h5>
            <h5>Para la Asociación de Ex-Alumnas Zoila Hora de Robles</h5>
        </div>
    );
}
export default LoginForm;