import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Plane, ArrowRight } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    fetch(`http://localhost/airline-reservation-system/backend/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Connection error. Please try again later.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 pt-32">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <Plane size={120} className="rotate-45" />
          </div>

          {status === "loading" && (
            <div className="py-12">
              <Loader2 className="w-20 h-20 text-primary-600 animate-spin mx-auto mb-6" />
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Verifying...</h1>
              <p className="text-gray-500 font-medium mt-2">Securing your AeroSpace account.</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-12">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Email Verified!</h1>
              <p className="text-gray-500 font-medium mt-2 mb-10">{message}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black hover:bg-primary-600 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
              >
                Go to Login <ArrowRight size={20} />
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="py-12">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg">
                <XCircle size={40} />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Verification Failed</h1>
              <p className="text-gray-500 font-medium mt-2 mb-10">{message}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-gray-50 text-gray-900 py-5 rounded-[2rem] font-black hover:bg-gray-100 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
