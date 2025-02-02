import React from 'react'
import Home from './pages/Home'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import StampingPage from './pages/StampingPage'
import VerifyOTP from './pages/VerifyOTP'
import QRCodeGenerator from './components/DocumentDetails/QRCodeGenerator'
import SerialNumber from './components/DocumentDetails/SerialNumber'
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
        <Route path='/stamps' element={<StampingPage/>}/>
        <Route path='/verify-otp' element={<VerifyOTP/>}/>
        <Route path='/qrcode' element={<QRCodeGenerator/>}/>
        <Route path='/serial' element={<SerialNumber/>}/>


    </Routes>
    </BrowserRouter>
  )
}

export default App
