import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import BannerUpload from "../components/BannerUpload";
import { useAuth } from "@/context/AuthContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Button } from "@/components/ui/button.jsx";

const EditProfile = () => {
  const { authUser, token } = useAuth();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);
  const theme = useTheme?.();

  const ui = {
    page: `flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6 ${theme?.classes?.page || ""}`.trim(),
    card: `bg-white p-8 rounded-xl shadow-lg w-full max-w-5xl ${theme?.classes?.card || ""}`.trim(),
    title: "text-3xl font-bold text-center text-blue-700 mb-8",
    field: "space-y-1",
    label: "text-sm font-medium",
    btnPrimary: `w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-lg transition ${theme?.classes?.button || ""}`.trim(),
  };

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    description: "",
    logo: null,
  });
  const [banner, setBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "edit_profile_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const issues = [];
    if (!formData.companyName.trim()) issues.push(t("profile.companyRequired", "Nazwa firmy jest wymagana"));
    if (!formData.email.trim()) issues.push(t("profile.emailRequired", "Email jest wymagany"));
    return issues;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) {
      errs.forEach((m) => toast.error(m));
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("companyName", formData.companyName);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("description", formData.description);
      if (formData.logo) fd.append("logo", formData.logo);
      if (banner) fd.append("banner", banner);

      const authHeader =
        token ||
        authUser?.token ||
        (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);
      await axios.post("/api/company/profile", fd, {
        headers: {
          ...(authHeader ? { Authorization: `Bearer ${authHeader}` } : {}),
        },
      });

      toast.success(t("profile.saved", "Profil firmy został zapisany!"));
    } catch {
      toast.error(t("profile.saveError", "Błąd zapisu profilu"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!authUser) return null;

  return (
    <div className={ui.page} data-screen="edit-profile">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={ui.card}
      >
        <h2 className={ui.title}>{t("profile.editTitle", "Edytuj Profil Firmy")}</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <BannerUpload banner={banner} setBanner={setBanner} />

          <div className={ui.field}>
            <label htmlFor="companyName" className={ui.label}>
              {t("profile.companyName", "Nazwa firmy")}
            </label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder={t("profile.companyPh", "np. Allrento Sp. z o.o.")}
              aria-required="true"
            />
          </div>

          <div className={ui.field}>
            <label htmlFor="email" className={ui.label}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@firma.pl"
              aria-required="true"
            />
          </div>

          <div className={ui.field}>
            <label htmlFor="phone" className={ui.label}>
              {t("profile.phone", "Telefon")}
            </label>
            <Input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("profile.phonePh", "np. +48 600 000 000")}
            />
          </div>

          <div className={ui.field}>
            <label htmlFor="description" className={ui.label}>
              {t("profile.description", "Opis działalności")}
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("profile.descriptionPh", "Krótki opis firmy...")}
              rows={4}
            />
          </div>

          <div className={ui.field}>
            <label htmlFor="logo" className={ui.label}>
              {t("profile.logo", "Logo (plik)")}
            </label>
            <Input id="logo" name="logo" type="file" accept="image/*" onChange={handleChange} />
          </div>

          <Button type="submit" className={ui.btnPrimary} disabled={submitting} aria-busy={submitting ? "true" : "false"}>
            {submitting ? t("common.saving", "Zapisywanie...") : t("profile.save", "Zapisz profil")}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfile;
