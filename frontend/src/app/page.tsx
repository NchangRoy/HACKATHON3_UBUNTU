"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RumorsService, ThemesService, ClaimsService, VerdictService } from "@/api";
import type { Rumor } from "@/api";
import { getAuthToken, setAuthToken } from "@/services/api-client";

const C = {
  blue500: "#3b82f6", blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
  green600: "#16a34a", red600: "#dc2626"
};

type Statut = "CONTESTE" | "PROB_VRAI" | "PROB_FAUX" | "CONFIRME" | "REFUTE";

const statusMap: Record<string, { label: string; bg: string; color: string; dot: string; accent: string }> = {
  // Valeurs backend
  TRUE: { label: "✓ Confirmé", bg: "#f0fdf4", color: "#166534", dot: "#16a34a", accent: "#22c55e" },
  FALSE: { label: "✗ Réfuté", bg: "#fef2f2", color: "#991b1b", dot: "#ef4444", accent: "#ef4444" },
  PROBABLYTRUE: { label: "~ Prob. Vrai", bg: "#eff6ff", color: "#1e40af", dot: "#3b82f6", accent: "#60a5fa" },
  CONTESTED: { label: "⚠ Contesté", bg: "#fefce8", color: "#854d0e", dot: "#ca8a04", accent: "#eab308" },
  UNVERIFIABLE: { label: "○ Non vérifiable", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8", accent: "#94a3b8" },
  // Valeurs locales legacy
  CONTESTE: { label: "⚠ Contesté", bg: "#fefce8", color: "#854d0e", dot: "#ca8a04", accent: "#eab308" },
  PROB_VRAI: { label: "~ Prob. Vrai", bg: "#f0fdf4", color: "#166534", dot: "#16a34a", accent: "#22c55e" },
  PROB_FAUX: { label: "Prob. Faux", bg: "#fff7ed", color: "#9a3412", dot: "#ea580c", accent: "#f97316" },
  CONFIRME: { label: "✓ Confirmé", bg: "#f0fdf4", color: "#166534", dot: "#15803d", accent: "#16a34a" },
  REFUTE: { label: "✗ Réfuté", bg: "#fef2f2", color: "#991b1b", dot: "#ef4444", accent: "#ef4444" },
  // Défaut
  DEFAULT: { label: "● À analyser", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8", accent: "#94a3b8" },
};

const claims = [
  { id: "c1", texte: "Une fuite d'eau s'est produite rue Melen.", statut: "CONFIRME" as Statut, confiance: 0.95, score_ml: 0.88, pour: 12, contre: 0, cat: "Environnement", time: "1h" },
  { id: "c2", texte: "L'eau qui fuit rue Melen est contaminée et dangereuse pour la santé.", statut: "PROB_VRAI" as Statut, confiance: 0.72, score_ml: 0.65, pour: 4, contre: 1, cat: "Santé", time: "15 min" },
  { id: "c3", texte: "Deux enfants ont été intoxiqués après avoir joué dans l'eau.", statut: "CONTESTE" as Statut, confiance: 0.45, score_ml: 0.35, pour: 1, contre: 2, cat: "Santé", time: "30 min" },
  { id: "c4", texte: "La CDE a une équipe en intervention sur place.", statut: "PROB_VRAI" as Statut, confiance: 0.80, score_ml: 0.90, pour: 3, contre: 0, cat: "Sécurité", time: "10 min" },
];

const catColors: Record<string, { bg: string; color: string }> = {
  "Santé": { bg: "#fce7f3", color: "#9d174d" },
  "Politique": { bg: "#ede9fe", color: "#5b21b6" },
  "Économie": { bg: "#ecfdf5", color: "#065f46" },
  "Sécurité": { bg: "#fff7ed", color: "#9a3412" },
  "Environnement": { bg: "#f0fdf4", color: "#166534" },
};

function ClaimCard({ c, rumorStatus }: { c: Rumor; rumorStatus?: string }) {
  const statusKey = (rumorStatus || "DEFAULT").toUpperCase();
  const s = statusMap[statusKey] || statusMap["DEFAULT"];
  const cat = catColors["Santé"]; // Valeur par défaut

  const timeLabel = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Récemment";

  return (
    <Link href={`/rumeur/${c.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          background: "#ffffff",
          border: `1px solid ${C.slate200}`,
          borderRadius: 20,
          padding: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flex: 1,
          position: "relative",
          overflow: "hidden"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = "0 20px 40px rgba(15, 23, 42, 0.08)";
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.borderColor = C.blue100;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.03)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = C.slate200;
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: s.accent }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20,
            background: cat.bg, color: cat.color, textTransform: "uppercase", letterSpacing: "0.1em"
          }}>{c.location || "Localisation inconnue"}</span>

          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
            background: s.bg, color: s.color, border: `1px solid ${s.accent}20`
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
            {rumorStatus ? s.label : "● À analyser"}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: 17, fontWeight: 700, color: C.slate900, lineHeight: 1.4,
            letterSpacing: "-0.3px", margin: "0 0 8px 0"
          }}>
            {c.text}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.slate500 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Signalé le {c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Récemment"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 16, borderTop: `1px solid ${C.slate100}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: C.slate500, fontWeight: 600 }}>ID: {c.id}</span>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.blue50, display: "flex", alignItems: "center", justifyContent: "center", color: C.blue600 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PublicHome() {
  const router = useRouter();
  const [rumors, setRumors] = useState<Rumor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [themes, setThemes] = useState<any[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [rumorStatuses, setRumorStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const res: any = await ThemesService.getApiThemes();
      setThemes(res.data || (Array.isArray(res) ? res : []));
    } catch (e) {
      console.error("Erreur thèmes:", e);
    }
  };

  const fetchRumors = async (themeId?: string) => {
    setLoading(true);
    setRumors([]);
    try {
      const tid = themeId !== undefined ? themeId : (activeThemeId || undefined);
      const [res, claimsRes, verdictsRes] = await Promise.all([
        RumorsService.getApiRumors(tid),
        ClaimsService.getApiClaimsAll().catch(() => ({ data: [] })),
        VerdictService.getApiVerdictsAll().catch(() => ({ data: [] }))
      ]);
      let data = res.data || (Array.isArray(res) ? res : []);

      // Filtrage de secours côté client si le backend renvoie tout
      if (tid) {
        data = data.filter((r: any) => String(r.theme_id) === String(tid));
      }

      setRumors(data);

      // Construire la map rumorId → dernier statut verdict
      const allClaims: Array<{ id: string; rumor_id: string }> = (claimsRes as any).data || [];
      const allVerdicts: Array<any> = (verdictsRes as any).data || [];

      // Pour chaque claim, on garde le verdict le plus récent
      const claimToRumor: Record<string, string> = {};
      allClaims.forEach(c => { claimToRumor[c.id] = c.rumor_id; });

      const newStatuses: Record<string, string> = {};
      allVerdicts
        .sort((a, b) => new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime())
        .forEach(v => {
          const rumorId = claimToRumor[v.claim_id];
          if (rumorId) newStatuses[rumorId] = v.status; // Écrase avec le + récent
        });
      setRumorStatuses(newStatuses);

    } catch (err: any) {
      console.error("Erreur API:", err.message);
      setRumors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRumors();
  }, [activeThemeId]);

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    router.refresh();
  };

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: C.slate50, display: "flex", flexDirection: "column",
      backgroundImage: "radial-gradient(#cbd5e1 2px, transparent 2px)",
      backgroundSize: "24px 24px"
    }}>

      {/* ── Navbar (Glassmorphism) ── */}
      <header style={{
        position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 24px)", maxWidth: 1100, zIndex: 100,
        background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.3)", borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span style={{ fontWeight: 800, fontSize: 18, color: C.slate900, letterSpacing: "-0.5px" }}>FakeCheck</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[
              { label: "Rumeurs", href: "/#registre" },
              { label: "Méthode", href: "/methode" },
              { label: "Docs", href: "/docs" }
            ].map(n => (
              <Link key={n.label} href={n.href} style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: C.slate600, borderRadius: 8, textDecoration: "none", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = C.slate900; e.currentTarget.style.background = C.slate100; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.slate600; e.currentTarget.style.background = "transparent"; }}
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

      {/* ── Hero Section (Incurved Design) ── */}
      <section style={{
        position: "relative", width: "100%", padding: "160px 24px 140px",
        background: C.slate900, color: "#fff", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* L'image de fond générée */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/hero.png')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.2 }} />

        {/* Blobs décoratifs */}
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 400, height: 400, background: C.blue600, filter: "blur(120px)", opacity: 0.15, borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-5%", width: 300, height: 300, background: C.blue500, filter: "blur(100px)", opacity: 0.1, borderRadius: "50%" }} />

        {/* Dégradé radial central */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(15,23,42,0.8) 100%)" }} />

        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", zIndex: 10 }}>
          <h1 style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1, marginBottom: 24, maxWidth: 850, textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            Révélez la vérité. <br />
            <span style={{
              background: `linear-gradient(135deg, ${C.blue500}, ${C.blue100})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Atomisez la désinformation.</span>
          </h1>
          <p style={{ fontSize: 20, color: C.slate300, maxWidth: 650, lineHeight: 1.6, marginBottom: 44, fontWeight: 500 }}>
            FakeCheck combine l'analyse prédictive IA et une modération humaine traçable pour déconstruire les rumeurs à la source sur un registre immuable.
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => window.scrollTo({ top: document.getElementById('registre')?.offsetTop || 800, behavior: 'smooth' })} style={{ padding: "16px 32px", background: C.slate800, color: "#fff", fontWeight: 700, borderRadius: 12, fontSize: 16, border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(22, 28, 40, 0.3)", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.background = C.slate900; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = C.slate900; }}
            >
              Explorer le Registre
            </button>
            <Link href="/register" style={{ padding: "16px 32px", background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, borderRadius: 12, fontSize: 16, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              Accès Membre
            </Link>
          </div>
        </div>

        {/* Masque incurvé (concave) */}
        <div style={{
          position: "absolute", bottom: -50, left: "-10%", right: "-10%", height: 160,
          background: C.slate50,
          backgroundImage: `radial-gradient(${C.slate300} 2px, transparent 2px)`,
          backgroundSize: "24px 24px",
          borderRadius: "100% 100% 0 0",
          zIndex: 5
        }} />
      </section>

      {/* ── Stats & Registre ── */}
      <section id="registre" style={{
        position: "relative", zIndex: 10, marginTop: -40, overflow: "hidden",
        background: C.slate50,
        backgroundImage: `radial-gradient(${C.slate300} 2px, transparent 2px)`,
        backgroundSize: "24px 24px"
      }}>
        {/* Background Decorative Blobs */}
        <div style={{ position: "absolute", top: "20%", left: "-10%", width: 500, height: 500, background: C.blue50, filter: "blur(100px)", opacity: 0.6, borderRadius: "50%", zIndex: 0, animation: "float 15s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-10%", width: 400, height: 400, background: "#f0f9ff", filter: "blur(120px)", opacity: 0.5, borderRadius: "50%", zIndex: 0, animation: "float 20s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 600, background: "radial-gradient(circle, rgba(239,246,255,0.8) 0%, transparent 70%)", zIndex: 0 }} />

        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "60px 24px 32px", zIndex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 32, marginBottom: 48 }}>
            <div style={{ maxWidth: 500 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 4, background: C.blue600, borderRadius: 2 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.blue600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Données en temps réel</span>
              </div>
              <h1 style={{ fontSize: 40, fontWeight: 900, color: C.slate900, letterSpacing: "-1.5px", lineHeight: 1 }}>
                Registre public <br /> des signalements
              </h1>
              <p style={{ fontSize: 16, color: C.slate500, marginTop: 16, lineHeight: 1.6, fontWeight: 500 }}>
                Chaque affirmation est décomposée en claims atomiques. L'intégrité des verdicts est garantie par notre protocole d'audit immuable.
              </p>
            </div>

            {/* Stats Cards Enhancement */}
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { v: "24", l: "EN COURS", c: C.slate900, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                { v: "1 203", l: "VÉRIFIÉS", c: C.blue600, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
              ].map((stat) => (
                <div key={stat.l} style={{
                  minWidth: 160, padding: "28px 24px",
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 32,
                  boxShadow: `0 10px 40px ${C.slate900}08`,
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  display: "flex", flexDirection: "column", gap: 16,
                  transition: "transform .3s ease",
                  cursor: "default"
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: stat.c + "10",
                    color: stat.c, display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: C.slate900, letterSpacing: "-1px", lineHeight: 1 }}>{stat.v}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.slate400, letterSpacing: "0.05em", marginTop: 4 }}>{stat.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filtres catégories (Modern Pills) */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.slate400, marginRight: 8 }}>Filtrer par :</span>

            {/* Bouton "Tous" */}
            <button
              onClick={() => setActiveThemeId(null)}
              style={{
                padding: "10px 20px", borderRadius: 100, fontSize: 14, fontWeight: 700,
                cursor: "pointer", transition: "all .2s",
                background: activeThemeId === null ? C.slate900 : "#fff",
                color: activeThemeId === null ? "#fff" : C.slate600,
                boxShadow: activeThemeId === null ? `0 4px 12px ${C.slate900}20` : `0 2px 4px ${C.slate900}05`,
                border: activeThemeId === null ? "none" : `1px solid ${C.slate200}`
              }}
            >
              Tous
            </button>

            {/* Thèmes dynamiques depuis la BD (filtrage des doublons par nom) */}
            {Array.from(new Map(themes.map(t => [t.name || t.title, t])).values()).map(t => (
              <button key={t.id}
                onClick={() => setActiveThemeId(t.id)}
                style={{
                  padding: "10px 20px", borderRadius: 100, fontSize: 14, fontWeight: 700,
                  cursor: "pointer", transition: "all .2s",
                  background: activeThemeId === t.id ? C.slate900 : "#fff",
                  color: activeThemeId === t.id ? "#fff" : C.slate600,
                  boxShadow: activeThemeId === t.id ? `0 4px 12px ${C.slate900}20` : `0 2px 4px ${C.slate900}05`,
                  border: activeThemeId === t.id ? "none" : `1px solid ${C.slate200}`
                }}
              >
                {t.name || t.title || "Thème"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grille de cartes ── */}
      <main style={{ flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 24px 80px", zIndex: 2, position: "relative" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <svg style={{ animation: "spin 1s linear infinite" }} width="40" height="40" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke={C.slate200} strokeWidth="3" />
              <path d="M22 12a10 10 0 00-10-10" stroke={C.blue600} strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {rumors.length > 0 ? (
              rumors.map(r => <ClaimCard key={r.id} c={r} rumorStatus={rumorStatuses[r.id as string]} />)
            ) : (
              <p style={{ textAlign: "center", gridColumn: "1/-1", padding: 40, color: C.slate400 }}>Aucune rumeur signalée pour le moment.</p>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -50px) rotate(2deg); }
          66% { transform: translate(-20px, 20px) rotate(-1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
