import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const location = useLocation();

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
    
    setLastScrollTop(scrollTop);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown')) {
      const dropdowns = document.querySelectorAll('.dropdown ul');
      dropdowns.forEach(menu => menu.style.display = 'none');
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = (e) => {
    e.preventDefault();
    const parentLi = e.target.closest('li.dropdown');
    const dropdownMenu = parentLi.querySelector('ul');
    
    // Close other dropdowns
    document.querySelectorAll('.dropdown ul').forEach(menu => {
      if (menu !== dropdownMenu) {
        menu.style.display = 'none';
      }
    });

    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
  };

  return (
    <header 
      id="header1" 
      className={`header d-flex align-items-center sticky-top ${!isHeaderVisible ? 'header-hidden' : ''}`}
    >
      <div className="container-fluid container-xl position-relative d-flex align-items-center">
        <Link to="/" className="logo d-flex align-items-center me-auto">
          <h1 className="sitename">STAMPING</h1>
        </Link>

        <nav id="navmenu" className={`navmenu ${isMobileMenuOpen ? 'mobile-nav-active' : ''}`}>
          <ul>
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                About
              </Link>
            </li>
            {/* <li>
              <Link to="/courses" className={location.pathname === '/courses' ? 'active' : ''}>
                Courses
              </Link>
            </li> */}
            {/* <li>
              <Link to="/educators" className={location.pathname === '/educators' ? 'active' : ''}>
                Educators
              </Link>
            </li> */}
            {/* <li>
              <Link to="/library" className={location.pathname === '/library' ? 'active' : ''}>
                Library
              </Link>
            </li> */}
            <li>
              <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>
                Services
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className={location.pathname === '/login' ? 'active' : ''}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/stamps" className={location.pathname === '/login' ? 'active' : ''}>
                Stamps
              </Link>
            </li>
            
            
          </ul>
        </nav>

        <button
          className="mobile-nav-toggle d-xl-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <Link to="/login" className="login">
          Login
        </Link>
        <Link to="/register" className="signin">
          Register
        </Link>
      </div>
    </header>
  );
};

export default Header;