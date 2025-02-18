import React from 'react'
import Home from './pages/Home'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import VerifyOTP from './pages/VerifyOTP'
import QRCodeGenerator from './components/DocumentDetails/QRCodeGenerator'
import SerialNumber from './components/DocumentDetails/SerialNumber'
import VerificationPage from './pages/VerificationPage';
import About from './pages/About'
import ServicesPage from './pages/ServicesPage'
import Footer from './components/Footer'
import StampDashboard from './pages/StampDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/header' element={<Header/>}/>
        <Route path='/forgotpassword' element={<ForgotPassword/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/verify-otp' element={<VerifyOTP/>}/>
        <Route path='/qrcode' element={<QRCodeGenerator/>}/>
        <Route path='/serial' element={<SerialNumber/>}/>
        <Route path="/verify-document" element={<VerificationPage />} />
        <Route path='/about' element={<About/>}/>
        <Route path='/services' element={<ServicesPage/>}/>
        <Route path='/footer' element={<Footer/>}/>
        <Route path='/stamps' element={<StampDashboard/>}/>
        <Route path='/adminDashboard' element={<AdminDashboard/>}/>






    </Routes>
    </BrowserRouter>
  )
}

export default App
