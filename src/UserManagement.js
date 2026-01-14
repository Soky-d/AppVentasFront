// UserManagement.js
import React, { useState, useEffect } from 'react';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // Asegúrate de que 'error' siempre sea una cadena
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false); // Para mostrar/ocultar el formulario de creación/edición
    const [currentUser, setCurrentUser] = useState(null); // Usuario que se está editando

    // Estado para el nuevo usuario o usuario a editar
    const [formData, setFormData] = useState({
        apel_pat: '', apel_mat: '', nombres: '', email: '', telefono: '',
        usuario: '', tipo: '', clave: '', promo: ''
    });

    const USER_TYPES = [
        { value: '1', label: 'Administrador' },
        { value: '2', label: 'Promotor' },
    ];

    const USER_TYPE_LABELS = {
        1: 'Administrador',
        2: 'Promotor'
    };


    
    //const API_URL = 'http://127.0.0.1:8000'; // Asegúrate de que esta URL sea la correcta para tu backend
    const API_URL = 'https://backend-ventas-ekhi.onrender.com'; 
 
    // --- Funciones de Interacción con la API ---

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/users/`);
            if (!response.ok) {
                const errorData = await response.json();
                // Extrayendo el mensaje de error de forma más robusta
                const errorMessage = errorData.detail 
                                    ? (Array.isArray(errorData.detail) 
                                       ? errorData.detail.map(err => err.msg).join(', ') 
                                       : errorData.detail) 
                                    : 'Error al obtener usuarios';
                throw new Error(errorMessage);
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        for (const key in formData) {
             if (formData[key] === '' && key !== 'email' && key !== 'telefono'){ // 'promo' y 'telefono' pueden ser Optional en algunos casos
                // Esta validación asume que solo 'promo' y 'telefono' podrían ser opcionales si se han definido así en UserCreate
                // Si tienes otros campos Optional en UserCreate, añádelos aquí.
                setError(`El campo '${key.replace('_', ' ').toUpperCase()}' es obligatorio.`);
                return; // Detener el envío si falta un campo
            }
        }

        try {
            const response = await fetch(`${API_URL}/users/`, { // Agregamos la barra final
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                // Extrayendo el mensaje de error de forma más robusta
                const errorMessage = errorData.detail 
                                    ? (Array.isArray(errorData.detail) 
                                       ? errorData.detail.map(err => err.msg).join(', ') 
                                       : errorData.detail) 
                                    : 'Error al crear usuario';
                throw new Error(errorMessage);
            }
            setSuccess('Usuario creado exitosamente');
            setFormData({ // Limpiar formulario
                apel_pat: '', apel_mat: '', nombres: '', email: '', telefono: '',
                usuario: '', tipo: '', clave: '', promo: ''
            });
            setShowForm(false);
            fetchUsers(); // Actualizar la lista
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateUser = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        if (!currentUser) return;

        const updateData = {};
        for (const key in formData) {
            if (key === 'clave') {
                if (formData.clave && formData.clave !== '**********') { // '**********' es un placeholder
                    updateData[key] = formData[key];
                }
            } else {
                updateData[key] = formData[key];
            }
        }

        if (formData.clave === '**********') { // Si la clave es el placeholder, no la enviamos.
            delete updateData.clave;
        }

        try {
            const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData), // Enviar solo los campos que se desean actualizar
            });
            if (!response.ok) {
                const errorData = await response.json();
                 // Extrayendo el mensaje de error de forma más robusta
                const errorMessage = errorData.detail 
                                    ? (Array.isArray(errorData.detail) 
                                       ? errorData.detail.map(err => err.msg).join(', ') 
                                       : errorData.detail) 
                                    : 'Error al actualizar usuario';
                throw new Error(errorMessage);
            }
            setSuccess('Usuario actualizado exitosamente');
            setFormData({ // Limpiar formulario y restablecer
                apel_pat: '', apel_mat: '', nombres: '', email: '', telefono: '',
                usuario: '', tipo: '', clave: '', promo: ''
            });
            setCurrentUser(null);
            setShowForm(false);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        setError('');
        setSuccess('');
        if (!window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
            });
            if (response.status === 204) {
                 setSuccess('Usuario eliminado exitosamente');
            } else if (!response.ok) { // Si no es 204 y tampoco es ok, entonces es un error
                const errorData = await response.json();
                const errorMessage = errorData.detail 
                                    ? (Array.isArray(errorData.detail) 
                                       ? errorData.detail.map(err => err.msg).join(', ') 
                                       : errorData.detail) 
                                    : 'Error al eliminar usuario';
                throw new Error(errorMessage);
            }
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    // --- Hooks y Manejadores de Eventos ---

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const startEdit = (user) => {
        setCurrentUser(user);
        setFormData({
            apel_pat: user.apel_pat, apel_mat: user.apel_mat, nombres: user.nombres,
            email: user.email, telefono: user.telefono, usuario: user.usuario,
            tipo: user.tipo, clave: '**********', // Placeholder para clave, no el valor real
            promo: user.promo
        });
        setShowForm(true);
    };

    // Nueva función para abrir el formulario de creación
    const openCreateForm = () => {
        setCurrentUser(null); // Asegurarse de que no estamos editando a nadie
        setFormData({ // Limpiar el formulario para un nuevo usuario
            apel_pat: '', apel_mat: '', nombres: '', email: '', telefono: '',
            usuario: '', tipo: '', clave: '', promo: ''
        });
        setShowForm(true); // Abrir el formulario
        setError(''); // Limpiar errores previos
        setSuccess(''); // Limpiar mensajes de éxito previos
    };

    const closeForm = () => {
        setCurrentUser(null);
        setFormData({
            apel_pat: '', apel_mat: '', nombres: '', email: '', telefono: '',
            usuario: '', tipo: '', clave: '', promo: ''
        });
        setShowForm(false);
    };

    // --- Renderizado del Componente ---

    return (
        <div style={{ maxWidth: '900px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Gestión de Usuarios</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <button onClick={openCreateForm} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>
                Crear Nuevo Usuario
            </button>

            {showForm && (
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
                    <h3>{currentUser ? 'Editar Usuario' : 'Crear Usuario'}</h3>
                    <form onSubmit={currentUser ? handleUpdateUser : handleCreateUser}>
                        {Object.keys(formData)
                          .filter(key => !(key === 'email' && (formData.tipo === '' || formData.tipo === '1' || formData.tipo === '2')))
                          .map(key => (
                            <div key={key} style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>{key.replace('_', ' ').toUpperCase()}:</label>
                                {key === 'tipo' ? (
                                    <select
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleInputChange}
                                        required
                                        style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                    >
                                        <option value="">-- Seleccione tipo de usuario --</option>
                                        {USER_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>))
                                        }
                                    </select>
                                ) : (
                                    <input
                                        type={key === 'clave' ? 'password' : 'text'}
                                        name={key}
                                        value={formData[key]}
                                        onChange={handleInputChange}
                                        required={key !== 'clave' || !currentUser} // Clave solo es requerida al crear
                                        disabled={key === 'id'} // ID no debe ser editable
                                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                )}
                            </div>
                        ))}
                        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                            {currentUser ? 'Actualizar' : 'Crear'}
                        </button>
                        <button type="button" onClick={closeForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                    </form>
                </div>
            )}

            <h3>Listado de Usuarios</h3>
            {loading ? (
                <p>Cargando usuarios...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre Completo</th>
                            {/*<th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>*/}
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Usuario</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tipo</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{`${user.nombres} ${user.apel_pat} ${user.apel_mat}`}</td>
                                {/*<td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>*/}
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.usuario}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{USER_TYPE_LABELS[user.tipo] || 'Desconocido'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button onClick={() => startEdit(user)} style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>
                                        Editar
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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

export default UserManagement;