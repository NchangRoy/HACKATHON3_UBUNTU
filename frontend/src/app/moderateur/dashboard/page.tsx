"use client";
import Link from "next/link";
import { useState } from "react";

const C = {
  blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
  sidebar: "#0f172a", sidebarBorder: "#1e293b",
};

type Statut = "CONTESTE" | "PROB_VRAI" | "PROB_FAUX" | "CONFIRME" | "REFUTE";

const statusMap: Record<Statut, { label: string; bg: string; color: string; dot: string }> = {
  CONTESTE:  { label: "Contesté",          bg: "#fefce8", color: "#854d0e", dot: "#ca8a04" },
  PROB_VRAI: { label: "Probablement vrai", bg: "#f0fdf4", color: "#166534", dot: "#16a34a" },
  PROB_FAUX: { label: "Probablement faux", bg: "#fff7ed", color: "#9a3412", dot: "#ea580c" },
  CONFIRME:  { label: "Confirmé",          bg: "#f0fdf4", color: "#166534", dot: "#15803d" },
  REFUTE:    { label: "Réfuté",            bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" },
};

const claims = [
  { id: "c2", texte: "L'eau qui fuit rue Melen est contaminée et dangereuse pour la santé.", statut: "PROB_VRAI" as Statut, score_ml: 0.65, pour: 4, contre: 1, assignee: "Moi", urgent: true, time: "15 min", cat: "Santé" },
  { id: "c3", texte: "Deux enfants ont été intoxiqués après avoir joué dans l'eau.", statut: "CONTESTE" as Statut, score_ml: 0.35, pour: 1, contre: 2, assignee: "Moi", urgent: true, time: "30 min", cat: "Santé" },
  { id: "c1", texte: "Une fuite d'eau s'est produite rue Melen.", statut: "CONFIRME" as Statut, score_ml: 0.88, pour: 12, contre: 0, assignee: "Non assigné", urgent: false, time: "1h", cat: "Environnement" },
  { id: "c4", texte: "La CDE a une équipe en intervention sur place.", statut: "PROB_VRAI" as Statut, score_ml: 0.90, pour: 3, contre: 0, assignee: "M. Kamara", urgent: false, time: "10 min", cat: "Sécurité" },
];

const alerts = [
  { id: 1, msg: "Spike de signalements vidéos sur #c1 (+800% en 15m)", time: "2 min", type: "spike" },
  { id: 2, msg: "Témoignage professionnel médical détecté sur #c3", time: "12 min", type: "accounts" },
  { id: 3, msg: "Déclaration officielle CDE contredit #c2", time: "30 min", type: "dedup" },
];

function Badge({ statut }: { statut: Statut }) {
  const s = statusMap[statut];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 8px", borderRadius: 6, background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      border: `1px solid rgba(0,0,0,0.06)`
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0, boxShadow: `0 0 0 2px ${s.bg}` }} />
      {s.label}
    </span>
  );
}

function NavItem({ href, label, icon, active, badge }: { href: string; label: string; icon: React.ReactNode; active?: boolean; badge?: string }) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 6,
      fontSize: 13, fontWeight: active ? 600 : 500,
      color: active ? "#fff" : C.slate400,
      background: active ? C.slate800 : "transparent",
      textDecoration: "none", transition: "all .15s",
    }}>
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{ background: C.blue600, color: "#fff", fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>{badge}</span>
      )}
    </Link>
  );
}

