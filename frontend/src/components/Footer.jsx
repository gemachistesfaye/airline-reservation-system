import { Link } from "react-router-dom";
import { Plane } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* BRAND */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-all">
            <Plane size={20} className="rotate-[-45deg]" />
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tighter leading-none">AeroSpace</h1>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Premium Airlines</p>
          </div>
        </Link>

        {/* COPYRIGHT */}
        <p className="text-gray-400 text-[11px] font-bold">
          © {new Date().getFullYear()} AeroSpace Airlines. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
