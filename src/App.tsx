import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import CenterSignup from './pages/CenterSignup';
import RadiologistSignup from './pages/RadiologistSignup';
import CreateCase from './pages/CreateCase';
import CasesList from './pages/CasesList';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="min-h-screen bg-gray-50 p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/center/signup" element={<CenterSignup />} />
            <Route path="/radiologist/signup" element={<RadiologistSignup />} />
            <Route path="/cases" element={<CasesList />} />
            <Route path="/case/create" element={<CreateCase />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;