export default function ModDashboard() {
  const [tab, setTab] = useState<"file"|"mes"|"alertes">("file");

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: C.slate50 }} >

      {/* ── Sidebar (Dark Mode Professional) ── */}
      <aside style={{
        width: 240, background: C.sidebar, borderRight: `1px solid ${C.sidebarBorder}`,
        display: "flex", flexDirection: "column", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px", height: 60, display: "flex", alignItems: "center", borderBottom: `1px solid ${C.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "rgba(255,255,255,0.1)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "0.02em" }}>FakeCheckAI<span style={{ color: C.blue600 }}>_Mod</span></span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.slate500, letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 12px 4px", marginTop: 4 }}>Opérations</p>
          <NavItem href="/moderateur/dashboard" label="File globale" active icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>} />
          <NavItem href="#" label="Mes attributions" badge="2" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>} />
          <NavItem href="#" label="Alertes Système" badge="3" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>} />

          <p style={{ fontSize: 11, fontWeight: 600, color: C.slate500, letterSpacing: "0.05em", textTransform: "uppercase", padding: "16px 12px 4px" }}>Ressources</p>
          <NavItem href="#" label="Base de connaissances" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"/></svg>} />
          <NavItem href="#" label="Audit Log" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>} />
          <NavItem href="/" label="Portail public" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>} />
        </nav>

        {/* Profil */}
        <div style={{ padding: 16, borderTop: `1px solid ${C.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 6, background: C.slate800 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: C.blue600, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              AM
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>A. Modérateur</p>
              <p style={{ fontSize: 11, color: C.slate400, fontFamily: "monospace" }}>NIV. 3</p>
            </div>
            <Link href="/login" title="Déconnexion" style={{ color: C.slate400, lineHeight: 0, padding: 4, transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = C.slate400}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Contenu ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 60, background: "#fff", borderBottom: `1px solid ${C.slate200}`,
          display: "flex", alignItems: "center", gap: 16, padding: "0 24px",
          position: "sticky", top: 0, zIndex: 20,
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.slate400} strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="search" placeholder="Rechercher par ID, source, mot-clé…"
              style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8, border: `1px solid ${C.slate300}`, borderRadius: 6, fontSize: 13, outline: "none", background: "#fff", transition: "border-color .15s, box-shadow .15s" }}
              onFocus={e => { e.target.style.borderColor = C.blue600; e.target.style.boxShadow = "0 0 0 3px #2563eb15"; }}
              onBlur={e => { e.target.style.borderColor = C.slate300; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", padding: 8, borderRadius: 6, border: `1px solid ${C.slate200}`, background: "#fff", lineHeight: 0, cursor: "pointer", transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.slate50}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.slate600} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
            </button>

            <Link href="/moderateur/verdict/new" style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", background: C.slate900, color: "#fff",
              fontSize: 13, fontWeight: 600, borderRadius: 6, textDecoration: "none",
              transition: "background .15s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.slate800}
              onMouseLeave={e => e.currentTarget.style.background = C.slate900}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Créer un dossier
            </Link>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main style={{ padding: "32px 24px", display: "flex", gap: 24, flex: 1, alignItems: "flex-start", flexWrap: "wrap", minWidth: 0 }}>
          
          {/* Colonne gauche (File principale) */}
          <div style={{ flex: "1 1 600px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header de section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: C.slate900, letterSpacing: "-0.4px" }}>File de modération globale</h1>
                <p style={{ fontSize: 13, color: C.slate500, marginTop: 4 }}>32 dossiers en attente d'évaluation (Triage par criticité ML)</p>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", background: C.slate200, padding: 3, borderRadius: 6 }}>
                {[
                  { id: "file", label: "File (32)" },
                  { id: "mes", label: "Mes dossiers (2)" },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id as any)} style={{
                    padding: "6px 14px", fontSize: 12, fontWeight: 600,
                    background: tab === t.id ? "#fff" : "transparent",
                    color: tab === t.id ? C.slate900 : C.slate600,
                    border: "none", borderRadius: 4, cursor: "pointer",
                    boxShadow: tab === t.id ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table des claims */}
            <div style={{ background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 6, overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ minWidth: 760 }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1fr) 140px 100px 120px 100px", padding: "12px 16px", background: C.slate50, borderBottom: `1px solid ${C.slate200}`, fontSize: 11, fontWeight: 600, color: C.slate500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <div>Signalement</div>
                  <div>Statut</div>
                  <div>Score IA</div>
                  <div>Assignation</div>
                  <div style={{ textAlign: "right" }}>Action</div>
                </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {claims.filter(c => tab === "mes" ? c.assignee === "Moi" : true).map((c, i) => (
                  <div key={c.id} style={{
                    display: "grid", gridTemplateColumns: "minmax(260px, 1fr) 140px 100px 120px 100px",
                    padding: "16px", borderBottom: i === claims.length - 1 ? "none" : `1px solid ${C.slate100}`,
                    alignItems: "center", background: c.urgent ? "#fffbfb" : "#fff",
                    transition: "background .15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = C.slate50}
                    onMouseLeave={e => e.currentTarget.style.background = c.urgent ? "#fffbfb" : "#fff"}
                  >
                    {/* Signalement */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingRight: 20 }}>
                      <div style={{ marginTop: 2 }}>
                        {c.urgent ? (
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 0 3px #fee2e2" }} title="Urgent" />
                        ) : (
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.slate300 }} />
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.slate900, lineHeight: 1.4 }}>
                          {c.texte}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.slate500 }}>
                          <span style={{ fontFamily: "monospace", color: C.slate400 }}>{c.id}</span>
                          <span>•</span>
                          <span>{c.cat}</span>
                          <span>•</span>
                          <span>{c.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Statut */}
                    <div>
                      <Badge statut={c.statut} />
                    </div>

                    {/* Score ML */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        padding: "2px 6px", borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center",
                        background: c.score_ml < 0.3 ? "#fee2e2" : c.score_ml < 0.5 ? "#ffedd5" : "#dcfce7",
                        color: c.score_ml < 0.3 ? "#991b1b" : c.score_ml < 0.5 ? "#9a3412" : "#166534",
                        border: `1px solid ${c.score_ml < 0.3 ? "#fca5a5" : c.score_ml < 0.5 ? "#fdba74" : "#86efac"}`,
                        fontSize: 11, fontWeight: 800, fontFamily: "monospace"
                      }}>
                        {c.score_ml.toFixed(2)}
                      </div>
                    </div>

                    {/* Assignation */}
                    <div style={{ fontSize: 12, color: C.slate700, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: c.assignee === "Non assigné" ? C.slate200 : C.blue100, color: c.assignee === "Non assigné" ? C.slate500 : C.blue700, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>
                        {c.assignee === "Non assigné" ? "?" : c.assignee[0]}
                      </div>
                      {c.assignee}
                    </div>

                    {/* Action */}
                    <div style={{ textAlign: "right" }}>
                      <Link href={`/moderateur/rumeur/${c.id}`} style={{
                        display: "inline-block", padding: "6px 12px", border: `1px solid ${C.slate300}`, borderRadius: 4,
                        fontSize: 11, fontWeight: 600, color: C.slate700, textDecoration: "none", background: "#fff", transition: "all .1s"
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.slate50; e.currentTarget.style.borderColor = C.slate400; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.slate300; }}
                      >
                        Traiter
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 16px", background: C.slate50, borderTop: `1px solid ${C.slate200}`, textAlign: "center", fontSize: 12, color: C.slate500 }}>
                Affichage de {claims.length} résultats sur 32
              </div>
              </div>
            </div>
          </div>

          {/* Colonne droite (Alertes) */}
          <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: C.slate900, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Rapport d'anomalies ML
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {alerts.map(a => {
                let icon;
                if (a.type === "spike") icon = <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;
                else if (a.type === "accounts") icon = <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
                else icon = <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />;

                return (
                  <div key={a.id} style={{
                    background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 6, padding: "14px",
                    display: "flex", gap: 12, alignItems: "flex-start", boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 4, background: C.slate50, border: `1px solid ${C.slate200}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.slate600} strokeWidth={2}>
                        {icon}
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.slate800, lineHeight: 1.4 }}>{a.msg}</p>
                      <p style={{ fontSize: 11, color: C.slate400, marginTop: 4 }}>{a.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
