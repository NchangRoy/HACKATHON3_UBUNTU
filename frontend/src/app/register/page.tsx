"use client";
import Link from "next/link";
import { useState } from "react";

const C = {
  blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
  red50: "#fef2f2", red200: "#fecaca", red600: "#dc2626",
};

type Role = "CITIZEN" | "JOURNALIST" | "MODERATOR";

const ROLES: { value: Role; icon: React.ReactNode; label: string; desc: string }[] = [
  {
    value: "CITIZEN",
    label: "Citoyen",
    desc: "Soumettre des signalements et consulter les verdicts",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  },
  {
    value: "JOURNALIST",
    label: "Journaliste",
    desc: "Ajouter des preuves sourcées et enrichir les claims",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  },
  {
    value: "MODERATOR",
    label: "Modérateur",
    desc: "Rendre des verdicts et gérer la file de traitement",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  },
];

function Logo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size,
        background: C.slate900, borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontWeight: 700, fontSize: 16, color: C.slate900, letterSpacing: "-0.3px" }}>FakeCheckAI</span>
    </div>
  );
}

function Field({ id, label, type = "text", value, onChange, placeholder, error, half }: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; error?: string; half?: boolean;
}) {
  return (
    <div style={{ flex: half ? "1 1 calc(50% - 6px)" : "1 1 100%" }}>
      <label htmlFor={id} style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.slate700, marginBottom: 6 }}>{label}</label>
      <input
        id={id} type={type} value={value} required
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "8px 12px",
          border: `1px solid ${error ? C.red200 : C.slate300}`, borderRadius: 6,
          fontSize: 14, color: C.slate900, outline: "none", background: "#fff",
          transition: "border-color .15s, box-shadow .15s",
        }}
        onFocus={e => { e.target.style.borderColor = error ? C.red600 : C.blue600; e.target.style.boxShadow = `0 0 0 3px ${error ? "#fca5a520" : "#2563eb15"}`; }}
        onBlur={e => { e.target.style.borderColor = error ? C.red200 : C.slate300; e.target.style.boxShadow = "none"; }}
      />
      {error && <p style={{ fontSize: 12, color: C.red600, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ fullName: "", email: "", roleType: "Individu", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const step1Valid = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Requis";
    if (!form.email.includes("@")) e.email = "Email invalide";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.password.length < 8) er.password = "Minimum 8 caractères";
    if (form.password !== form.confirm) er.confirm = "Les mots de passe ne correspondent pas";
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#fff", position: "relative" }}>
      {/* Bouton Retour (Top Right) */}
      <Link href="/" style={{
        position: "fixed", top: 12, right: 12, zIndex: 100,
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px", background: "rgba(255,255,255,0.8)", 
        backdropFilter: "blur(12px)", border: `1px solid ${C.slate200}`,
        borderRadius: 12, textDecoration: "none", color: C.slate700,
        fontSize: 12, fontWeight: 700, transition: "all .2s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.8)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour
      </Link>

      {/* ── Colonne gauche ── */}
      <div id="register-sidebar" style={{
        display: "none", width: "40%", flexShrink: 0,
        background: C.slate900,
        padding: "48px", flexDirection: "column", justifyContent: "space-between",
        position: "relative",
      }}>
        {/* Subtle grid pattern background */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.05,
          backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>FakeCheckAI</span>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 14 }}>
            Rejoignez la<br />communauté du<br />fact-checking.
          </h1>
          <p style={{ color: C.slate400, fontSize: 14, lineHeight: 1.7, maxWidth: 300, marginBottom: 36 }}>
            Citoyen, journaliste ou modérateur — chaque acteur joue un rôle précis dans la vérification collaborative.
          </p>
          {/* Stepper */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[{ n: 1, label: "Identité et structure" }, { n: 2, label: "Rôle et authentification" }].map(s => (
              <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  border: step >= s.n ? "1.5px solid #2563eb" : "1.5px solid #334155",
                  background: step > s.n ? "#2563eb" : step === s.n ? "rgba(37,99,235,0.2)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: step > s.n ? "#fff" : step === s.n ? "#2563eb" : C.slate500, fontWeight: 600, fontSize: 11,
                }}>
                  {step > s.n ? (
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.n}
                </div>
                <span style={{ fontSize: 13, fontWeight: step === s.n ? 600 : 500, color: step >= s.n ? "#fff" : C.slate500 }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ color: C.slate500, fontSize: 12, position: "relative" }}>Hackathon Sujet 11 — Social & Civic Tech © 2026</p>
      </div>

      {/* ── Colonne droite ── */}
      <div style={{ 
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", 
        padding: "32px 24px", background: C.slate50,
        backgroundImage: `radial-gradient(${C.slate300} 2px, transparent 2px)`,
        backgroundSize: "24px 24px"
      }}>
        <div style={{ width: "100%", maxWidth: 440, background: "#fff", padding: 32, borderRadius: 8, border: `1px solid ${C.slate200}`, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ marginBottom: 32 }}>
            <Logo />

            <div style={{ display: "flex", gap: 4, marginBottom: 24, marginTop: 28 }}>
              {[1, 2].map(n => (
                <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= n ? C.blue600 : C.slate100, transition: "background .3s" }} />
              ))}
            </div>

            <p style={{ fontSize: 12, fontWeight: 600, color: C.blue600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Étape {step} sur 2</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.slate900, letterSpacing: "-0.3px" }}>
              {step === 1 ? "Informations personnelles" : "Définition du profil"}
            </h2>
            <p style={{ fontSize: 13, color: C.slate500, marginTop: 4 }}>
              {step === 1 ? "Renseignez votre identité pour l'auditabilité des actions." : "Sélectionnez votre niveau d'habilitation."}
            </p>
          </div>

          {/* ── ÉTAPE 1 ── */}
          {step === 1 && (
            <form onSubmit={e => { e.preventDefault(); if (step1Valid()) setStep(2); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field id="fullName" label="Nom complet" value={form.fullName} onChange={v => set("fullName", v)} placeholder="Jean Dupont" error={errors.fullName} />
              <Field id="email" label="Adresse email" type="email" value={form.email} onChange={v => set("email", v)} placeholder="nom@exemple.com" error={errors.email} />
              <div>
                <label htmlFor="roleType" style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.slate700, marginBottom: 6 }}>
                  Rôle
                </label>
                <select
                  id="roleType" value={form.roleType}
                  onChange={e => set("roleType", e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.slate300}`, borderRadius: 6, fontSize: 14, color: C.slate900, outline: "none", background: "#fff", cursor: "pointer" }}
                  onFocus={e => { e.target.style.borderColor = C.blue600; e.target.style.boxShadow = "0 0 0 3px #2563eb15"; }}
                  onBlur={e => { e.target.style.borderColor = C.slate300; e.target.style.boxShadow = "none"; }}
                >
                  <option value="Individu">Individu</option>
                  <option value="Organisation">Organisation</option>
                </select>
              </div>
              <button type="submit" style={{
                width: "100%", marginTop: 8, padding: "10px", background: C.slate900,
                color: "#fff", borderRadius: 6, fontWeight: 600, fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                border: "none", cursor: "pointer", transition: "background .15s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.slate800}
                onMouseLeave={e => e.currentTarget.style.background = C.slate900}
              >
                Continuer
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          )}

          {/* ── ÉTAPE 2 ── */}
          {step === 2 && (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Mot de passe */}
              <div style={{ marginTop: 8 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.slate700, marginBottom: 6 }}>Mot de passe d'accès</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password" type={showPwd ? "text" : "password"} value={form.password} required
                    onChange={e => set("password", e.target.value)}
                    placeholder="Minimum 8 caractères"
                    style={{ width: "100%", padding: "8px 36px 8px 12px", border: `1px solid ${errors.password ? C.red200 : C.slate300}`, borderRadius: 6, fontSize: 14, outline: "none" }}
                    onFocus={e => { e.target.style.borderColor = errors.password ? C.red600 : C.blue600; e.target.style.boxShadow = `0 0 0 3px ${errors.password ? "#fca5a520" : "#2563eb15"}`; }}
                    onBlur={e => { e.target.style.borderColor = errors.password ? C.red200 : C.slate300; e.target.style.boxShadow = "none"; }}
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", lineHeight: 0, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.slate400} strokeWidth={2}>
                      {showPwd
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 12, color: C.red600, marginTop: 4 }}>{errors.password}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.slate700, marginBottom: 6 }}>Confirmer le mot de passe</label>
                <input
                  id="confirm" type="password" value={form.confirm} required
                  onChange={e => set("confirm", e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "8px 12px", border: `1px solid ${errors.confirm ? C.red200 : C.slate300}`, borderRadius: 6, fontSize: 14, outline: "none" }}
                  onFocus={e => { e.target.style.borderColor = errors.confirm ? C.red600 : C.blue600; e.target.style.boxShadow = `0 0 0 3px ${errors.confirm ? "#fca5a520" : "#2563eb15"}`; }}
                  onBlur={e => { e.target.style.borderColor = errors.confirm ? C.red200 : C.slate300; e.target.style.boxShadow = "none"; }}
                />
                {errors.confirm && <p style={{ fontSize: 12, color: C.red600, marginTop: 4 }}>{errors.confirm}</p>}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setStep(1)} style={{
                  flex: 1, padding: "10px", border: `1px solid ${C.slate300}`, borderRadius: 6,
                  fontWeight: 600, fontSize: 14, color: C.slate700, background: "#fff", cursor: "pointer"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.slate400; e.currentTarget.style.background = C.slate50; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.slate300; e.currentTarget.style.background = "#fff"; }}
                >
                  ← Retour
                </button>
                <button id="register-submit" type="submit" disabled={loading} style={{
                  flex: 2, padding: "10px", background: loading ? C.slate300 : C.blue600,
                  color: "#fff", borderRadius: 6, fontWeight: 600, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  cursor: loading ? "not-allowed" : "pointer", border: "none"
                }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.blue700; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.blue600; }}
                >
                  {loading ? (
                    <><svg style={{ animation: "spin .8s linear infinite" }} width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                    </svg>Création…</>
                  ) : "Créer l'accès"}
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: "center", fontSize: 13, color: C.slate500, marginTop: 24, borderTop: `1px solid ${C.slate200}`, paddingTop: 20 }}>
            Déjà inscrit ?{" "}
            <Link href="/login" style={{ color: C.slate900, fontWeight: 600, textDecoration: "none" }}>Ouvrir une session</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) { #register-sidebar { display: flex !important; } }
      `}</style>
    </div>
  );
}
