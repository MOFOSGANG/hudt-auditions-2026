
import React from 'react';
import { Page } from '../types';
import { Icons } from '../constants';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-hudt-dark flex flex-center items-center justify-center text-center px-4 overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-500 rounded-full blur-[120px] animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-red-500 rounded-full blur-[80px] animate-bounce"></div>
        </div>

        <div className="relative z-10 max-w-4xl animate-fade-in-up">
          <h1 className="text-5xl md:text-8xl text-white font-black leading-tight mb-4 drop-shadow-2xl">
            Welcome to <span className="text-amber-400 italic">HUDT</span>
          </h1>
          <h2 className="text-2xl md:text-4xl text-amber-200 font-bold mb-4">
            Hallmark University Drama Troops
          </h2>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-10 tracking-wide font-light">
            Where creativity meets excellence. Discover your inner performer and join our award-winning family.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate(Page.APPLY)}
              className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-lg shadow-xl transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Apply Now <span>➜</span>
            </button>
            <button 
              onClick={() => onNavigate(Page.CHECK_STATUS)}
              className="px-10 py-4 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl text-lg shadow-xl transform transition-all hover:scale-105 active:scale-95"
            >
              Check Status
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-purple-900 text-center mb-12">About HUDT</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Hallmark University Drama Troops (HUDT) is the premier performing arts organization on campus, 
                dedicated to theatrical excellence, cultural expression, and creative innovation. 
                Since our founding, we've been a home for talented students to explore their passion for the arts.
              </p>
              <p>
                Our productions have won numerous awards and brought together diverse talents from across the university. 
                Whether you're an experienced performer or just discovering your creative side, HUDT welcomes you with open arms.
              </p>
              <p>
                Join a community where your talents are celebrated, your creativity is nurtured, and lifelong friendships are formed.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img src="https://picsum.photos/600/400?theater" alt="Theater" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Auditions Card */}
      <section className="py-20 bg-hudt-light px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-4 border-amber-500 rounded-[2.5rem] shadow-2xl p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-amber-100 -mr-12 -mt-12 scale-150 transform transition-transform group-hover:scale-[1.7]">
               <Icons.Calendar />
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="bg-purple-100 p-8 rounded-full">
                <div className="text-purple-900"><Icons.Calendar /></div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-4xl font-black text-purple-900 mb-6">Upcoming Auditions</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-3 text-lg font-bold text-gray-700">
                    <span className="text-purple-600"><Icons.Calendar /></span>
                    February 28, 2026
                  </div>
                  <div className="flex items-center gap-3 text-lg font-bold text-gray-700 md:col-span-2">
                    <span className="text-purple-600"><Icons.Location /></span>
                    Auditorium
                  </div>
                </div>
                
                <div className="bg-amber-100 text-amber-800 py-3 px-6 rounded-lg font-bold text-center mb-8">
                  📅 Single Audition Day: February 28, 2026
                </div>
                
                <button 
                  onClick={() => onNavigate(Page.APPLY)}
                  className="w-full md:w-auto px-12 py-4 bg-purple-900 text-white font-black rounded-xl hover:bg-purple-800 transition-colors shadow-lg"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-purple-900 text-center mb-16">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { q: "What is HUDT?", a: "Hallmark University Drama Troops is the premier performing arts organization on campus." },
              { q: "Do I need prior experience?", a: "No prior experience required! We welcome beginners and provide training." },
              { q: "What should I expect at auditions?", a: "Friendly and supportive atmosphere where you can showcase your unique talents." },
              { q: "What's the time commitment?", a: "Typically 2-3 rehearsals per week, adjusting for major productions." },
            ].map((item, i) => (
              <div key={i} className="bg-purple-50 p-6 rounded-2xl border-l-4 border-amber-500 shadow-md">
                <h6 className="font-bold text-purple-900 mb-2">{item.q}</h6>
                <p className="text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button 
              onClick={() => onNavigate(Page.FAQ)}
              className="px-8 py-3 border-2 border-purple-900 text-purple-900 font-bold rounded-xl hover:bg-purple-900 hover:text-white transition-all"
            >
              See All FAQs
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-hudt-dark text-white px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-12">Get In Touch</h2>
          <div className="grid md:grid-cols-3 gap-12 w-full max-w-4xl">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white/10 p-5 rounded-full"><Icons.Mail /></div>
              <h5 className="text-xl font-bold">Email Us</h5>
              <p className="text-amber-300">hudt@hallmarkuniversity.edu</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white/10 p-5 rounded-full"><Icons.Phone /></div>
              <h5 className="text-xl font-bold">Call Us</h5>
              <p className="text-amber-300">+234 123 456 7890</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white/10 p-5 rounded-full">🕒</div>
              <h5 className="text-xl font-bold">Office Hours</h5>
              <p className="text-amber-300">Mon-Fri, 10AM - 4PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
