import React from 'react';
//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './LoginForm'; // Asegúrate de que la ruta sea correcta
import Dashboard from './Dashboard'; // Asegúrate de que la ruta sea correcta
import UserManagement from './UserManagement'; // Asegúrate de que la ruta sea correcta
import SalesManagement from './SalesManagement'; // Importar el nuevo componente
import CollectionManagement from './CollectionManagement'; // Importar el nuevo componente
import AccountStatement from './AccountStatement'; // Importar el nuevo componente
import ConsultaVentas from './ConsultaVentas'; // Importar el nuevo componente
import ConsultaVentasprm from './ConsultaVentasprm'; // Importar el nuevo componente
import ResumenVentas from './ResumenVentas'; // Importar el nuevo componente
import RendicionCta from './RendicionCta'; // Importar el nuevo componente
import ConsultaRendicionCta from './ConsultaRendicionCta'; // Importar el nuevo componente

import ProtectedRoute from "./auth/ProtectedRoute";

import RoleProtectedRoute from "./auth/RoleProtectedRoute";

// Componentes placeholder para las otras opciones del menú
//const VentasEntradas = () => <h2>Módulo de Ventas - Entradas</h2>;
const VentasEntradasPlaceholder = () => <h2>Aquí se gestionarán Ventas - Entradas (listado y creación)</h2>;
const Cobranza = () => <h2>Módulo de Cobranza</h2>;
const EstadoCuenta = () => <h2>Módulo de Estado de Cuenta</h2>;
const ConsultasVentas = () => <h2>Módulo de Consulta de Ventas</h2>;
const PromoVenta = () => <h2>Módulo de Consulta de Ventas x Promoción</h2>;
const ResumenVenta = () => <h2>Módulo de Resumen Ventas</h2>;
const RendicionCtas = () => <h2>Módulo de Rendición de Cuenta</h2>;
const ConsultaRenCtas = () => <h2>Consulta de Rendición de Cuenta</h2>;
const WelcomeDashboard = () => <p>Selecciona una opción del menú.</p>;

function App() {

  return (
    //<Router>
      <Routes>

        {/* PÚBLICO */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 🔐 AUTENTICADO */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}> {/* Ruta principal del dashboard */}

            <Route index element={WelcomeDashboard} />

            {/* 👤 ADMIN + PROMOTOR + USUARIO*/}
            <Route element={<RoleProtectedRoute allowedRoles={[1, 2,3]} />}>
              <Route path="estado-cuenta"element={<AccountStatement />} /> {/* Nueva ruta */}
            </Route>

            {/* 👤 ADMIN + PROMOTOR */}
            <Route element={<RoleProtectedRoute allowedRoles={[1, 2]} />}>
              <Route path="ventas-entradas" element={<SalesManagement />} /> {/* <--- NUEVA RUTA */}           
              <Route path="promo-ventas"element={<ConsultaVentasprm />} /> {/* Nueva ruta */}
              <Route path="cobranza" element={<CollectionManagement />} /> {/* Nueva ruta */}
            </Route>

            {/* 💰 SOLO ADMIN */}
            <Route element={<RoleProtectedRoute allowedRoles={[1]} />}>
              <Route path="users" element={<UserManagement />} /> {/* Formulario CRUD de Usuarios */}
              <Route path="consulta-ventas"element={<ConsultaVentas />} /> {/* Nueva ruta */}
              <Route path="resumen-ventas" element={<ResumenVentas />} />
              <Route path="rendicion-cuenta" element={<RendicionCta />} />
              <Route path="consulta-rend-cuenta" element={<ConsultaRendicionCta />} />
            </Route>

          </Route>
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    //</Router>
  );

}

export default App;