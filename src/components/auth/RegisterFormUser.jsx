import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import FileUploader from "@/components/common/FileUploader.jsx";

const RegisterFormUser = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
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
        body: JSON.stringify({ ...form, role: "client" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Błąd rejestracji");
      localStorage.setItem("authUser", JSON.stringify(data));
      setAuthUser(data);
      navigate("/dashboard/client");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        placeholder="Imię i nazwisko"
        className="w-full border p-2 rounded"
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Hasło"
        className="w-full border p-2 rounded"
        onChange={handleChange}
        required
      />
      <input
        name="phone"
        placeholder="Telefon"
        className="w-full border p-2 rounded"
        onChange={handleChange}
        required
      />
      <FileUploader onUpload={() => {}} />

      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Zarejestruj się
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};

export default RegisterFormUser;
