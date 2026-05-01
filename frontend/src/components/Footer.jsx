import { Link } from "react-router-dom";
import { Plane, Mail, MapPin, Phone, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">
          
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-4 group mb-8">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-primary-600 transition-all duration-500">
                <Plane size={24} className="rotate-[-45deg]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-1">AeroSpace</h1>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Premium Airlines</p>
              </div>
            </Link>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">
              Redefining the gold standard of air travel through innovative digital experiences and bespoke sky-service.
            </p>
            <div className="flex gap-4">
               {[Globe, Globe, Globe, Globe].map((Icon, i) => (
                 <a key={i} href="#" className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all active:scale-90">
                    <Icon size={18} />
                 </a>
               ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-8 uppercase text-[10px] tracking-[0.3em]">Navigation</h4>
            <ul className="space-y-4">
              <li><Link to="/flights" className="text-gray-500 hover:text-primary-600 font-bold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> Flight Fleet</Link></li>
              <li><Link to="/dashboard" className="text-gray-500 hover:text-primary-600 font-bold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> My Journeys</Link></li>
              <li><Link to="/profile" className="text-gray-500 hover:text-primary-600 font-bold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> Account Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-8 uppercase text-[10px] tracking-[0.3em]">Corporate</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-primary-600 font-bold transition-colors">Safety Protocols</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 font-bold transition-colors">Global Partners</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 font-bold transition-colors">Sustainability</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 font-bold transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-8 uppercase text-[10px] tracking-[0.3em]">Contact Center</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0"><Phone size={18}/></div>
                 <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Support</p><p className="font-black text-gray-900">+1 (800) AERO-SKY</p></div>
              </li>
              <li className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0"><Mail size={18}/></div>
                 <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inquiries</p><p className="font-black text-gray-900">concierge@aerospace.com</p></div>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
             <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
          </div>
          <p className="text-gray-400 text-xs font-bold">
            © {new Date().getFullYear()} AeroSpace Airlines Group. Established for Excellence.
          </p>
        </div>
      </div>
    </footer>
  );
}
