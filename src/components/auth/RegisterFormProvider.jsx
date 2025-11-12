import React, { useState } from 'react';
import FileUploader from "@/components/common/FileUploader.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

const RegisterFormProvider = () => {
  const [form, setForm] = useState({ companyName: "", email: "", password: "", phone: "", taxId: "" });
  const [error, setError] = useState("");
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.companyName,
          phone: form.phone,
          taxId: form.taxId,
          role: "provider",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Błąd rejestracji firmy");
      localStorage.setItem("authUser", JSON.stringify(data));
      setAuthUser(data);
      navigate("/dashboard/provider");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="companyName" placeholder="Nazwa firmy" className="w-full border p-2 rounded" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email firmowy" className="w-full border p-2 rounded" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Hasło" className="w-full border p-2 rounded" onChange={handleChange} required />
      <input name="phone" placeholder="Telefon kontaktowy" className="w-full border p-2 rounded" onChange={handleChange} />
      <input name="taxId" placeholder="NIP firmy" className="w-full border p-2 rounded" onChange={handleChange} />
      <FileUploader onUpload={() => {}} />
      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Zarejestruj firmę</button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};

export default RegisterFormProvider;
