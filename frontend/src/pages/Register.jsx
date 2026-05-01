import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Plane, ArrowRight, ShieldCheck, GraduationCap, FileText, Upload, CheckCircle2 } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    is_student: false
  });
  const [passportFile, setPassportFile] = useState(null);
  const [studentIdFile, setStudentIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!passportFile) return showToast("Passport upload is mandatory", "error");
    if (formData.is_student && !studentIdFile) return showToast("Student ID upload is required", "error");

    setLoading(true);
    try {
      // Use FormData for multipart/form-data
      const data = new FormData();
      data.append("name", formData.name);
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("is_student", formData.is_student ? "1" : "0");
      data.append("passport_file", passportFile);
      if (studentIdFile) data.append("student_id_file", studentIdFile);

      const result = await registerUser(data);

      if (result.status === "success") {
        showToast(result.message);
        navigate("/login");
      } else {
        showToast(result.message, "error");
      }
    } catch (err) {
      showToast("Connection failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 pt-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <Plane size={120} className="rotate-45" />
          </div>

          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Join AeroSpace.</h1>
            <p className="text-gray-500 font-medium mt-2">Create your account to start your journey.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {/* FILE UPLOADS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Passport Copy (Required)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      onChange={(e) => setPassportFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`flex items-center gap-3 px-5 py-4 bg-gray-50 border-2 border-dashed rounded-2xl transition-all ${passportFile ? 'border-primary-600 bg-primary-50/20' : 'border-gray-200 group-hover:border-primary-400'}`}>
                       {passportFile ? <CheckCircle2 className="text-primary-600" size={20}/> : <FileText className="text-gray-400" size={20} />}
                       <span className="text-xs font-bold text-gray-500 truncate">{passportFile ? passportFile.name : "Upload Passport"}</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:border-primary-100 transition-all group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg text-primary-600 border-gray-300 focus:ring-primary-600"
                      checked={formData.is_student}
                      onChange={(e) => setFormData({ ...formData, is_student: e.target.checked })}
                    />
                    <div className="flex items-center gap-2">
                       <GraduationCap size={18} className={formData.is_student ? 'text-primary-600' : 'text-gray-400'} />
                       <span className="text-xs font-bold text-gray-600">I am a Student</span>
                    </div>
                  </label>
               </div>
            </div>

            <AnimatePresence>
              {formData.is_student && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Student ID Copy</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      onChange={(e) => setStudentIdFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`flex items-center gap-3 px-5 py-4 bg-gray-50 border-2 border-dashed rounded-2xl transition-all ${studentIdFile ? 'border-primary-600 bg-primary-50/20' : 'border-gray-200 group-hover:border-primary-400'}`}>
                       {studentIdFile ? <CheckCircle2 className="text-primary-600" size={20}/> : <Upload className="text-gray-400" size={20} />}
                       <span className="text-xs font-bold text-gray-500 truncate">{studentIdFile ? studentIdFile.name : "Upload Student ID"}</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400 ml-4 font-bold uppercase tracking-tighter">* Verify your status for a 20% discount on all flights.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Create Account"} <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-center mt-10 text-gray-500 font-bold text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
