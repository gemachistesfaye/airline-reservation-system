import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <h1 className="font-display font-bold text-2xl text-gradient tracking-tight flex items-center gap-2 mb-6">
              <span className="text-3xl">✈️</span> AeroSpace
            </h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              Redefining the future of air travel with premium experiences and seamless digital solutions.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-widest">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/flights" className="text-gray-500 hover:text-primary-600 font-medium transition-colors">Flights</Link></li>
              <li><Link to="/dashboard" className="text-gray-500 hover:text-primary-600 font-medium transition-colors">My Bookings</Link></li>
              <li><Link to="/profile" className="text-gray-500 hover:text-primary-600 font-medium transition-colors">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-widest">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-primary-600 font-medium transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 font-medium transition-colors">Safety Info</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 font-medium transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-widest">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-primary-600 font-medium transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 font-medium transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 font-medium transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm font-medium">
            © {new Date().getFullYear()} AeroSpace Airlines. All rights reserved.
          </p>
          <div className="flex gap-6">
             <span className="text-gray-300 hover:text-primary-500 cursor-pointer transition-colors">Twitter</span>
             <span className="text-gray-300 hover:text-primary-500 cursor-pointer transition-colors">Instagram</span>
             <span className="text-gray-300 hover:text-primary-500 cursor-pointer transition-colors">LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
