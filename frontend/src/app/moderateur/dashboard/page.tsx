"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RumorsService, ModeratorsService, ClaimsService, VerdictService } from "@/api";
import type { Rumor, Moderator } from "@/api";
import { setAuthToken, getAuthToken } from "@/services/api-client";
import { useRouter } from "next/navigation";
import { AIService } from "@/services/ai-service";

const C = {
  blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a", slate950: "#020617",
  sidebar: "#020617", sidebarBorder: "rgba(255,255,255,0.05)",
  accent: "#38bdf8", accentGlow: "rgba(56, 189, 248, 0.2)"
};

type Statut = "CONTESTE" | "PROB_VRAI" | "PROB_FAUX" | "CONFIRME" | "REFUTE";

const statusMap: Record<string, { label: string; bg: string; color: string; dot: string; glow: string }> = {
  // Backend values
  TRUE:         { label: "Confirmé", bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e", dot: "#22c55e", glow: "rgba(34, 197, 94, 0.6)" },
  FALSE:        { label: "Réfuté", bg: "rgba(239, 68, 68, 0.05)", color: "#ef4444", dot: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" },
  PROBABLYTRUE: { label: "Prob. Vrai", bg: "rgba(59, 130, 246, 0.05)", color: "#3b82f6", dot: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)" },
  CONTESTED:    { label: "Contesté", bg: "rgba(234, 179, 8, 0.05)", color: "#eab308", dot: "#eab308", glow: "rgba(234, 179, 8, 0.4)" },
  UNVERIFIABLE: { label: "Non vérifiable", bg: "rgba(148, 163, 184, 0.05)", color: "#94a3b8", dot: "#94a3b8", glow: "rgba(148, 163, 184, 0.4)" },
  // Legacy values
  CONTESTE:  { label: "Contesté", bg: "rgba(234, 179, 8, 0.05)", color: "#eab308", dot: "#eab308", glow: "rgba(234, 179, 8, 0.4)" },
  PROB_VRAI: { label: "Prob. Vrai", bg: "rgba(34, 197, 94, 0.05)", color: "#22c55e", dot: "#22c55e", glow: "rgba(34, 197, 94, 0.4)" },
  PROB_FAUX: { label: "Prob. Faux", bg: "rgba(249, 115, 22, 0.05)", color: "#f97516", dot: "#f97516", glow: "rgba(249, 115, 22, 0.4)" },
  CONFIRME:  { label: "Confirmé", bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e", dot: "#22c55e", glow: "rgba(34, 197, 94, 0.6)" },
  REFUTE:    { label: "Réfuté", bg: "rgba(239, 68, 68, 0.05)", color: "#ef4444", dot: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" },
  // Default
  DEFAULT:   { label: "À analyser", bg: "rgba(148, 163, 184, 0.05)", color: "#94a3b8", dot: "#94a3b8", glow: "rgba(148, 163, 184, 0.3)" },
};

const alerts = [
  { id: 1, msg: "Spike de signalements vidéos sur #c1 (+800% en 15m)", time: "2 min", type: "spike" },
  { id: 2, msg: "Témoignage professionnel médical détecté sur #c3", time: "12 min", type: "accounts" },
  { id: 3, msg: "Déclaration officielle CDE contredit #c2", time: "30 min", type: "dedup" },
];

function Badge({ statut }: { statut: string }) {
  const key = (statut || "DEFAULT").toUpperCase();
  const s = statusMap[key] || statusMap["DEFAULT"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20, background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 800, whiteSpace: "nowrap",
      border: `1px solid ${s.color}20`,
      boxShadow: `0 0 10px ${s.glow}`
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0, boxShadow: `0 0 8px ${s.dot}` }} />
      {s.label.toUpperCase()}
    </span>
  );
}

function NavItem({ href, onClick, label, icon, active, badge }: { href?: string; onClick?: () => void; label: string; icon: React.ReactNode; active?: boolean; badge?: string }) {
  const content = (
    <>
      <span style={{ opacity: active ? 1 : 0.6 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{ background: C.blue600, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 10, boxShadow: `0 0 10px ${C.blue600}40` }}>{badge}</span>
      )}
    </>
  );

  const style = {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
    fontSize: 13, fontWeight: active ? 700 : 500,
    color: active ? "#fff" : C.slate400,
    background: active ? `linear-gradient(90deg, ${C.slate800}, ${C.slate900})` : "transparent",
    border: active ? `1px solid rgba(255,255,255,0.08)` : "1px solid transparent",
    textDecoration: "none", transition: "all .2s ease", cursor: "pointer",
    boxShadow: active ? `0 4px 12px rgba(0,0,0,0.2)` : "none"
  };

  if (onClick) {
    return (
      <div style={style} onClick={onClick}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => !active && (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => !active && (e.currentTarget.style.color = C.slate400)}
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={href!} style={style}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => !active && (e.currentTarget.style.color = "#fff")}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => !active && (e.currentTarget.style.color = C.slate400)}
    >
      {content}
    </Link>
  );
}

