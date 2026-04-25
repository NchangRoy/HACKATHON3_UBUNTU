"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RumorsService, ThemesService } from "@/api";
import { getAuthToken, setAuthToken } from "@/services/api-client";

const C = {
  blue500: "#3b82f6", blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
  green600: "#16a34a", red600: "#dc2626"
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newRumor, setNewRumor] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [themes, setThemes] = useState<any[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [showNewThemeInput, setShowNewThemeInput] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setIsLoggedIn(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchThemes = async () => {
      try {
        const response: any = await ThemesService.getApiThemes();
        // Le backend renvoie { success: true, data: [...] } au lieu d'un tableau direct
        const actualData = response?.data || (Array.isArray(response) ? response : []);
        setThemes(actualData);
        if (actualData.length > 0) {
          setSelectedTheme(actualData[0].id || "");
          setShowNewThemeInput(false);
        } else {
          setShowNewThemeInput(true); // Proposer la création par défaut si vide
        }
      } catch (e) {
        console.error("Impossible de charger les thèmes:", e);
        setShowNewThemeInput(true);
      }
    };
    fetchThemes();
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRumor.trim()) return;
    setSubmitting(true);
    setStatus({ type: "", msg: "" });

    try {
      let themeId = selectedTheme;

      // Créer le nouveau thème si nécessaire
      if (showNewThemeInput) {
        if (newThemeName.trim().length < 3) {
          setStatus({ type: "error", msg: "Le nom du thème doit avoir au moins 3 caractères." });
          setSubmitting(false);
          return;
        }
        try {
          // On envoie name ET title pour être sûr (le backend semble demander 'titre')
          const themeRes: any = await ThemesService.postApiThemes({ 
            name: newThemeName,
            title: newThemeName 
          } as any);
          
          // Le backend peut renvoyer l'ID directement, ou dans .data.id, ou dans .data[0].id
          themeId = themeRes?.data?.id || themeRes?.id || themeRes?.data?.[0]?.id || themeRes?.[0]?.id;
          
          if (!themeId) {
            console.error("Format de réponse thème inconnu:", themeRes);
            throw new Error("ID de thème manquant dans la réponse serveur");
          }
        } catch (themeErr: any) {
          console.error("Erreur création thème:", themeErr);
          const msg = themeErr.body?.message || "Impossible de créer le nouveau thème.";
          setStatus({ type: "error", msg: `Thème : ${msg}` });
          setSubmitting(false);
          return;
        }
      }

      const payload: any = {
        text: newRumor,
        location: location || "Non spécifiée",
        user_id: user?.id, // Requis par le backend
        theme_id: themeId  // Requis par le backend
      };
      
      if (!payload.theme_id) {
        setStatus({ type: "error", msg: "Veuillez sélectionner ou créer une thématique." });
        setSubmitting(false);
        return;
      }

      const res = await RumorsService.postApiRumors(payload);
      if (res.success) {
        setNewRumor("");
        setLocation("");
        setNewThemeName("");
        setShowNewThemeInput(false);
        setStatus({ type: "success", msg: "Rumeur signalée avec succès ! Elle est en cours d'analyse." });
        // Rafraîchir les thèmes pour inclure le nouveau
        const response: any = await ThemesService.getApiThemes();
        setThemes(response?.data || response || []);
      }
    } catch (err: any) {
      console.error(err);
      const detail = err.body?.message || "Données invalides ou serveur indisponible (400).";
      setStatus({ type: "error", msg: `Erreur : ${detail}` });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <div style={{ padding: 40, textAlign: "center", color: C.slate500 }}>Chargement du profil...</div>;

  return (
    <div style={{ 
      minHeight: "100vh", background: C.slate50, padding: "100px 24px 80px",
      backgroundImage: `radial-gradient(${C.slate300} 2px, transparent 2px)`,
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
            <span style={{ fontWeight: 800, fontSize: 18, color: C.slate900, letterSpacing: "-0.5px" }}>FakeCheckAI</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {["Rumeurs", "Méthode", "Docs"].map(n => (
              <Link key={n} href="#" style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: C.slate600, borderRadius: 8, textDecoration: "none", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = C.slate900; e.currentTarget.style.background = C.slate100; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.slate600; e.currentTarget.style.background = "transparent"; }}
              >
                {n}
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

      <main style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", gap: 32 }}>
        {/* Sidebar Profil */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ background: "#fff", padding: 32, borderRadius: 24, border: `1px solid ${C.slate200}`, textAlign: "center", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.04)" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.blue50, color: C.blue600, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, margin: "0 auto 16px" }}>
              {user.name?.[0]}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.slate900, marginBottom: 4 }}>{user.name}</h2>
            <p style={{ fontSize: 13, color: C.slate500, marginBottom: 20 }}>{user.email}</p>
            <div style={{ display: "inline-block", padding: "4px 12px", background: C.slate100, borderRadius: 20, fontSize: 11, fontWeight: 700, color: C.slate600, textTransform: "uppercase" }}>
              {user.role === "individual" ? "Individu" : "Organisation"}
            </div>
          </div>

          <div style={{ background: C.slate900, padding: 24, borderRadius: 24, color: "#fff", boxShadow: `0 20px 40px -10px ${C.slate900}50` }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Crédibilité du profil</h3>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.blue500 }}>Niveau {user.priority || 1}</div>
            <p style={{ fontSize: 12, color: C.slate400, marginTop: 8, lineHeight: 1.5 }}>
              Votre score augmente avec la pertinence de vos signalements vérifiés.
            </p>
          </div>
        </aside>

        {/* Formulaire Signalement */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ background: "#fff", padding: 40, borderRadius: 32, border: `1px solid ${C.slate200}`, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: C.slate900, letterSpacing: "-0.5px", marginBottom: 8 }}>
              Signaler une rumeur
            </h2>
            <p style={{ fontSize: 14, color: C.slate500, marginBottom: 32 }}>
              Décrivez l'information que vous souhaitez faire vérifier par nos modérateurs.
            </p>

            {status.msg && (
              <div style={{ padding: 16, borderRadius: 12, marginBottom: 24, background: status.type === "success" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${status.type === "success" ? "#bbf7d0" : "#fecaca"}`, color: status.type === "success" ? "#166534" : "#991b1b", fontSize: 14, fontWeight: 500 }}>
                {status.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8 }}>
                  Contenu de la rumeur
                </label>
                <textarea
                  value={newRumor}
                  onChange={e => setNewRumor(e.target.value)}
                  placeholder="Ex: Une fuite d'eau toxique signalée rue Melen..."
                  style={{ width: "100%", padding: 16, height: 120, border: `1px solid ${C.slate200}`, borderRadius: 12, fontSize: 15, outline: "none", resize: "none", transition: "all .2s" }}
                  onFocus={e => e.target.style.borderColor = C.blue600}
                  onBlur={e => e.target.style.borderColor = C.slate200}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8 }}>
                  Thématique
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <select
                      disabled={showNewThemeInput}
                      value={selectedTheme}
                      onChange={e => setSelectedTheme(e.target.value)}
                      style={{ 
                        width: "100%", padding: "12px 16px", border: `1px solid ${C.slate200}`, 
                        borderRadius: 12, fontSize: 15, outline: "none", 
                        background: showNewThemeInput ? C.slate50 : "#fff",
                        cursor: showNewThemeInput ? "not-allowed" : "pointer",
                        color: showNewThemeInput ? C.slate400 : C.slate900
                      }}
                    >
                      {themes.length === 0 && <option value="">Aucun thème en BD</option>}
                      {Array.from(new Map(themes.map(t => [t.name || t.title, t])).values()).map(t => (
                        <option key={t.id} value={t.id}>{t.name || t.title}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewThemeInput(!showNewThemeInput);
                      if (!showNewThemeInput) setSelectedTheme("");
                    }}
                    style={{ 
                      width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 12, background: showNewThemeInput ? C.blue600 : C.slate100, 
                      color: showNewThemeInput ? "#fff" : C.slate600, border: "none", cursor: "pointer",
                      fontSize: 24, fontWeight: 300, transition: "all .2s",
                      boxShadow: showNewThemeInput ? `0 4px 12px ${C.blue600}40` : "none"
                    }}
                  >
                    {showNewThemeInput ? "×" : "+"}
                  </button>
                </div>
              </div>

              {showNewThemeInput && (
                <div style={{ marginTop: -10 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.blue600, marginBottom: 6, marginLeft: 4 }}>
                    NOM DU NOUVEAU THÈME
                  </label>
                  <input
                    type="text"
                    value={newThemeName}
                    onChange={e => setNewThemeName(e.target.value)}
                    placeholder="Ex: Économie, Santé, Sport..."
                    style={{ width: "100%", padding: "12px 16px", border: `2px solid ${C.blue600}`, borderRadius: 12, fontSize: 15, outline: "none", background: "#fff", boxShadow: `0 0 0 4px ${C.blue600}10` }}
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8 }}>
                  Localisation
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Yaoundé, Melen"
                  style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.slate200}`, borderRadius: 12, fontSize: 15, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = C.blue600}
                  onBlur={e => e.target.style.borderColor = C.slate200}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !newRumor.trim()}
                style={{
                  width: "100%", padding: 16, background: submitting || !newRumor.trim() ? C.slate200 : C.blue600,
                  color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15,
                  cursor: submitting || !newRumor.trim() ? "not-allowed" : "pointer", transition: "all .2s",
                  boxShadow: submitting || !newRumor.trim() ? "none" : `0 8px 24px ${C.blue600}40`
                }}
              >
                {submitting ? "Traitement immuable..." : "Envoyer pour Vérification"}
              </button>
            </form>
          </div>

          <div style={{ padding: "0 16px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.slate400, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Règles de soumission</h3>
            <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Soyez le plus factuel possible dans votre description.",
                "Mentionnez le lieu exact si vous en avez connaissance.",
                "Votre signalement sera horodaté et lié à votre compte.",
                "Les fausses déclarations répétées diminuent votre priorité."
              ].map((text, i) => (
                <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: C.slate600, lineHeight: 1.4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue600, marginTop: 6, flexShrink: 0 }} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
