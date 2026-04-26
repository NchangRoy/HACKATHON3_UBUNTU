"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RumorsService, ClaimsService, EvidenceService, VerdictService, UsersService, ModeratorsService } from "@/api";
import type { Rumor, User } from "@/api";

const C = {
  blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
  green600: "#16a34a", green50: "#f0fdf4", red600: "#dc2626", red50: "#fef2f2",
  orange600: "#ea580c", orange50: "#fff7ed",
};

type Evidence = {
  id: string; realId: string; stance: "SUPPORTE" | "REFUTE" | "NEUTRE";
  auteur: string; type: string;
  t_event: string; t_obs: string; t_upload: string;
  hash: string; detail: string;
};

type Verdict = {
  id: string; status: "CONTESTE" | "PROB_VRAI" | "PROB_FAUX" | "CONFIRME" | "REFUTE";
  confiance: number;
  sources_pour: string[]; sources_contre: string[];
  regle: string; auteur: string; date: string;
  supersede: string | null; note: string;
};

const INITIAL_EVIDENCES: Evidence[] = [];
const INITIAL_VERDICTS: Verdict[] = [];

export default function RumeurDetailPage() {
  const { id } = useParams();
  const [rumor, setRumor] = useState<Rumor | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditLog, setAuditLog] = useState<any>(null);
  const [evidences, setEvidences] = useState<Evidence[]>(INITIAL_EVIDENCES);
  const [verdicts, setVerdicts] = useState<Verdict[]>(INITIAL_VERDICTS);
  const [modalMode, setModalMode] = useState<"NONE" | "EVIDENCE" | "VERDICT" | "AUDIT" | "VERDICT_DETAIL">("NONE");
  const [selectedVerdict, setSelectedVerdict] = useState<Verdict | null>(null);
  const [user, setUser] = useState<any>(null);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [penalRules, setPenalRules] = useState<{ id: string; title: string; description: string }[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    
    const savedRules = localStorage.getItem("penal_rules");
    if (savedRules) setPenalRules(JSON.parse(savedRules));
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rData, evRes, claimsRes, verdictsRes, usersRes, modsRes] = await Promise.all([
          RumorsService.getApiRumors1(id as string),
          EvidenceService.getApiEvidence1(id as string).catch(() => []),
          ClaimsService.getApiClaimsAll().catch(() => ({ data: [] })),
          VerdictService.getApiVerdictsAll().catch(() => ({ data: [] })),
          UsersService.getApiUsers().catch(() => ({ data: [] })),
          ModeratorsService.getApiModerators().catch(() => ({ data: [] }))
        ]);

        const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        
        const usersList = currentUser ? [currentUser] : [];
        if ((usersRes as any).data) usersList.push(...(usersRes as any).data);
        if ((modsRes as any).data) usersList.push(...(modsRes as any).data);
        
        const rumorData = (rData as any).data || rData;
        setRumor(rumorData);
        
        // --- Chargement des preuves ---
        let apiEvidences: Evidence[] = [];
        const evData = Array.isArray(evRes) ? evRes : (evRes as any).data;
        if (evData && Array.isArray(evData)) {
          apiEvidences = evData.map((e: any, idx: number) => {
            const meta = e.metadata || {};
            return {
              id: e.id ? e.id.substring(0, 8) : `E${idx + 1}`,
              realId: e.id || "",
              stance: (meta.stance || "NEUTRE").toUpperCase() as any,
              auteur: meta.auteur || e.uploader_name || "Anonyme",
              type: e.type || "text",
              t_event: e.t_event ? new Date(e.t_event).toLocaleTimeString() : "-",
              t_obs: e.t_observation ? new Date(e.t_observation).toLocaleTimeString() : "-",
              t_upload: e.t_upload ? new Date(e.t_upload).toLocaleTimeString() : "-",
              hash: e.hash_file ? e.hash_file.substring(0, 10) : "-",
              detail: meta.detail || "Sans description"
            };
          });
          setEvidences(apiEvidences);
        }

        // --- Chargement des verdicts via claims ---
        const allClaims: Array<{ id: string; text: string; rumor_id: string }> = (claimsRes as any).data || [];
        const allVerdicts: Array<any> = (verdictsRes as any).data || [];

        // Trouver les claim IDs liés à cette rumeur
        const rumorClaimIds = allClaims
          .filter(c => c.rumor_id === (id as string))
          .map(c => c.id);

        if (rumorClaimIds.length > 0) {
          // Stocker le premier claim trouvé pour les futures opérations
          setClaimId(rumorClaimIds[0]);
          localStorage.setItem(`claim_for_${id}`, rumorClaimIds[0]);
        }

        // Filtrer les verdicts correspondant aux claims de cette rumeur
        const rumorVerdicts = allVerdicts
          .filter(v => rumorClaimIds.includes(v.claim_id))
          .sort((a, b) => new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime());

        if (rumorVerdicts.length > 0) {
          const fetchedUserIds = new Set(usersList.map((u: User) => u.id));
          const missingUserIds = Array.from(new Set(rumorVerdicts.map(v => v.moderator_id).filter(Boolean).filter(id => !fetchedUserIds.has(id))));

          if (missingUserIds.length > 0) {
            const missingUsers = await Promise.all(
              missingUserIds.map(id => UsersService.getApiUsers1(id).catch(() => null))
            );
            missingUsers.forEach(u => {
              if (u) usersList.push(u);
            });
          }
        }

        const usersMap: Record<string, string> = {};
        usersList.forEach((u: User) => {
          if (u.id && u.name) usersMap[u.id] = u.name;
        });

        // Enrichissement "intelligent" : si on a des preuves avec le nom de l'uploader, on l'utilise pour mapper l'auteur
        const evDataRaw = Array.isArray(evRes) ? evRes : (evRes as any).data;
        if (evDataRaw && Array.isArray(evDataRaw)) {
          evDataRaw.forEach((e: any) => {
            if (e.uploaded_by && e.uploader_name && !usersMap[e.uploaded_by]) {
              usersMap[e.uploaded_by] = e.uploader_name;
            }
          });
        }

        if (rumorVerdicts.length > 0) {
          const mappedVerdicts: Verdict[] = rumorVerdicts.map((v, idx) => ({
            id: `V${idx + 1}`,
            status: (v.status || "CONTESTE").toUpperCase() as any,
            confiance: parseFloat(v.confidence_score) || 0.95,
            sources_pour: v.evidences_for || [],
            sources_contre: v.evidences_against || [],
            regle: v.summary || "Règle appliquée",
            auteur: usersMap[v.moderator_id] || v.moderator_name || "Modérateur",
            date: v.published_at ? new Date(v.published_at).toLocaleString() : "",
            supersede: idx > 0 ? `V${idx}` : null,
            note: v.summary || ""
          }));
          setVerdicts(mappedVerdicts);
        }
        setUsersMap(usersMap);
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // State forms
  const [newEv, setNewEv] = useState<{ stance: string; type: string; auteur: string; detail: string; file: File | null }>({ 
    stance: "SUPPORTE", type: "text", auteur: "", detail: "", file: null 
  });
  const [newVer, setNewVer] = useState({ 
    status: "CONFIRME", note: "", regle: "", ruleId: "",
    selectedEvFor: [] as string[],
    selectedEvAgainst: [] as string[]
  });

  const defaultVerdict: Verdict = {
    id: "V0",
    status: "CONTESTE",
    confiance: 0,
    sources_pour: [],
    sources_contre: [],
    regle: "Analyse initiale",
    auteur: "Système",
    date: "-",
    supersede: null,
    note: "Aucun verdict n'a encore été rendu pour ce signalement."
  };

  const activeVerdict = verdicts.length > 0 ? verdicts[verdicts.length - 1] : defaultVerdict;

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setLoading(true);
      let targetId = claimId;
      
      // Si pas de claimId, on tente de créer le claim atomique d'abord (atomisation on-demand)
      if (!targetId) {
        console.log("Le claim n'existe pas encore. Création du claim atomique pour la rumeur...");
        const res = await ClaimsService.postApiClaims({
          rumor_id: id as string,
          text: rumor?.text || "Claim principal"
        });
        // Extraire l'ID selon le format de réponse (souvent {data: {id: ...}} ou directement {id: ...})
        targetId = res.id || res.data?.id;
        if (targetId) setClaimId(targetId);
      }

      if (!targetId) {
        alert("Impossible de générer un Claim pour cette rumeur. L'opération a échoué.");
        return;
      }

      console.log("Envoi de preuve pour la rumeur (format JSON avec metadata):", id);
      const now = new Date().toISOString();
      await EvidenceService.postApiEvidence({
        rumor_id: id as string,
        type: newEv.type as any,
        file_url: newEv.file ? "https://storage.placeholder.com/mock-upload" : "https://storage.placeholder.com/none",
        t_event: now,
        t_observation: now,
        hash_file: "sha256-" + Math.random().toString(36).substring(2),
        uploaded_by: user?.id || "anonymous",
        metadata: {
          stance: newEv.stance,
          detail: newEv.detail,
          auteur: newEv.auteur
        }
      });
      
      // Optimistic UI update instead of reload
      const newEvObj: Evidence = {
        id: "E" + Date.now().toString().substring(5),
        realId: "pending-" + Math.random().toString(36).substring(2, 7),
        stance: newEv.stance.toUpperCase() as any,
        auteur: newEv.auteur || user?.name || "Modérateur",
        type: newEv.type,
        t_event: new Date().toLocaleTimeString(),
        t_obs: new Date().toLocaleTimeString(),
        t_upload: new Date().toLocaleTimeString(),
        hash: "sha256-" + Math.random().toString(36).substring(2, 10),
        detail: newEv.detail || "Preuve ajoutée"
      };
      
      setEvidences(prev => [...prev, newEvObj]);
      
      // Clear form
      setNewEv({ stance: "SUPPORTE", type: "text", auteur: "", detail: "", file: null });
    } catch (err) {
      console.error("Erreur lors de l'ajout de la preuve:", err);
      alert("Erreur lors de l'ajout de la preuve. Vérifiez que le backend autorise l'atomisation.");
    } finally {
      setLoading(false);
      setModalMode("NONE");
    }
  };

  const handleAddVerdict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      let targetId = claimId;

      if (!targetId) {
        const res = await ClaimsService.postApiClaims({
          rumor_id: id as string,
          text: rumor?.text || "Claim principal"
        });
        targetId = res.id || res.data?.id;
        if (targetId) setClaimId(targetId);
      }

      if (!targetId) {
        alert("Impossible de générer un Claim pour cette rumeur.");
        return;
      }
      
      // Mapping des statuts locaux vers les statuts API
      const statusMap: Record<string, any> = {
        "CONFIRME": "True",
        "REFUTE": "False",
        "PROB_VRAI": "ProbablyTrue",
        "CONTESTE": "Contested"
      };

      const selectedRule = penalRules.find(r => r.id === newVer.ruleId);
      const finalSummary = selectedRule 
        ? `[${selectedRule.title}] ${newVer.note}` 
        : newVer.note;

      const verdictData: any = {
        claim_id: targetId,
        status: statusMap[newVer.status] || "Contested",
        summary: finalSummary,
        confidence_score: 0.95,
        moderator_id: user?.id || "00000000-0000-0000-0000-000000000000", // Fallback sur un UUID valide si inconnu
        is_published: true
      };

      if (newVer.selectedEvFor.length > 0) verdictData.evidences_for = newVer.selectedEvFor;
      if (newVer.selectedEvAgainst.length > 0) verdictData.evidences_against = newVer.selectedEvAgainst;

      await VerdictService.postApiVerdicts(verdictData);
      
      window.location.reload();
    } catch (err) {
      console.error("Erreur lors de l'émission du verdict:", err);
      alert("Erreur lors de l'émission du verdict.");
    } finally {
      setLoading(false);
      setLoading(false);
      setModalMode("NONE");
    }
  };

  const handleViewVerdict = (v: Verdict) => {
    setSelectedVerdict(v);
    setModalMode("VERDICT_DETAIL");
  };

  const handleOpenAudit = async () => {
    if (!claimId) {
      alert("Aucun claim n'a encore été créé pour cette rumeur. L'audit complet n'est pas disponible.");
      setModalMode("AUDIT");
      return;
    }
    setLoading(true);
    try {
      const res = await ClaimsService.getApiClaimsAudit(claimId);
      setAuditLog((res as any).data || res);
    } catch (err) {
      // Backend might return 404 if the endpoint is not yet implemented
      // Fallback to local simulation mode without logging to console.error
      setAuditLog(null);
    } finally {
      setLoading(false);
      setModalMode("AUDIT");
    }
  };

  const getStatusColor = (s: string) => {
    const status = (s || "").toUpperCase();
    // ✅ Vrai / Confirmé → Vert
    if (status === "TRUE" || status === "CONFIRME") 
      return { bg: "#f0fdf4", color: "#16a34a", label: "✓ Confirmé" };
    // ❌ Faux / Réfuté → Rouge
    if (status === "FALSE" || status === "REFUTE") 
      return { bg: "#fef2f2", color: "#dc2626", label: "✗ Réfuté" };
    // 🔵 Probablement vrai → Bleu
    if (status === "PROBABLYTRUE" || status === "PROB_VRAI") 
      return { bg: "#eff6ff", color: "#2563eb", label: "~ Prob. Vrai" };
    // ⚠️ Contesté → Orange
    if (status === "CONTESTED" || status === "CONTESTE") 
      return { bg: "#fff7ed", color: "#ea580c", label: "⚠ Contesté" };
    // ⬜ Non vérifiable / Neutre → Gris
    if (status === "UNVERIFIABLE") 
      return { bg: "#f1f5f9", color: "#64748b", label: "○ Non vérifiable" };
    // Par défaut → Gris (en attente)
    return { bg: "#f1f5f9", color: "#64748b", label: "○ En attente" };
  };

  return (
    <div style={{ 
      minHeight: "100vh", background: C.slate50, paddingBottom: 64,
      backgroundImage: `radial-gradient(${C.slate300} 2px, transparent 2px)`,
      backgroundSize: "24px 24px"
    }}>
      {/* ── Navbar (Harmonisée Glassmorphism) ── */}
      <header className="r-navbar" style={{ 
        position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", 
        width: "calc(100% - 24px)", maxWidth: 1200, zIndex: 100,
        background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.4)", borderRadius: 16,
        boxShadow: `0 8px 32px ${C.slate900}10`
      }}>
        <div className="r-navbar-inner" style={{ padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/moderateur/dashboard" style={{ color: C.slate600, display: "flex", alignItems: "center", textDecoration: "none", fontWeight: 700, fontSize: 13, transition: "color .2s" }}
            onMouseEnter={e => e.currentTarget.style.color = C.slate900}
            onMouseLeave={e => e.currentTarget.style.color = C.slate600}
          >
            &larr; Dashboard
          </Link>
          <div style={{ width: 1, height: 20, background: C.slate200 }} />
          <div style={{ fontWeight: 800, fontSize: 15, color: C.slate900, letterSpacing: "-0.3px" }}>Détail du Signalement #C2</div>
        </div>
      </header>

      <main className="r-detail-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 16px 32px", display: "grid", gridTemplateColumns: "1fr min(380px, 100%)", gap: 24 }}>

        {/* Colonne Principale */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Claim Header */}
          <div style={{ background: "#fff", padding: 32, borderRadius: 8, border: `1px solid ${C.slate200}`, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ padding: "4px 10px", background: C.slate100, color: C.slate600, fontSize: 11, fontWeight: 700, borderRadius: 6, textTransform: "uppercase" }}>{rumor?.location || "Localisation"}</span>
              <span style={{ padding: "4px 10px", background: getStatusColor(activeVerdict.status).bg, color: getStatusColor(activeVerdict.status).color, fontSize: 12, fontWeight: 700, borderRadius: 6 }}>
                {getStatusColor(activeVerdict.status).label}
              </span>
              <span style={{ color: C.slate400, fontSize: 12, marginLeft: 8 }}>
                Signalé par <strong style={{ color: C.slate600 }}>{usersMap[rumor?.user_id || ""] || (rumor?.user_id ? `Utilisateur #${rumor.user_id.substring(0, 5)}` : "Anonyme")}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.slate900, lineHeight: 1.3, letterSpacing: "-0.5px" }}>
              {rumor?.text || "Chargement..."}
            </h1>
            <p style={{ marginTop: 12, fontSize: 15, color: C.slate600, lineHeight: 1.6 }}>
              <strong>Avis public :</strong> {activeVerdict.note}
            </p>
          </div>

          {/* Registre des Preuves */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.slate900 }}>Registre des Preuves ({evidences.length})</h2>
              <button onClick={() => setModalMode("EVIDENCE")} style={{ 
                padding: "8px 16px", background: C.slate900, color: "#fff", borderRadius: 8, 
                fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
                transition: "all .2s", boxShadow: `0 4px 10px ${C.slate900}20`
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.slate800}
                onMouseLeave={e => e.currentTarget.style.background = C.slate900}
              >
                + Ajouter Preuve
              </button>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 8, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.slate50, borderBottom: `1px solid ${C.slate200}`, textAlign: "left", color: C.slate500 }}>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>ID</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Position</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Détail & Type</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Auteur</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Chronologie (Evt / Obs / Up)</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {evidences.map(e => (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${C.slate100}` }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{e.id}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: e.stance === "SUPPORTE" ? C.green50 : C.red50, color: e.stance === "SUPPORTE" ? C.green600 : C.red600 }}>
                          {e.stance}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: C.slate900 }}>{e.detail}</div>
                        <div style={{ color: C.slate500, fontSize: 11, marginTop: 2 }}>{e.type}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: C.slate600 }}>{e.auteur}</td>
                      <td style={{ padding: "12px 16px", color: C.slate500, fontSize: 12 }}>
                        {e.t_event} / {e.t_obs} / {e.t_upload}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", color: C.slate400 }}>{e.hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Colonne Sidebar (Verdicts) */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.slate900 }}>Arbre des Verdicts</h2>
            {user?.role === "moderator" && (
              <button onClick={() => setModalMode("VERDICT")} style={{ 
                padding: "6px 14px", background: "#fff", border: `1px solid ${C.slate300}`, color: C.slate900, 
                borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s" 
              }}
                onMouseEnter={e => { e.currentTarget.style.background = C.slate50; e.currentTarget.style.borderColor = C.slate400; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.slate300; }}
              >
                Nouveau
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            {/* Ligne connectrice */}
            <div style={{ position: "absolute", left: 16, top: 20, bottom: 20, width: 2, background: C.slate200, zIndex: 0 }} />

            {[defaultVerdict, ...verdicts].map((v, i) => {
              const isDefault = v.id === "V0";
              const isActive = i === verdicts.length; // Le dernier élément est l'actif
              return (
                <div key={v.id} style={{ display: "flex", gap: 16, position: "relative", zIndex: 1, marginBottom: 24 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: isActive ? C.blue600 : C.slate200, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: 13, border: `4px solid ${C.slate50}` }}>
                    {isDefault ? "0" : v.id}
                  </div>
                  <div 
                    onClick={() => handleViewVerdict(v)}
                    style={{ 
                      background: "#fff", 
                      border: `1px solid ${isActive ? C.blue600 : C.slate200}`, 
                      borderRadius: 8, 
                      padding: 16, 
                      flex: 1, 
                      opacity: isActive ? 1 : 0.7,
                      cursor: "pointer",
                      transition: "all .2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue600; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isActive ? C.blue600 : C.slate200; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                      <span style={{ 
                        padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                        background: getStatusColor(v.status).bg, 
                        color: getStatusColor(v.status).color
                      }}>
                        {getStatusColor(v.status).label}
                      </span>
                      <span style={{ fontSize: 11, color: C.slate400 }}>
                        {v.date} &bull; Par <strong style={{ color: C.slate600 }}>{v.auteur}</strong>
                      </span>
                    </div>
                    {v.supersede && (
                      <div style={{ fontSize: 11, color: C.slate500, marginBottom: 8, background: C.slate100, display: "inline-block", padding: "2px 6px", borderRadius: 4 }}>
                        Supersède {v.supersede}
                      </div>
                    )}
                    <p style={{ fontSize: 13, color: C.slate600, lineHeight: 1.5, marginBottom: 12 }}>{v.note}</p>
                    <div style={{ fontSize: 11, color: C.slate400, borderTop: `1px dashed ${C.slate200}`, paddingTop: 8 }}>
                      <strong>Sources:</strong> {v.sources_pour.length + v.sources_contre.length} preuve(s) liée(s) <br />
                      <strong>Règle:</strong> {v.regle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 24 }}>
            <button onClick={handleOpenAudit} disabled={loading} style={{ 
              width: "100%", padding: "14px", background: loading ? C.slate200 : C.slate100, border: `1px solid ${C.slate200}`, 

              color: C.slate900, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", 
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .2s" 
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.slate200; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.slate100; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {loading ? "Génération en cours..." : "Générer Rapport d'Audit"}
            </button>
          </div>
        </div>
      </main>

      {/* ── Modales Harmonisées ── */}
      {modalMode !== "NONE" && (
        <div style={{ 
          position: "fixed", inset: 0, zIndex: 1000, 
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)" 
        }}>
          <div style={{ 
            background: "rgba(255, 255, 255, 0.85)", 
            backdropFilter: "blur(20px)",
            width: "100%", maxWidth: modalMode === "AUDIT" ? 800 : 520, 
            maxHeight: "90vh",
            borderRadius: 32, padding: "40px 32px", 
            boxShadow: `0 32px 64px -12px ${C.slate900}40`,
            border: "1px solid rgba(255, 255, 255, 0.5)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            animation: "modalFadeIn 0.3s ease-out"
          }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 24, background: C.blue600, borderRadius: 4 }} />
                <h3 style={{ fontSize: 24, fontWeight: 900, color: C.slate900, letterSpacing: "-0.5px" }}>
                  {modalMode === "EVIDENCE" ? "Enregistrer une Preuve" : modalMode === "VERDICT" ? "Rendre un Verdict" : "Rapport d'Audit"}
                </h3>
              </div>
              <button onClick={() => setModalMode("NONE")} style={{ 
                width: 32, height: 32, borderRadius: "50%", background: C.slate100, border: "none", 
                fontSize: 20, cursor: "pointer", color: C.slate500, display: "flex", alignItems: "center", 
                justifyContent: "center", transition: "all .2s" 
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.slate200}
                onMouseLeave={e => e.currentTarget.style.background = C.slate100}
              >
                &times;
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
              {/* FORM EVIDENCE */}
              {modalMode === "EVIDENCE" && (
              <form onSubmit={handleAddEvidence} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Position</label>
                    <select value={newEv.stance} onChange={e => setNewEv({ ...newEv, stance: e.target.value })} style={{ width: "100%", padding: "12px 16px", background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 12, fontSize: 14, fontWeight: 500, outline: "none" }}>
                      <option value="SUPPORTE">Supporte la rumeur</option>
                      <option value="REFUTE">Réfute la rumeur</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type de preuve</label>
                    <select value={newEv.type} onChange={e => setNewEv({ ...newEv, type: e.target.value })} style={{ width: "100%", padding: "12px 16px", background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 12, fontSize: 14, fontWeight: 500, outline: "none" }}>
                      <option value="text">Texte / Témoignage</option>
                      <option value="image">Image / Photo</option>
                      <option value="video">Vidéo</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>
                </div>
                {(newEv.type === "image" || newEv.type === "video" || newEv.type === "audio") && (
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fichier ({newEv.type})</label>
                    <div style={{ position: "relative" }}>
                      <input 
                        id="file-upload"
                        type="file" 
                        accept={newEv.type === "image" ? "image/*" : newEv.type === "video" ? "video/*" : "audio/*"}
                        onChange={e => setNewEv({ ...newEv, file: e.target.files?.[0] || null })}
                        style={{ display: "none" }} 
                      />
                      <label htmlFor="file-upload" style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                        padding: "24px", background: "#fff", border: `2px dashed ${C.slate200}`,
                        borderRadius: 16, cursor: "pointer", transition: "all .2s",
                        color: C.slate600, fontSize: 14, fontWeight: 600
                      }}
                        onMouseEnter={e => { 
                          e.currentTarget.style.borderColor = C.blue600; 
                          e.currentTarget.style.background = C.blue50; 
                          e.currentTarget.style.color = C.blue600; 
                        }}
                        onMouseLeave={e => { 
                          e.currentTarget.style.borderColor = C.slate200; 
                          e.currentTarget.style.background = "#fff"; 
                          e.currentTarget.style.color = C.slate600; 
                        }}
                      >
                        <div style={{ 
                          width: 40, height: 40, borderRadius: "50%", background: C.blue50, 
                          display: "flex", alignItems: "center", justifyContent: "center", color: C.blue600 
                        }}>
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ color: C.slate900, fontWeight: 700 }}>{newEv.file ? newEv.file.name : "Choisir un fichier"}</div>
                          <div style={{ fontSize: 12, color: C.slate500, fontWeight: 500 }}>{newEv.file ? `${(newEv.file.size / 1024).toFixed(1)} KB` : `Cliquez pour uploader votre média (${newEv.type})`}</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Détail de la preuve</label>
                  <input required value={newEv.detail} onChange={e => setNewEv({ ...newEv, detail: e.target.value })} placeholder="Décrivez le contenu ici..." style={{ width: "100%", padding: "12px 16px", background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 12, fontSize: 14, outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Source / Auteur</label>
                  <input required value={newEv.auteur} onChange={e => setNewEv({ ...newEv, auteur: e.target.value })} placeholder="Ex: Mama Céleste" style={{ width: "100%", padding: "12px 16px", background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 12, fontSize: 14, outline: "none" }} />
                </div>
                
                <button type="submit" 
                  disabled={loading}
                  style={{ 
                    marginTop: 12, width: "100%", padding: "16px", background: loading ? C.slate400 : C.slate900, 
                    color: "#fff", fontWeight: 700, borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer",
                    transition: "all .2s", boxShadow: loading ? "none" : `0 8px 24px ${C.slate900}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = C.slate800; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                  onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = C.slate900; e.currentTarget.style.transform = "translateY(0)"; } }}
                >
                  {loading && (
                    <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {loading ? "Traitement en cours..." : "Hacher et Sauvegarder"}
                </button>
              </form>
            )}

            {/* FORM VERDICT */}
            {modalMode === "VERDICT" && (
              <form onSubmit={handleAddVerdict} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nouveau Statut</label>
                  <select value={newVer.status} onChange={e => setNewVer({ ...newVer, status: e.target.value })} style={{ width: "100%", padding: "12px 16px", background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 12, fontSize: 14, fontWeight: 600, outline: "none" }}>
                    <option value="CONTESTE">Contesté</option>
                    <option value="PROB_VRAI">Probablement Vrai</option>
                    <option value="PROB_FAUX">Probablement Faux</option>
                    <option value="CONFIRME">Confirmé</option>
                    <option value="REFUTE">Réfuté</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Article Pénal de référence</label>
                  <select value={newVer.ruleId} onChange={e => setNewVer({ ...newVer, ruleId: e.target.value })} style={{ width: "100%", padding: "12px 16px", background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 12, fontSize: 14, fontWeight: 500, outline: "none" }}>
                    <option value="">Aucun article sélectionné</option>
                    {penalRules.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                  {penalRules.length === 0 && (
                    <p style={{ fontSize: 11, color: C.slate500, marginTop: 4 }}>
                      ⚠️ Aucune règle définie. <Link href="/moderateur/dashboard" style={{ color: C.blue600, fontWeight: 600 }}>Gérer les articles pénaux</Link>
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Note publique (Transparence)</label>
                  <textarea required value={newVer.note} onChange={e => setNewVer({ ...newVer, note: e.target.value })} rows={3} style={{ width: "100%", padding: "12px 16px", background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.slate700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sélection des Preuves (Traçabilité)</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 200, overflowY: "auto", padding: 12, background: C.slate50, borderRadius: 12, border: `1px solid ${C.slate200}` }}>
                    {evidences.map(ev => (
                      <div key={ev.realId || ev.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
                        <div style={{ flex: 1, color: C.slate700 }}>
                          <span style={{ fontWeight: 700, color: ev.stance === "SUPPORTE" ? C.green600 : C.red600 }}>[{ev.id}]</span> {ev.detail.substring(0, 40)}...
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                            <input type="checkbox" checked={newVer.selectedEvFor.includes(ev.realId)} onChange={e => {
                              const list = e.target.checked ? [...newVer.selectedEvFor, ev.realId] : newVer.selectedEvFor.filter(id => id !== ev.realId);
                              setNewVer({ ...newVer, selectedEvFor: list });
                            }} /> Pour
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                            <input type="checkbox" checked={newVer.selectedEvAgainst.includes(ev.realId)} onChange={e => {
                              const list = e.target.checked ? [...newVer.selectedEvAgainst, ev.realId] : newVer.selectedEvAgainst.filter(id => id !== ev.realId);
                              setNewVer({ ...newVer, selectedEvAgainst: list });
                            }} /> Contre
                          </label>
                        </div>
                      </div>
                    ))}
                    {evidences.length === 0 && <div style={{ fontSize: 12, color: C.slate400, textAlign: "center" }}>Aucune preuve disponible pour l'instant.</div>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.slate500, background: "rgba(15,23,42,0.03)", padding: "12px 16px", borderRadius: 12, border: `1px dashed ${C.slate200}` }}>
                  💡 En validant, vous créerez le verdict <strong>V{verdicts.length + 1}</strong> qui supersèdera <strong>{activeVerdict.id}</strong>. L'historique sera conservé.
                </div>
                <button type="submit" 
                  disabled={loading}
                  style={{ 
                    marginTop: 12, width: "100%", padding: "16px", background: loading ? C.slate400 : C.slate900, 
                    color: "#fff", fontWeight: 700, borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer",
                    transition: "all .2s", boxShadow: loading ? "none" : `0 8px 24px ${C.slate900}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = C.slate800; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                  onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = C.slate900; e.currentTarget.style.transform = "translateY(0)"; } }}
                >
                  {loading && (
                    <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {loading ? "Commit en cours..." : "Commit Verdict"}
                </button>
              </form>
            )}

              {/* AUDIT */}
              {modalMode === "AUDIT" && (
                <div>
                  <pre style={{ background: C.slate900, color: "#e2e8f0", padding: 20, borderRadius: 8, fontSize: 12, overflowX: "auto", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                    {auditLog ? JSON.stringify(auditLog, null, 2) : `RAPPORT D'AUDIT — Rumor #${id} — ${new Date().toLocaleDateString()}
                    
En attente de données structurées depuis le backend...
                    
=============================================
HISTORIQUE LOCAL (Simulation)
=============================================
${verdicts.map(v => `
${v.date} : Statut → ${v.status} (ID: ${v.id})
  Motif : ${v.regle}
  Auteur : ${v.auteur}
`).join("")}`}
                  </pre>
                  <button onClick={() => setModalMode("NONE")} style={{ 
                    marginTop: 24, width: "100%", padding: "16px", background: C.slate100, 
                    color: C.slate900, fontWeight: 700, borderRadius: 14, border: "none", cursor: "pointer",
                    transition: "all .2s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = C.slate200}
                    onMouseLeave={e => e.currentTarget.style.background = C.slate100}
                  >
                    Fermer le rapport
                  </button>
                </div>
              )}

              {/* DETAIL VERDICT */}
              {modalMode === "VERDICT_DETAIL" && selectedVerdict && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ 
                      padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: 700,
                      background: getStatusColor(selectedVerdict.status).bg, 
                      color: getStatusColor(selectedVerdict.status).color
                    }}>
                      {getStatusColor(selectedVerdict.status).label}
                    </span>
                    <span style={{ fontSize: 13, color: C.slate500 }}>{selectedVerdict.date}</span>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: C.slate400, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Modérateur</label>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.slate900 }}>{selectedVerdict.auteur}</div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: C.slate400, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>ID Verdict</label>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.slate900 }}>{selectedVerdict.id}</div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: C.slate400, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Note de décision</label>
                    <div style={{ fontSize: 14, color: C.slate700, lineHeight: 1.6, background: C.slate50, padding: "16px 20px", borderRadius: 16, border: `1px solid ${C.slate100}` }}>
                      {selectedVerdict.note || "Aucune note détaillée."}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: C.slate400, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Base légale / Règle</label>
                    <div style={{ fontSize: 14, color: C.slate600, fontWeight: 500 }}>{selectedVerdict.regle}</div>
                  </div>

                  {selectedVerdict.confiance > 0 && (
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: C.slate400, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Indice de confiance</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ flex: 1, height: 8, background: C.slate100, borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${selectedVerdict.confiance * 100}%`, height: "100%", background: C.blue600, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.blue600 }}>{Math.round(selectedVerdict.confiance * 100)}%</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: C.slate400, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Preuves analysées</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", paddingRight: 4 }}>
                      {selectedVerdict.sources_pour.map(id => {
                        const ev = evidences.find(e => e.realId === id || e.id === id);
                        return (
                          <div key={id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, background: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: 12 }}>
                            <div style={{ padding: "2px 6px", background: C.green600, color: "#fff", borderRadius: 4, fontSize: 9, fontWeight: 900 }}>POUR</div>
                            <div style={{ fontSize: 13, color: "#166534", fontWeight: 500 }}>{ev ? ev.detail : `Preuve #${id}`}</div>
                          </div>
                        );
                      })}
                      {selectedVerdict.sources_contre.map(id => {
                        const ev = evidences.find(e => e.realId === id || e.id === id);
                        return (
                          <div key={id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 12 }}>
                            <div style={{ padding: "2px 6px", background: C.red600, color: "#fff", borderRadius: 4, fontSize: 9, fontWeight: 900 }}>CONTRE</div>
                            <div style={{ fontSize: 13, color: "#991b1b", fontWeight: 500 }}>{ev ? ev.detail : `Preuve #${id}`}</div>
                          </div>
                        );
                      })}
                      {selectedVerdict.sources_pour.length === 0 && selectedVerdict.sources_contre.length === 0 && (
                        <div style={{ textAlign: "center", padding: 20, color: C.slate400, fontSize: 13, background: C.slate50, borderRadius: 12, border: `1px dashed ${C.slate200}` }}>
                          Aucune preuve directe liée.
                        </div>
                      )}
                    </div>
                  </div>

                  <button onClick={() => setModalMode("NONE")} style={{ 
                    marginTop: 12, width: "100%", padding: "16px", background: C.slate900, 
                    color: "#fff", fontWeight: 700, borderRadius: 16, border: "none", cursor: "pointer",
                    boxShadow: `0 8px 20px ${C.slate900}30`
                  }}>
                    Fermer les détails
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Styles d'animation */}
      <GlobalStyles />
    </div>
  );
}

// Styles globaux pour les animations
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `}} />
);
