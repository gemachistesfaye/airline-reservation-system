import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function Register() {
  const { showToast } = useToast();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);

  const register = async () => {
    setLoading(true);
    try {
      const res = await registerUser(form);
      showToast(res.message);
      setSuccess(true);
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-animated">
        <div className="w-[450px] glass p-10 rounded-[2rem] text-center">
           <div className="text-6xl mb-6">📧</div>
           <h2 className="text-3xl font-display font-bold text-gray-800 tracking-tight mb-4">Check Your Email</h2>
           <p className="text-gray-500 mb-8 font-medium">We've sent a verification link to your email. Please verify your account to start booking flights.</p>
           <button onClick={() => navigate('/login')} className="text-primary-600 font-bold hover:underline">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-animated py-12">
      
      <div className="w-[450px] glass p-10 rounded-[2rem]">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-gray-800 tracking-tight">Create Account</h2>
          <p className="text-gray-500 mt-2 font-medium">Join AeroSpace and fly into the future.</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <input className="input-premium w-1/2" placeholder="First Name" onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <input className="input-premium w-1/2" placeholder="Last Name" onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>

          <input className="input-premium" placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />

          <input className="input-premium" type="email" placeholder="Email Address" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          
          <input className="input-premium" type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
          
          <input className="input-premium" type="tel" placeholder="Phone Number" onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />

          <input className="input-premium" type="text" placeholder="Passport Number" onChange={(e) => setForm({ ...form, passport_number: e.target.value })} />

          <input className="input-premium" type="date" placeholder="Date of Birth" onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />

          <button
            onClick={register}
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black hover:shadow-xl hover:shadow-gray-900/30 transition-all active:scale-[0.98] mt-4 disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        <p className="text-center text-gray-500 font-medium text-sm mt-8">
          Already a member?
          <span onClick={() => navigate("/login")} className="text-gray-900 font-bold hover:underline cursor-pointer ml-1.5 transition-colors">
            Sign In
          </span>
        </p>

      </div>
    </div>
  );
}