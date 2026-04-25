"use client";

import { useState } from "react";
import Link from "next/link";

const C = {
  blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
  green600: "#16a34a", green50: "#f0fdf4", red600: "#dc2626", red50: "#fef2f2",
  orange600: "#ea580c", orange50: "#fff7ed",
};

type Evidence = {
  id: string; stance: "SUPPORTE" | "REFUTE" | "NEUTRE";
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

const INITIAL_EVIDENCES: Evidence[] = [
  { id: "E1", stance: "SUPPORTE", auteur: "Mama Céleste (Témoin)", type: "Vidéo", t_event: "14:00", t_obs: "14:05", t_upload: "14:09", hash: "a3f9...", detail: "Vidéo eau noirâtre devant domicile" },
  { id: "E2", stance: "SUPPORTE", auteur: "Jean-Paul (Journaliste citoyen)", type: "Tweet", t_event: "14:00", t_obs: "14:10", t_upload: "14:12", hash: "8b2a...", detail: "Témoignage indirect habitant" },
  { id: "E3", stance: "REFUTE", auteur: "Compte Officiel CDE", type: "Communiqué", t_event: "14:00", t_obs: "14:18", t_upload: "14:18", hash: "f9c1...", detail: "Déni de risque sanitaire" },
  { id: "E5", stance: "SUPPORTE", auteur: "Pharmacien M.", type: "Registre médical", t_event: "14:15", t_obs: "14:23", t_upload: "15:00", hash: "b7c2...", detail: "Deux enfants avec vomissements" },
  { id: "E6", stance: "SUPPORTE", auteur: "MINSANTE (Appel)", type: "Audio", t_event: "15:05", t_obs: "15:05", t_upload: "15:08", hash: "d41f...", detail: "Déclaration orale déploiement équipe" },
];

const INITIAL_VERDICTS: Verdict[] = [
  {
    id: "V1", status: "CONTESTE", confiance: 0.35,
    sources_pour: ["E1", "E2"], sources_contre: ["E3"],
    regle: "Règle_v2.1 : Sans source officielle, témoignage visuel seul -> Contesté",
    auteur: "Modérateur_99", date: "14:31:22", supersede: null,
    note: "Odeur et couleur suspectes signalées, CDE nie tout risque. En attente d'analyse."
  },
  {
    id: "V2", status: "PROB_VRAI", confiance: 0.72,
    sources_pour: ["E1", "E2", "E5", "E6"], sources_contre: ["E3 (pondérée 0.3)"],
    regle: "Règle_v2.1 : Déclaration sanitaire + cas documentés -> Prob. Vrai",
    auteur: "Modérateur_99", date: "15:12:44", supersede: "V1",
    note: "Deux cas médicaux documentés. MINSANTE en route. Évitez tout contact avec l'eau."
  }
];

export default function RumeurDetailDemo() {
  const [evidences, setEvidences] = useState<Evidence[]>(INITIAL_EVIDENCES);
  const [verdicts, setVerdicts] = useState<Verdict[]>(INITIAL_VERDICTS);

  const [modalMode, setModalMode] = useState<"NONE" | "EVIDENCE" | "VERDICT" | "AUDIT">("NONE");

  // State forms
  const [newEv, setNewEv] = useState({ stance: "SUPPORTE", type: "Document", auteur: "", detail: "" });
  const [newVer, setNewVer] = useState({ status: "CONFIRME", note: "", regle: "" });

  const activeVerdict = verdicts[verdicts.length - 1];

  const handleAddEvidence = (e: any) => {
    e.preventDefault();
    const ev: Evidence = {
      id: `E${evidences.length + 1}`,
      stance: newEv.stance as any, auteur: newEv.auteur, type: newEv.type, detail: newEv.detail,
      t_event: "15:20", t_obs: "15:25", t_upload: "15:30", hash: Math.random().toString(36).substr(2, 6) + "..."
    };
    setEvidences([...evidences, ev]);
    setModalMode("NONE");
    setNewEv({ stance: "SUPPORTE", type: "Document", auteur: "", detail: "" });
  };

  const handleAddVerdict = (e: any) => {
    e.preventDefault();
    const ver: Verdict = {
      id: `V${verdicts.length + 1}`,
      status: newVer.status as any, confiance: 0.95,
      sources_pour: evidences.filter(e => e.stance === "SUPPORTE").map(e => e.id),
      sources_contre: evidences.filter(e => e.stance === "REFUTE").map(e => e.id),
      regle: newVer.regle || "Règle_v3.0 : Décision confirmée manuellement",
      auteur: "Admin_Local", date: new Date().toLocaleTimeString(),
      supersede: activeVerdict.id,
      note: newVer.note
    };
    setVerdicts([...verdicts, ver]);
    setModalMode("NONE");
    setNewVer({ status: "CONFIRME", note: "", regle: "" });
  };

  const getStatusColor = (s: string) => {
    if (s === "CONTESTE") return { bg: C.orange50, color: C.orange600 };
    if (s === "PROB_VRAI" || s === "CONFIRME") return { bg: C.green50, color: C.green600 };
    return { bg: C.red50, color: C.red600 };
  };

  return (
    <div style={{ minHeight: "100vh", background: C.slate50, paddingBottom: 64 }}>
      {/* ── Navbar ── */}
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.slate200}`, position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: C.slate500, display: "flex", alignItems: "center", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
            &larr; Retour
          </Link>
          <div style={{ width: 1, height: 24, background: C.slate200 }} />
          <div style={{ fontWeight: 700, fontSize: 16, color: C.slate900 }}>Détail du Signalement #C2</div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
        
        {/* Colonne Principale */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Claim Header */}
          <div style={{ background: "#fff", padding: 32, borderRadius: 8, border: `1px solid ${C.slate200}`, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ padding: "4px 10px", background: C.slate100, color: C.slate600, fontSize: 11, fontWeight: 700, borderRadius: 6, textTransform: "uppercase" }}>Santé</span>
              <span style={{ padding: "4px 10px", background: getStatusColor(activeVerdict.status).bg, color: getStatusColor(activeVerdict.status).color, fontSize: 12, fontWeight: 700, borderRadius: 6 }}>
                Statut actuel : {activeVerdict.status}
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.slate900, lineHeight: 1.3, letterSpacing: "-0.5px" }}>
              L'eau qui fuit rue Melen est contaminée et dangereuse pour la santé.
            </h1>
            <p style={{ marginTop: 12, fontSize: 15, color: C.slate600, lineHeight: 1.6 }}>
              <strong>Avis public :</strong> {activeVerdict.note}
            </p>
          </div>

          {/* Registre des Preuves */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.slate900 }}>Registre des Preuves ({evidences.length})</h2>
              <button onClick={() => setModalMode("EVIDENCE")} style={{ padding: "6px 12px", background: C.slate900, color: "#fff", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
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
            <button onClick={() => setModalMode("VERDICT")} style={{ padding: "6px 12px", background: "#fff", border: `1px solid ${C.slate300}`, color: C.slate900, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Nouveau
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            {/* Ligne connectrice */}
            <div style={{ position: "absolute", left: 16, top: 20, bottom: 20, width: 2, background: C.slate200, zIndex: 0 }} />
            
            {verdicts.map((v, i) => {
              const isActive = i === verdicts.length - 1;
              return (
                <div key={v.id} style={{ display: "flex", gap: 16, position: "relative", zIndex: 1, marginBottom: 24 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: isActive ? C.blue600 : C.slate200, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: 13, border: `4px solid ${C.slate50}` }}>
                    {v.id}
                  </div>
                  <div style={{ background: "#fff", border: `1px solid ${isActive ? C.blue600 : C.slate200}`, borderRadius: 8, padding: 16, flex: 1, opacity: isActive ? 1 : 0.7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: isActive ? C.slate900 : C.slate500 }}>{v.status}</span>
                      <span style={{ fontSize: 12, color: C.slate400 }}>{v.date}</span>
                    </div>
                    {v.supersede && (
                      <div style={{ fontSize: 11, color: C.slate500, marginBottom: 8, background: C.slate100, display: "inline-block", padding: "2px 6px", borderRadius: 4 }}>
                        Supersède {v.supersede}
                      </div>
                    )}
                    <p style={{ fontSize: 13, color: C.slate600, lineHeight: 1.5, marginBottom: 12 }}>{v.note}</p>
                    <div style={{ fontSize: 11, color: C.slate400, borderTop: `1px dashed ${C.slate200}`, paddingTop: 8 }}>
                      <strong>Pour:</strong> {v.sources_pour.join(", ")} <br/>
                      <strong>Contre:</strong> {v.sources_contre.join(", ")} <br/>
                      <strong>Règle:</strong> {v.regle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 24 }}>
             <button onClick={() => setModalMode("AUDIT")} style={{ width: "100%", padding: "12px", background: C.slate100, border: `1px solid ${C.slate300}`, color: C.slate900, borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Générer Rapport d'Audit
             </button>
          </div>
        </div>
      </main>

      {/* ── Modales ── */}
      {modalMode !== "NONE" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: modalMode === "AUDIT" ? 700 : 500, borderRadius: 12, padding: 32, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>
                {modalMode === "EVIDENCE" ? "Enregistrer une Preuve" : modalMode === "VERDICT" ? "Rendre un Verdict" : "Rapport d'Audit"}
              </h3>
              <button onClick={() => setModalMode("NONE")} style={{ background: "transparent", border: "none", fontSize: 24, cursor: "pointer", color: C.slate400 }}>&times;</button>
            </div>

            {/* FORM EVIDENCE */}
            {modalMode === "EVIDENCE" && (
              <form onSubmit={handleAddEvidence} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Position (Stance)</label>
                  <select value={newEv.stance} onChange={e => setNewEv({...newEv, stance: e.target.value})} style={{ width: "100%", padding: 10, border: `1px solid ${C.slate300}`, borderRadius: 6 }}>
                    <option value="SUPPORTE">Supporte la rumeur</option>
                    <option value="REFUTE">Réfute la rumeur</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Détail / Contenu</label>
                  <input required value={newEv.detail} onChange={e => setNewEv({...newEv, detail: e.target.value})} placeholder="Ex: Vidéo montrant..." style={{ width: "100%", padding: 10, border: `1px solid ${C.slate300}`, borderRadius: 6 }} />
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Auteur</label>
                    <input required value={newEv.auteur} onChange={e => setNewEv({...newEv, auteur: e.target.value})} placeholder="Ex: Mama Céleste" style={{ width: "100%", padding: 10, border: `1px solid ${C.slate300}`, borderRadius: 6 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Type</label>
                    <input required value={newEv.type} onChange={e => setNewEv({...newEv, type: e.target.value})} placeholder="Ex: Vidéo, Tweet" style={{ width: "100%", padding: 10, border: `1px solid ${C.slate300}`, borderRadius: 6 }} />
                  </div>
                </div>
                <button type="submit" style={{ marginTop: 16, width: "100%", padding: 12, background: C.slate900, color: "#fff", fontWeight: 600, borderRadius: 6, border: "none", cursor: "pointer" }}>
                  Hacher et Sauvegarder
                </button>
              </form>
            )}

            {/* FORM VERDICT */}
            {modalMode === "VERDICT" && (
              <form onSubmit={handleAddVerdict} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Nouveau Statut</label>
                  <select value={newVer.status} onChange={e => setNewVer({...newVer, status: e.target.value})} style={{ width: "100%", padding: 10, border: `1px solid ${C.slate300}`, borderRadius: 6 }}>
                    <option value="CONTESTE">Contesté</option>
                    <option value="PROB_VRAI">Probablement Vrai</option>
                    <option value="PROB_FAUX">Probablement Faux</option>
                    <option value="CONFIRME">Confirmé</option>
                    <option value="REFUTE">Réfuté</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Règle de modération justifiant la décision</label>
                  <input required value={newVer.regle} onChange={e => setNewVer({...newVer, regle: e.target.value})} placeholder="Ex: Règle_v2.1..." style={{ width: "100%", padding: 10, border: `1px solid ${C.slate300}`, borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Note publique affichée aux citoyens</label>
                  <textarea required value={newVer.note} onChange={e => setNewVer({...newVer, note: e.target.value})} rows={3} style={{ width: "100%", padding: 10, border: `1px solid ${C.slate300}`, borderRadius: 6, fontFamily: "inherit" }} />
                </div>
                <div style={{ fontSize: 12, color: C.slate500, background: C.slate50, padding: 10, borderRadius: 6 }}>
                  💡 En validant, vous créerez le verdict <strong>V{verdicts.length + 1}</strong> qui supersèdera <strong>{activeVerdict.id}</strong>. L'historique sera conservé.
                </div>
                <button type="submit" style={{ width: "100%", padding: 12, background: C.blue600, color: "#fff", fontWeight: 600, borderRadius: 6, border: "none", cursor: "pointer" }}>
                  Commit Verdict
                </button>
              </form>
            )}

            {/* AUDIT */}
            {modalMode === "AUDIT" && (
              <div>
                <pre style={{ background: C.slate900, color: "#e2e8f0", padding: 20, borderRadius: 8, fontSize: 12, overflowX: "auto", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
{`RAPPORT D'AUDIT — Claim #C2 — Rue Melen — ${new Date().toLocaleDateString()}

=============================================
HISTORIQUE DES VERDICTS (Immuable)
=============================================
${verdicts.map(v => `
${v.date} : Statut → ${v.status} (ID: ${v.id})
  Motif : ${v.regle}
  Auteur : ${v.auteur}
  Preuves analysées : 
    - POUR : ${v.sources_pour.join(", ") || "Aucune"}
    - CONTRE : ${v.sources_contre.join(", ") || "Aucune"}
  Affichage public : "${v.note}"
  Supersède : ${v.supersede || "N/A"}
`).join("")}

=============================================
REGISTRE DES PREUVES (Hachées)
=============================================
${evidences.map(e => `[${e.id}] ${e.t_upload} | SHA-256: ${e.hash}\n    Source: ${e.auteur} (${e.type}) -> ${e.stance}`).join("\n")}

---------------------------------------------
Signature Numérique Système: OK
Note: À aucun moment le statut de ce claim n'a été modifié sans trace.
Toutes les actions sont liées cryptographiquement aux auteurs.
`}
                </pre>
                <button onClick={() => setModalMode("NONE")} style={{ marginTop: 24, width: "100%", padding: 12, background: C.slate200, color: C.slate900, fontWeight: 600, borderRadius: 6, border: "none", cursor: "pointer" }}>
                  Fermer le rapport
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
