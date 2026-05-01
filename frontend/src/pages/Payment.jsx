import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, CheckCircle2, ArrowLeft, Lock } from "lucide-react";
import { processPayment } from "../services/api";

export default function Payment() {
  const { booking_id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const res = await processPayment(booking_id);
      setSuccess(true);
      showToast(res.message || "Payment successful.");
    } catch (err) {
      showToast(err.message || "Payment service unavailable", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Payment Confirmed!</h1>
          <p className="text-gray-500 mb-10">Your seat is now officially reserved. Welcome aboard AeroSpace.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold">View My Electronic Ticket</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold mb-8 hover:text-gray-900 transition-all">
          <ArrowLeft size={18}/> Cancel & Return
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-10">
             <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center"><CreditCard size={24}/></div>
             <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-full">
                <ShieldCheck size={14}/> Secure Terminal
             </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">Secure Checkout</h2>
          <p className="text-gray-400 font-medium text-sm mb-10">Finalize your reservation for Booking #{booking_id}</p>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Payment Method</p>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-gray-900 rounded flex items-center justify-center text-[8px] font-black text-white italic">VISA</div>
                    <span className="font-bold text-gray-900">Stored Virtual Card</span>
                  </div>
                  <span className="text-gray-400 text-xs font-bold">**** 8821</span>
               </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                disabled={processing}
                onClick={handlePayment}
                className="w-full bg-primary-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {processing ? "Processing Transaction..." : (
                  <>Authorize Payment <Lock size={18}/></>
                )}
              </button>
              <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-black flex items-center justify-center gap-2">
                <ShieldCheck size={12}/> Verified by AeroShield™ 256-Bit
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
