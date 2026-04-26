"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, setAuthToken } from "@/services/api-client";

const C = {
  blue600: "#2563eb", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569",
  slate700: "#334155", slate800: "#1e293b", slate900: "#0f172a",
  green600: "#16a34a", green50: "#f0fdf4",
  orange600: "#ea580c", orange50: "#fff7ed",
  purple600: "#9333ea", purple50: "#faf5ff",
};

const steps = [
  {
    num: "T1", title: "Triage", color: C.blue600, bg: C.blue50,
    desc: "La rumeur est reçue et soumise à un score de crédibilité ML initial. Le système TWIST-01 évalue la véracité prédictive et assigne une priorité de traitement.",
    icon: "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
  },
  {
    num: "T2", title: "Atomisation", color: C.purple600, bg: C.purple50,
    desc: "La rumeur est décomposée en claims atomiques vérifiables individuellement. Chaque affirmation constitue une unité d'analyse indépendante avec son propre cycle de vie.",
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
  },
  {
    num: "T3", title: "Collecte de preuves", color: C.orange600, bg: C.orange50,
    desc: "Les preuves sont collectées avec une triple horodatation : t_event (moment du fait), t_observation (moment de la constatation), t_upload (moment du dépôt). Chaque preuve est hachée pour garantir son intégrité.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  },
  {
    num: "T4", title: "Verdict Modéré", color: C.green600, bg: C.green50,
    desc: "Un modérateur humain (Junior → Senior → Admin) rend un verdict justifié par des articles pénaux et des preuves sélectionnées. Le score de confiance est calculé selon le niveau du modérateur.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  },
  {
    num: "T5", title: "Traçabilité & Audit", color: C.slate800, bg: C.slate100,
    desc: "Tout verdict est versionné et supersède le précédent sans l'effacer. Un rapport d'audit complet est généré à tout moment, garantissant la traçabilité complète de la chaîne décisionnelle.",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
  },
];

export default function MethodePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", background: C.slate50, backgroundImage: "radial-gradient(#cbd5e1 2px, transparent 2px)", backgroundSize: "24px 24px" }}>
      {/* Navbar */}
      <header className="r-navbar" style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 24px)", maxWidth: 1100, zIndex: 100, background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.05)" }}>
        <div className="r-navbar-inner" style={{ padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span className="r-brand-text" style={{ fontWeight: 800, fontSize: 18, color: C.slate900, letterSpacing: "-0.5px" }}>FakeCheck</span>
          </Link>
          <nav className="r-nav-links" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[
              { label: "Rumeurs", href: "/" },
              { label: "Méthode", href: "/methode" },
              { label: "Docs", href: "/docs" }
            ].map(n => (
              <Link key={n.label} href={n.href} className="r-nav-secondary" style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: n.href === "/methode" ? C.blue600 : C.slate600, borderRadius: 8, textDecoration: "none", background: n.href === "/methode" ? C.blue50 : "transparent", transition: "all .2s" }}
                onMouseEnter={e => { if (n.href !== "/methode") { e.currentTarget.style.color = C.slate900; e.currentTarget.style.background = C.slate100; } }}
                onMouseLeave={e => { if (n.href !== "/methode") { e.currentTarget.style.color = C.slate600; e.currentTarget.style.background = "transparent"; } }}
              >
                {n.label}
              </Link>
            ))}
            <div style={{ width: 1, height: 16, background: C.slate200, margin: "0 10px" }} />

            {isLoggedIn ? (
              <>
                <Link href={user?.role === "moderator" ? "/moderateur/dashboard" : "/profile"} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, color: C.blue600, borderRadius: 8, textDecoration: "none", transition: "all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.blue50}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {user?.name || "Mon Profil"}
                </Link>
                <button onClick={handleLogout} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700, color: C.slate700, borderRadius: 8, background: "none", border: "none", cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.slate100}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, color: C.slate700, borderRadius: 8, textDecoration: "none", transition: "all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.slate100}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  Connexion
                </Link>
                <Link href="/register" style={{ padding: "8px 18px", background: C.slate900, color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 8, textDecoration: "none", boxShadow: `0 4px 12px ${C.slate900}30`, transition: "transform .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = C.slate800; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = C.slate900; }}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "120px 16px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{ display: "inline-block", padding: "6px 16px", background: C.blue50, color: C.blue600, borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
            Protocole TWIST
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 900, color: C.slate900, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
            La méthode de<br /><span style={{ color: C.blue600 }}>vérification</span>
          </h1>
          <p style={{ fontSize: 18, color: C.slate500, lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
            FakeCheckAI suit un protocole rigoureux en 5 étapes pour transformer une rumeur brute en verdict traçable et immuable.
          </p>
        </div>

        {/* Steps */}
        <div className="r-method-steps" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              {/* Connector */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: step.bg, color: step.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, border: `2px solid ${step.color}20`, flexShrink: 0 }}>
                  {step.num}
                </div>
                {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 32, background: C.slate200, marginTop: 8 }} />}
              </div>
              {/* Card */}
              <div style={{ flex: 1, background: "#fff", borderRadius: 16, padding: "20px 20px", border: `1px solid ${C.slate200}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: step.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={step.color} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: C.slate900, margin: 0 }}>{step.title}</h2>
                </div>
                <p style={{ fontSize: 15, color: C.slate600, lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 64, textAlign: "center", padding: "48px", background: C.slate900, borderRadius: 24, color: "#fff" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.5px" }}>Prêt à analyser une rumeur ?</h2>
          <p style={{ color: C.slate400, marginBottom: 28, fontSize: 16 }}>Rejoignez le registre public et contribuez à la lutte contre la désinformation.</p>
          <Link href="/" style={{ padding: "14px 32px", background: C.blue600, color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>Voir le Registre</Link>
        </div>
      </main>
    </div>
  );
}
