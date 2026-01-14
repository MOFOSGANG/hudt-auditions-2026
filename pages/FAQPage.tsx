
import React, { useState } from 'react';
import { Page } from '../types';
import { Icons } from '../constants';

interface FAQPageProps {
  onNavigate: (page: Page) => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onNavigate }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "What is HUDT?", a: "Hallmark University Drama Troops (HUDT) is the premier performing arts organization on campus, dedicated to theatrical excellence and cultural expression." },
    { q: "Who can apply to HUDT?", a: "All Hallmark University students are welcome to apply, regardless of experience level or department." },
    { q: "What should I expect at auditions?", a: "Auditions are friendly and supportive! You'll have the opportunity to showcase your talents in a welcoming environment, possibly reading a short script or performing a prepared piece." },
    { q: "Do I need prior performance experience?", a: "No prior experience required! We welcome beginners and provide comprehensive training in acting, dancing, and technical skills." },
    { q: "What's the time commitment?", a: "Rehearsals typically run 2-3 times per week. Frequency increases during 'Hell Week'—the week leading up to a major production." },
    { q: "What are the benefits of joining?", a: "Skill development, leadership opportunities, networking, spectacular performances, and lifelong friendships." },
    { q: "When are rehearsals held?", a: "We maintain a flexible schedule, usually in the late afternoons or weekends, adjusted to accommodate academic timetables." },
    { q: "How are members selected?", a: "Selection is based on a mix of raw talent, enthusiasm, commitment, and how well you fit our community culture." },
    { q: "Can I join if I'm in my final year?", a: "Absolutely! We value the maturity and experience final year students bring to our productions." },
    { q: "What if I have multiple talents?", a: "That's fantastic! Many of our members contribute in multiple areas, like acting and set design. We love versatility!" }
  ];

  return (
    <div className="bg-hudt-light min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
        <h2 className="text-5xl font-black text-purple-900 text-center mb-16">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
           {faqs.map((faq, i) => (
             <div key={i} className="bg-white rounded-2xl shadow-lg border-l-8 border-purple-600 overflow-hidden transition-all duration-300">
               <button 
                 onClick={() => setOpenIndex(openIndex === i ? null : i)}
                 className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-4 group"
               >
                 <span className="text-xl md:text-2xl font-black text-purple-900 group-hover:text-amber-600 transition-colors">{faq.q}</span>
                 <span className={`text-2xl transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-amber-500' : 'text-purple-400'}`}>
                   ▼
                 </span>
               </button>
               
               <div className={`transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                 <div className="p-8 pt-0 text-gray-600 text-lg leading-relaxed border-t border-gray-50 italic">
                   {faq.a}
                 </div>
               </div>
             </div>
           ))}
        </div>

        <div className="bg-hudt-dark rounded-[2.5rem] p-10 text-white text-center shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-full bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <h3 className="text-3xl font-black mb-4">Still Have Questions?</h3>
           <p className="text-purple-200 mb-10 text-lg font-medium">We're here to help! Reach out to us anytime and we'll get back to you.</p>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
              <div className="flex items-center gap-3">
                 <span className="p-3 bg-white/10 rounded-full"><Icons.Mail /></span>
                 <span className="font-bold">hudt@hallmarkuniversity.edu</span>
              </div>
              <div className="flex items-center gap-3">
                 <span className="p-3 bg-white/10 rounded-full"><Icons.Phone /></span>
                 <span className="font-bold">+234 123 456 7890</span>
              </div>
           </div>
           
           <button 
             onClick={() => onNavigate(Page.HOME)}
             className="px-12 py-4 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition-all shadow-xl transform hover:scale-105"
           >
             Return Home
           </button>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
