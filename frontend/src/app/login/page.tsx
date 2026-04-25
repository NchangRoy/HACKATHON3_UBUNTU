"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/api";
import { setAuthToken } from "@/services/api-client";

const C = {
  blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
  red50: "#fef2f2", red200: "#fecaca", red600: "#dc2626",
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.slate400} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.slate400} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

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
      <span style={{ fontWeight: 700, fontSize: 16, color: C.slate900, letterSpacing: "-0.3px" }}>FakeCheck</span>
    </div>
  );
}

function InputField({
  id, label, type = "text", value, onChange, placeholder, error, hint, suffix
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  error?: string; hint?: React.ReactNode; suffix?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: C.slate700 }}>{label}</label>
        {hint}
      </div>
      <div style={{ position: "relative" }}>
        <input
          id={id} type={type} value={value} required
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "8px 12px",
            paddingRight: suffix ? 36 : 12,
            border: `1px solid ${error ? C.red200 : C.slate300}`,
            borderRadius: 6, fontSize: 14, color: C.slate900,
            outline: "none", background: "#fff",
            transition: "border-color .15s, box-shadow .15s",
          }}
          onFocus={e => { e.target.style.borderColor = error ? C.red600 : C.blue600; e.target.style.boxShadow = `0 0 0 3px ${error ? "#fca5a520" : "#2563eb15"}`; }}
          onBlur={e => { e.target.style.borderColor = error ? C.red200 : C.slate300; e.target.style.boxShadow = "none"; }}
        />
        {suffix && (
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
            {suffix}
          </div>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: C.red600 }}>{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered")) {
      setSuccess("Compte créé avec succès ! Connectez-vous pour continuer.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Veuillez remplir tous les champs obligatoires."); return; }

    setLoading(true);
    try {
      const response = await AuthService.postApiAuthLogin({ email, password });
      if (response.success && response.token) {
        setAuthToken(response.token);

        // Stocker les infos utilisateur de base
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));

          // Redirection basée sur le rôle
          const role = response.user.role;
          if (role === "individual" || role === "organization") {
            router.push("/profile");
          } else {
            router.push("/moderateur/dashboard");
          }
        } else {
          router.push("/");
        }
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    } catch (err: any) {
      console.error(err);
      const detail = err.body?.message || err.body?.detail || (typeof err.body === 'string' ? err.body : null);
      setError(detail || "Identifiants invalides. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
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

      {/* ── Colonne gauche (branding) ── */}
      <div id="login-sidebar" style={{
        display: "none", width: "40%", flexShrink: 0,
        background: C.slate900,
        padding: "48px",
        flexDirection: "column",
        justifyContent: "space-between",
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
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>FakeCheck</span>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 16 }}>
            La vérité,<br />documentée<br />et traçable.
          </h1>
          <p style={{ color: C.slate400, fontSize: 14, lineHeight: 1.6, maxWidth: 320, marginBottom: 40 }}>
            Plateforme collaborative de fact-checking. Sécurisée, versionnée et entièrement auditable.
          </p>

          <div style={{ display: "flex", gap: 32, borderTop: `1px solid ${C.slate800}`, paddingTop: 24 }}>
            {[["98%", "Précision ML"], ["< 2s", "Temps réel"], ["100%", "Auditabilité"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{v}</div>
                <div style={{ fontSize: 12, color: C.slate400, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: C.slate500, fontSize: 12, position: "relative" }}>
          Hackathon Sujet 11 — Social & Civic Tech © 2026
        </p>
      </div>

      {/* ── Colonne droite (formulaire) ── */}
      <main style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "32px 24px", background: C.slate50,
        backgroundImage: `radial-gradient(${C.slate300} 2px, transparent 2px)`,
        backgroundSize: "24px 24px"
      }}>
        <div style={{ width: "100%", maxWidth: 360, background: "#fff", padding: 32, borderRadius: 8, border: `1px solid ${C.slate200}`, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ marginBottom: 32 }}>
            <Logo />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.slate900, letterSpacing: "-0.3px", marginTop: 24 }}>
              Connexion à l'espace
            </h2>
            <p style={{ color: C.slate500, fontSize: 13, marginTop: 4 }}>
              Veuillez saisir vos identifiants d'accès.
            </p>
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: C.red50, border: `1px solid ${C.red200}`, borderRadius: 6,
              padding: "10px 12px", marginBottom: 20,
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.red600} strokeWidth={2.5} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ fontSize: 13, color: C.red600, fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6,
              padding: "10px 12px", marginBottom: 20,
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span style={{ fontSize: 13, color: "#166534", fontWeight: 500 }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <InputField
              id="email" label="Adresse email professionnelle" type="email"
              value={email} onChange={setEmail} placeholder="nom@organisation.com"
            />

            <InputField
              id="password" label="Mot de passe"
              type={showPwd ? "text" : "password"}
              value={password} onChange={setPassword} placeholder="••••••••"
              hint={
                <Link href="/forgot-password" style={{ fontSize: 12, color: C.blue600, fontWeight: 500, textDecoration: "none" }}>
                  Mot de passe oublié ?
                </Link>
              }
              suffix={
                <button type="button" onClick={() => setShowPwd(s => !s)} style={{ lineHeight: 0, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <EyeIcon open={showPwd} />
                </button>
              }
            />

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: -4 }}>
              <input type="checkbox" style={{ width: 14, height: 14, accentColor: C.blue600, cursor: "pointer", borderRadius: 4 }} />
              <span style={{ fontSize: 13, color: C.slate600 }}>Maintenir la connexion</span>
            </label>

            <button
              id="login-submit" type="submit" disabled={loading}
              style={{
                width: "100%", padding: "10px", background: loading ? C.slate300 : C.slate900,
                color: "#fff", borderRadius: 6, fontWeight: 600, fontSize: 14,
                marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all .15s", cursor: loading ? "not-allowed" : "pointer",
                border: "none", boxShadow: loading ? "none" : `0 4px 12px ${C.slate900}20`
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = C.slate800); }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = C.slate900); }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin .8s linear infinite" }} width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M22 12a10 10 0 00-10-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Authentification…
                </>
              ) : "Se connecter"}
            </button>
          </form>

          {/* Démo rapide */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.slate200}` }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.slate500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Accès de démonstration</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { href: "/moderateur/dashboard", label: "Modérateur", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
                { href: "/", label: "Citoyen", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /> },
              ].map(b => (
                <Link
                  key={b.href} href={b.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 10px", border: `1px solid ${C.slate200}`, borderRadius: 6,
                    fontSize: 12, fontWeight: 500, color: C.slate700,
                    transition: "all .1s", textDecoration: "none", background: "#fff"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.slate300; e.currentTarget.style.background = C.slate50; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.slate200; e.currentTarget.style.background = "#fff"; }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.slate500} strokeWidth={2}>
                    {b.icon}
                  </svg>
                  {b.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: C.slate500, marginTop: 24 }}>
          Aucun accès ?{" "}
          <Link href="/register" style={{ color: C.slate900, fontWeight: 600, textDecoration: "none" }}>Demander un compte</Link>
        </p>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) { #login-sidebar { display: flex !important; } }
      `}</style>
    </div>
  );
}