export default function ModDashboard() {
  const router = useRouter();
  const [rumors, setRumors] = useState<Rumor[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"rumors" | "moderators" | "rules">("rumors");
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [modLoading, setModLoading] = useState(false);
  const [showModModal, setShowModModal] = useState(false);
  const [newMod, setNewMod] = useState({ name: "", email: "", password: "", level: "junior" as any });

  const [penalRules, setPenalRules] = useState<{ id: string; title: string; description: string }[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({ title: "", description: "" });

  const [showVerdictModal, setShowVerdictModal] = useState(false);
  const [selectedRumorId, setSelectedRumorId] = useState<string | null>(null);
  const [quickVerdict, setQuickVerdict] = useState({ status: "CONFIRME", note: "", ruleId: "" });
  const [verdictLoading, setVerdictLoading] = useState(false);
  const [rumorStatuses, setRumorStatuses] = useState<Record<string, string>>({});

  const [showAtomizeModal, setShowAtomizeModal] = useState(false);
  const [atomizingRumor, setAtomizingRumor] = useState<Rumor | null>(null);
  const [extractedClaims, setExtractedClaims] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [saveLoading, setSaveLoading] = useState<Record<number, boolean>>({});

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (activeTab === "moderators" && moderators.length === 0) {
      const fetchMods = async () => {
        setModLoading(true);
        try {
          const response = await ModeratorsService.getApiModerators();
          const data = (response as any).data || response;
          if (Array.isArray(data)) {
            setModerators(data);
          }
        } catch (err) {
          console.error("Erreur chargement modérateurs:", err);
        } finally {
          setModLoading(false);
        }
      };
      fetchMods();
    }
  }, [activeTab]);

  const handleCreateModerator = async (e: React.FormEvent) => {
    // ... code existant ...
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const rule = { ...newRule, id: "R-" + Date.now() };
    const updated = [...penalRules, rule];
    setPenalRules(updated);
    localStorage.setItem("penal_rules", JSON.stringify(updated));
    setShowRuleModal(false);
    setNewRule({ title: "", description: "" });
  };

  useEffect(() => {
    const saved = localStorage.getItem("penal_rules");
    if (saved) setPenalRules(JSON.parse(saved));
  }, []);

  const handleQuickVerdict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRumorId) return;

    try {
      setVerdictLoading(true);
      const rData = rumors.find(r => r.id === selectedRumorId);
      const claimRes = await ClaimsService.postApiClaims({
        rumor_id: selectedRumorId,
        text: rData?.text || "Claim principal"
      });
      const targetId = claimRes.id || (claimRes as any).data?.id;

      if (!targetId) {
        alert("Impossible de générer un Claim pour cette rumeur.");
        return;
      }

      const statusMap: Record<string, any> = {
        "CONFIRME": "True",
        "REFUTE": "False",
        "PROB_VRAI": "ProbablyTrue",
        "CONTESTE": "Contested"
      };

      const selectedRule = penalRules.find(r => r.id === quickVerdict.ruleId);
      const finalSummary = selectedRule 
        ? `[${selectedRule.title}] ${quickVerdict.note}` 
        : quickVerdict.note;

      await VerdictService.postApiVerdicts({
        claim_id: targetId,
        status: statusMap[quickVerdict.status] || "Contested",
        summary: finalSummary,
        confidence_score: 0.95,
        moderator_id: user?.id || "moderator-unknown"
      });
      
      setShowVerdictModal(false);
      setQuickVerdict({ status: "CONFIRME", note: "", ruleId: "" });
      alert("Verdict enregistré avec succès.");
      
      // Rafraîchir la liste pour voir les changements
      fetchRumors();
    } catch (err) {
      console.error("Erreur lors de l'émission du verdict:", err);
      alert("Erreur lors de l'émission du verdict.");
    } finally {
      setVerdictLoading(false);
    }
  };

  const handleAtomize = async (r: Rumor) => {
    setAtomizingRumor(r);
    setShowAtomizeModal(true);
    setExtractedClaims([]);
    setIsExtracting(true);
    try {
      const claims = await AIService.extractClaims(r.text || "");
      setExtractedClaims(claims);
    } catch (err) {
      console.error("AI Extraction failed:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveClaim = async (text: string, index: number) => {
    if (!atomizingRumor?.id) return;
    setSaveLoading(prev => ({ ...prev, [index]: true }));
    try {
      await ClaimsService.postApiClaims({
        rumor_id: atomizingRumor.id,
        text: text
      });
      // Optionnel: marquer comme enregistré
    } catch (err) {
      console.error("Save claim failed:", err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaveLoading(prev => ({ ...prev, [index]: false }));
    }
  };

    const fetchRumors = async () => {
      setLoading(true);
      try {
        const [response, claimsRes, verdictsRes] = await Promise.all([
          RumorsService.getApiRumors(),
          ClaimsService.getApiClaimsAll().catch(() => ({ data: [] })),
          VerdictService.getApiVerdictsAll().catch(() => ({ data: [] }))
        ]);
        if (response.success && response.data) {
          setRumors(response.data);
        }

        // Construire la map rumorId → dernier statut
        const allClaims: Array<{ id: string; rumor_id: string }> = (claimsRes as any).data || [];
        const allVerdicts: Array<any> = (verdictsRes as any).data || [];
        const claimToRumor: Record<string, string> = {};
        allClaims.forEach(c => { claimToRumor[c.id] = c.rumor_id; });
        const newStatuses: Record<string, string> = {};
        allVerdicts
          .sort((a, b) => new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime())
          .forEach(v => {
            const rumorId = claimToRumor[v.claim_id];
            if (rumorId) newStatuses[rumorId] = v.status;
          });
        setRumorStatuses(newStatuses);
      } catch (err: any) {
        console.error("Erreur dashboard API:", err.message);
        setRumors([{ id: "err-500", text: "Le backend (Vercel) rencontre une erreur 500. Modération en mode local.", location: "Alerte Système" }]);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }
      
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== "moderator") {
          router.push(parsedUser.role === "individual" || parsedUser.role === "organization" ? "/profile" : "/");
          return;
        }
        setUser(parsedUser);
      } else {
        router.push("/");
      }

      fetchRumors();
    }, []);

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.slate950, color: "#fff", fontSize: 14, fontWeight: 600 }}>Initialisation sécurisée...</div>;

  return (
    <div className="r-dashboard-layout" style={{ 
      minHeight: "100vh", display: "flex", background: C.slate50,
      backgroundImage: `radial-gradient(${C.slate300} 2px, transparent 2px)`,
      backgroundSize: "24px 24px"
    }} >
      
      <aside className="r-sidebar" style={{
        width: 240, background: C.slate950, borderRight: `1px solid ${C.sidebarBorder}`,
        display: "flex", flexDirection: "column", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none", backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div style={{ position: "relative", padding: "0 20px", height: 60, display: "flex", alignItems: "center", borderBottom: `1px solid ${C.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="Logo" style={{ width: 28, height: 28, borderRadius: 6 }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.5px" }}>FakeCheckAI</span>
          </div>
        </div>
        <nav style={{ position: "relative", flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.slate500, letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 12px 4px", marginTop: 4 }}>Opérations</p>
          <NavItem onClick={() => setActiveTab("rumors")} label="File globale" active={activeTab === "rumors"} icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
          <NavItem onClick={() => setActiveTab("rules")} label="Articles Pénaux" active={activeTab === "rules"} icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
          <NavItem onClick={() => setActiveTab("moderators")} label="Gestion Modérateurs" active={activeTab === "moderators"} icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
          <p style={{ fontSize: 11, fontWeight: 600, color: C.slate500, letterSpacing: "0.05em", textTransform: "uppercase", padding: "16px 12px 4px" }}>Ressources</p>
          <NavItem href="/" label="Portail public" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>} />
        </nav>
        <div style={{ position: "relative", padding: 16, borderTop: `1px solid ${C.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ 
              width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.blue600}, ${C.blue700})`, 
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800, 
              flexShrink: 0, boxShadow: `0 4px 12px ${C.blue600}40` 
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{user?.name || "Modérateur"}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: C.slate500, letterSpacing: "0.05em" }}>EN LIGNE</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Déconnexion" 
              style={{ color: C.slate400, lineHeight: 0, padding: 4, transition: "color .15s", background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.color = "#fff"}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.color = C.slate400}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        
        <header style={{
          height: 56, margin: "12px 16px 0", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.5)", borderRadius: 12, display: "flex", alignItems: "center", gap: 16, padding: "0 20px",
          position: "sticky", top: 12, zIndex: 100, boxShadow: `0 4px 20px ${C.slate900}05`
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.slate400} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="search" placeholder="Rechercher..." style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8, border: `1px solid ${C.slate300}`, borderRadius: 6, fontSize: 13, outline: "none", background: "#fff" }} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: `1px solid ${C.slate200}`, background: "#fff", color: C.slate700, fontSize: 13, fontWeight: 600, borderRadius: 10, textDecoration: "none" }}>Quitter</Link>
          </div>
        </header>

        <main style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: 32, flex: 1, minWidth: 0 }}>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
            {activeTab === "rumors" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.slate900, letterSpacing: "-0.4px" }}>File de modération globale</h1>
                    <p style={{ fontSize: 13, color: C.slate500, marginTop: 4 }}>{rumors.length} dossiers en attente d'évaluation</p>
                  </div>
                </div>

                <div className="r-table-wrapper" style={{ background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 16, overflowX: "auto", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.04)" }}>
                  <div style={{ minWidth: 650 }}>
                    <div className="r-table-header" style={{ display: "grid", gridTemplateColumns: "minmax(200px, 1fr) 120px 80px 100px 150px", padding: "16px", background: C.slate950, fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      <div>Signalement</div>
                      <div>Statut</div>
                      <div className="r-table-col-id">ID</div>
                      <div className="r-table-col-date">Date</div>
                      <div style={{ textAlign: "right" }}>Action</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {loading ? (
                        <div style={{ padding: 40, textAlign: "center" }}>Chargement...</div>
                      ) : rumors.length > 0 ? (
                        rumors.map((r, i) => (
                          <div key={r.id} className="r-table-row" style={{ display: "grid", gridTemplateColumns: "minmax(200px, 1fr) 120px 80px 100px 150px", padding: "16px", borderBottom: i === rumors.length - 1 ? "none" : `1px solid ${C.slate100}`, alignItems: "center", transition: "all .2s" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingRight: 20 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.slate300, marginTop: 6 }} />
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: C.slate900, lineHeight: 1.4 }}>{r.text}</span>
                                <span style={{ fontSize: 11, color: C.slate500 }}>{r.location}</span>
                              </div>
                            </div>
                            <div><Badge statut={rumorStatuses[r.id as string] || "DEFAULT"} /></div>
                            <div className="r-table-col-id" style={{ fontSize: 11, fontFamily: "monospace", color: C.slate400 }}>{r.id?.substring(0, 8)}</div>
                            <div className="r-table-col-date" style={{ fontSize: 12, color: C.slate700 }}>{(r.createdAt || (r as any).created_at) ? new Date(r.createdAt || (r as any).created_at).toLocaleDateString('fr-FR') : "-"}</div>
                            <div style={{ textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button 
                                onClick={() => handleAtomize(r)} 
                                style={{ 
                                  display: "inline-block", padding: "6px 14px", border: `1px solid ${C.accent}40`, 
                                  borderRadius: 6, fontSize: 11, fontWeight: 700, color: C.accent, 
                                  textDecoration: "none", background: "rgba(56, 189, 248, 0.05)", cursor: "pointer",
                                  transition: "all .2s"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(56, 189, 248, 0.05)"; e.currentTarget.style.color = C.accent; }}
                              >
                                Atomiser
                              </button>
                              <Link href={`/rumeur/${r.id}`} style={{ display: "inline-block", padding: "6px 14px", border: `1px solid ${C.slate200}`, borderRadius: 6, fontSize: 11, fontWeight: 700, color: C.slate700, textDecoration: "none", background: "#fff" }}>Détail</Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: 40, textAlign: "center", color: C.slate400 }}>Aucun dossier en attente.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "moderators" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.slate900, letterSpacing: "-0.4px" }}>Gestion des Modérateurs</h1>
                    <p style={{ fontSize: 13, color: C.slate500, marginTop: 4 }}>{moderators.length} modérateur(s) inscrit(s)</p>
                  </div>
                  <button onClick={() => setShowModModal(true)} style={{ padding: "10px 16px", background: C.slate900, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer", transition: "all .2s", boxShadow: `0 4px 10px ${C.slate900}30` }}>
                    + Nouveau Modérateur
                  </button>
                </div>

                <div style={{ background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.04)" }}>
                  <div style={{ minWidth: 760 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", padding: "16px", background: C.slate950, fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      <div>Nom</div>
                      <div>Email</div>
                      <div>Niveau</div>
                      <div style={{ textAlign: "right" }}>ID</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {modLoading ? (
                        <div style={{ padding: 40, textAlign: "center" }}>Chargement...</div>
                      ) : moderators.length > 0 ? (
                        moderators.map((m, i) => (
                          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", padding: "16px", borderBottom: i === moderators.length - 1 ? "none" : `1px solid ${C.slate100}`, alignItems: "center" }}>
                            <div style={{ fontWeight: 600, color: C.slate900 }}>{m.name}</div>
                            <div style={{ color: C.slate500, fontSize: 13 }}>{m.email}</div>
                            <div>
                              <span style={{ padding: "4px 8px", background: C.blue50, color: C.blue700, borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{m.level}</span>
                            </div>
                            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 11, color: C.slate400 }}>{m.id?.substring(0, 8)}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: 40, textAlign: "center", color: C.slate400 }}>Aucun modérateur trouvé.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "rules" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.slate900, letterSpacing: "-0.4px" }}>Articles Pénaux</h1>
                    <p style={{ fontSize: 13, color: C.slate500, marginTop: 4 }}>{penalRules.length} règle(s) enregistrée(s)</p>
                  </div>
                  <button onClick={() => setShowRuleModal(true)} style={{ padding: "10px 16px", background: C.slate900, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer", boxShadow: `0 4px 10px ${C.slate900}30` }}>
                    + Nouvel Article
                  </button>
                </div>

                <div style={{ background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.04)" }}>
                  <div style={{ minWidth: 600 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 100px", padding: "16px", background: C.slate950, fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      <div>Référence</div>
                      <div>Description / Sanction</div>
                      <div style={{ textAlign: "right" }}>Actions</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {penalRules.length > 0 ? (
                        penalRules.map((r, i) => (
                          <div key={r.id} style={{ display: "grid", gridTemplateColumns: "180px 1fr 100px", padding: "16px", borderBottom: i === penalRules.length - 1 ? "none" : `1px solid ${C.slate100}`, alignItems: "center" }}>
                            <div style={{ fontWeight: 700, color: C.slate900 }}>{r.title}</div>
                            <div style={{ color: C.slate500, fontSize: 13, paddingRight: 20 }}>{r.description}</div>
                            <div style={{ textAlign: "right" }}>
                              <button onClick={() => {
                                const updated = penalRules.filter(x => x.id !== r.id);
                                setPenalRules(updated);
                                localStorage.setItem("penal_rules", JSON.stringify(updated));
                              }} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Supprimer</button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: 40, textAlign: "center", color: C.slate400 }}>Aucun article pénal enregistré.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: C.slate900, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Rapport d'anomalies ML
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {alerts.map(a => {
                let icon;
                if (a.type === "spike") icon = <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;
                else if (a.type === "accounts") icon = <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
                else icon = <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />;

                return (
                  <div key={a.id} style={{
                    background: "#fff", 
                    border: `1px solid ${C.slate200}`, 
                    borderRadius: 12, 
                    padding: "16px",
                    display: "flex", gap: 12, alignItems: "flex-start", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    transition: "all .2s"
                  }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `0 0 15px ${C.accent}20`; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = C.slate200; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)"; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: C.slate950, 
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      boxShadow: `0 0 10px ${C.slate900}40`
                    }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={2.5}>
                        {icon}
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.slate900, lineHeight: 1.4 }}>{a.msg}</p>
                      <p style={{ fontSize: 11, color: C.slate400, marginTop: 4, fontWeight: 500 }}>{a.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Création Modérateur */}
      {showModModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 400, borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.slate900 }}>Nouveau Modérateur</h3>
              <button onClick={() => setShowModModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.slate400 }}>&times;</button>
            </div>
            <form onSubmit={handleCreateModerator} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 6 }}>Nom complet</label>
                <input required value={newMod.name} onChange={e => setNewMod({ ...newMod, name: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.slate300}`, fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 6 }}>Email</label>
                <input required type="email" value={newMod.email} onChange={e => setNewMod({ ...newMod, email: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.slate300}`, fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 6 }}>Mot de passe</label>
                <input required type="password" value={newMod.password} onChange={e => setNewMod({ ...newMod, password: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.slate300}`, fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 6 }}>Niveau d'accréditation</label>
                <select value={newMod.level} onChange={e => setNewMod({ ...newMod, level: e.target.value as any })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.slate300}`, fontSize: 14, outline: "none", background: "#fff" }}>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <button type="submit" disabled={modLoading} style={{ marginTop: 8, padding: "12px", background: C.blue600, color: "#fff", fontWeight: 700, borderRadius: 8, border: "none", cursor: modLoading ? "not-allowed" : "pointer" }}>
                {modLoading ? "Création..." : "Ajouter le modérateur"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Création Article Pénal */}
      {showRuleModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 440, borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.slate900 }}>Nouvel Article Pénal</h3>
              <button onClick={() => setShowRuleModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.slate400 }}>&times;</button>
            </div>
            <form onSubmit={handleCreateRule} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 6 }}>Référence de l'article</label>
                <input required placeholder="Ex: Art. 240 du Code Pénal" value={newRule.title} onChange={e => setNewRule({ ...newRule, title: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.slate300}`, fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 6 }}>Description / Sanction</label>
                <textarea required placeholder="Détaillez la règle de droit ici..." value={newRule.description} onChange={e => setNewRule({ ...newRule, description: e.target.value })} rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.slate300}`, fontSize: 14, outline: "none", resize: "none" }} />
              </div>
              <button type="submit" style={{ marginTop: 8, padding: "12px", background: C.slate900, color: "#fff", fontWeight: 700, borderRadius: 8, border: "none", cursor: "pointer" }}>
                Enregistrer l'article
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Modal Quick Verdict */}
      {showVerdictModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 440, borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.slate900 }}>Rendre un Verdict</h3>
              <button onClick={() => setShowVerdictModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.slate400 }}>&times;</button>
            </div>
            <form onSubmit={handleQuickVerdict} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 6 }}>Nouveau Statut</label>
                <select value={quickVerdict.status} onChange={e => setQuickVerdict({ ...quickVerdict, status: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.slate300}`, fontSize: 14, outline: "none", background: "#fff" }}>
                  <option value="CONTESTE">Contesté</option>
                  <option value="PROB_VRAI">Probablement Vrai</option>
                  <option value="PROB_FAUX">Probablement Faux</option>
                  <option value="CONFIRME">Confirmé</option>
                  <option value="REFUTE">Réfuté</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 6 }}>Article Pénal de référence</label>
                <select value={quickVerdict.ruleId} onChange={e => setQuickVerdict({ ...quickVerdict, ruleId: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.slate300}`, fontSize: 14, outline: "none", background: "#fff" }}>
                  <option value="">Aucun article sélectionné</option>
                  {penalRules.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 6 }}>Note publique (Transparence)</label>
                <textarea required value={quickVerdict.note} onChange={e => setQuickVerdict({ ...quickVerdict, note: e.target.value })} rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.slate300}`, fontSize: 14, outline: "none", resize: "none" }} />
              </div>
              <button type="submit" disabled={verdictLoading} style={{ marginTop: 8, padding: "12px", background: C.blue600, color: "#fff", fontWeight: 700, borderRadius: 8, border: "none", cursor: verdictLoading ? "not-allowed" : "pointer" }}>
                {verdictLoading ? "Enregistrement..." : "Confirmer le Verdict"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Modal Atomisation IA */}
      {showAtomizeModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(8px)" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 600, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ background: C.slate950, padding: "24px 32px", borderBottom: `1px solid ${C.sidebarBorder}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Atomisation par IA</h3>
                  <p style={{ fontSize: 12, color: C.slate500, marginTop: 4 }}>Extraction des affirmations atomiques via NLP</p>
                </div>
                <button onClick={() => setShowAtomizeModal(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>&times;</button>
              </div>
            </div>
            
            <div style={{ padding: 32, maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ background: C.slate50, padding: 16, borderRadius: 12, border: `1px solid ${C.slate200}`, marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: C.slate400, textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.05em" }}>Rumeur d'origine</p>
                <p style={{ fontSize: 14, color: C.slate800, fontWeight: 500, lineHeight: 1.5 }}>"{atomizingRumor?.text}"</p>
              </div>

              {isExtracting ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 30, height: 30, border: `3px solid ${C.blue50}`, borderTopColor: C.blue600, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                  <p style={{ fontSize: 13, color: C.slate500, fontWeight: 500 }}>L'IA analyse le texte et extrait les affirmations...</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.slate900, marginBottom: 4 }}>Affirmations extraites ({extractedClaims.length})</p>
                  {extractedClaims.map((claim, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 12, transition: "all .2s" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: C.blue50, color: C.blue600, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{idx + 1}</div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.slate700 }}>{claim}</div>
                      <button 
                        onClick={() => handleSaveClaim(claim, idx)}
                        disabled={saveLoading[idx]}
                        style={{ 
                          padding: "6px 12px", background: saveLoading[idx] ? C.slate100 : C.slate900, color: "#fff", 
                          borderRadius: 8, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer" 
                        }}
                      >
                        {saveLoading[idx] ? "..." : "Valider"}
                      </button>
                    </div>
                  ))}
                  {extractedClaims.length === 0 && !isExtracting && (
                    <p style={{ textAlign: "center", padding: 20, color: C.slate400, fontSize: 13 }}>Aucune affirmation extraite. Essayez d'ajouter des claims manuellement.</p>
                  )}
                </div>
              )}
            </div>
            
            <div style={{ padding: "20px 32px", background: C.slate50, borderTop: `1px solid ${C.slate200}`, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowAtomizeModal(false)} style={{ padding: "10px 20px", background: "#fff", border: `1px solid ${C.slate300}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: C.slate700, cursor: "pointer" }}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
