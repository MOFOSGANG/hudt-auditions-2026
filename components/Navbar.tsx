
import React, { useState } from 'react';
import { Page } from '../types';
import { Icons } from '../constants';

interface NavbarProps {
  onNavigate: (page: Page) => void;
  activePage: Page;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', page: Page.HOME },
    { label: 'Apply', page: Page.APPLY },
    { label: 'Check Status', page: Page.CHECK_STATUS },
    { label: 'FAQ', page: Page.FAQ },
    { label: 'Admin', page: Page.ADMIN_LOGIN },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-hudt-dark text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate(Page.HOME)}
        >
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform">
            <span className="text-xl font-bold">🎭</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">HUDT</h1>
            <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Drama Troops</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className={`font-semibold transition-colors hover:text-amber-400 ${activePage === link.page ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white'
                }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-hudt-dark border-t border-purple-800 shadow-xl animate-fade-in-down">
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  onNavigate(link.page);
                  setIsMenuOpen(false);
                }}
                className={`text-left text-lg font-bold p-2 ${activePage === link.page ? 'text-amber-400' : 'text-white'
                  }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
