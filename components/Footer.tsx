
import React from 'react';
import { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-hudt-dark text-white border-t-4 border-amber-500 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 mb-16">
        {/* Brand */}
        <div className="space-y-4">
           <div 
             className="flex items-center gap-2 cursor-pointer" 
             onClick={() => onNavigate(Page.HOME)}
           >
             <span className="text-4xl">🎭</span>
             <div>
                <h1 className="text-3xl font-black tracking-tighter leading-none">HUDT</h1>
                <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">Drama Troops</p>
             </div>
           </div>
           <p className="text-purple-200 text-sm leading-relaxed max-w-xs">
              Hallmark University's premier performing arts community. Building stars, creating magic, and nurturing talent since our inception.
           </p>
        </div>

        {/* Quick Links */}
        <div>
           <h4 className="text-xl font-bold mb-6 text-amber-400">Quick Links</h4>
           <ul className="space-y-3">
              {[
                { label: 'Home', page: Page.HOME },
                { label: 'Apply Now', page: Page.APPLY },
                { label: 'Application Status', page: Page.CHECK_STATUS },
                { label: 'FAQ', page: Page.FAQ }
              ].map((link, i) => (
                <li key={i}>
                   <button 
                     onClick={() => onNavigate(link.page)}
                     className="text-purple-100 hover:text-amber-400 transition-colors font-medium flex items-center gap-2"
                   >
                     <span className="opacity-50">➜</span> {link.label}
                   </button>
                </li>
              ))}
           </ul>
        </div>

        {/* Contact */}
        <div>
           <h4 className="text-xl font-bold mb-6 text-amber-400">Contact</h4>
           <p className="text-xs text-purple-300 font-medium mb-4">Hallmark University Campus</p>
           <p className="text-xs text-purple-300 font-medium">hudt@hallmarkuniversity.edu</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-purple-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-purple-400 uppercase tracking-widest">
         <p>Created By HUDT &copy; 2026</p>
         <div className="flex gap-6">
            <button className="hover:text-amber-400">Privacy Policy</button>
            <button className="hover:text-amber-400">Terms of Use</button>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
