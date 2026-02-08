'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GuestOverlay } from "@/components/GuestOverlay";

// --- ICONE SVG INTERNE ---
const Icons = {
  Plus: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
  Users: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  AlertTriangle: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>,
  Clock: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Bell: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>,
  Phone: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  Mail: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  Settings: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>,
  ChevronRight: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>,
  Shield: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>,
  Heart: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>,
  Calendar: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
};

// --- COMPONENTI UI RIUTILIZZABILI ---
const Card = ({ children, className = "", variant = "default", onClick, style }) => {
    let baseStyles = "bg-white rounded-xl border border-slate-200 shadow-sm";
    if (variant === "elevated") baseStyles += " shadow-md";
    if (variant === "interactive") baseStyles += " cursor-pointer hover:border-[#14b8a6]/50 transition-all hover:shadow-md";
    
    return (
        <div className={`${baseStyles} ${className}`} onClick={onClick} style={style}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = "" }) => <div className={`p-6 pb-0 ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;

const Button = ({ children, onClick, variant = "primary", size = "md", className = "", asChild }) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none";
  const variants = {
    primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-sm hover:shadow-md",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    default: "bg-[#14b8a6] text-white hover:bg-[#0d9488]",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
  };
  
  if (asChild) {
    return <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>{children}</span>;
  }
  
  return <button onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>{children}</button>;
};

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    destructive: "bg-rose-100 text-rose-600",
    default: "bg-slate-100 text-slate-700",
    secondary: "bg-slate-100 text-slate-500",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[variant]}`}>{children}</span>;
};

const Avatar = ({ children, className = "" }) => <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>;
const AvatarFallback = ({ children, className = "" }) => <div className={`flex h-full w-full items-center justify-center rounded-full bg-slate-100 ${className}`}>{children}</div>;

// --- VISTA ASSISTITO (My Caregivers) ---
function AssistedView({ caregivers }) {
  const handleEmailCaregiver = (email, e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold mb-2 text-slate-800">I Miei Caregiver</h1>
            <p className="text-slate-500">
            Le persone che ti assistono e monitorano le tue terapie
            </p>
        </div>
        <Link href="/Pages/CollegaCaregiver" passHref>
            <Button variant="default" asChild>
                <span className="cursor-pointer">
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Collega caregiver
                </span>
            </Button>
        </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card variant="elevated">
            <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                <Icons.Users className="w-6 h-6 text-[#14b8a6]" />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800">{caregivers.length}</p>
                <p className="text-sm text-slate-500">Caregiver</p>
            </div>
            </CardContent>
        </Card>
        <Card variant="elevated">
            <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                <Icons.Calendar className="w-6 h-6 text-[#14b8a6]" />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800">
                {new Date().toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                </p>
                <p className="text-sm text-slate-500">Oggi</p>
            </div>
            </CardContent>
        </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
        {/* Caregivers List */}
        <div className="lg:col-span-2 space-y-4">
            <h2 className="font-bold text-lg text-slate-800">I tuoi caregiver</h2>
            
            {caregivers.map((caregiver, index) => (
            <Card 
                key={caregiver.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
            >
                <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    <div className="relative">
                    <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-teal-50 text-[#14b8a6] font-bold">
                        {caregiver.avatar}
                        </AvatarFallback>
                    </Avatar>
                    </div>

                    <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg text-slate-800">{caregiver.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                        {caregiver.relationship} • {caregiver.email}
                    </p>

                    <div className="flex items-center justify-end">
                        <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => handleEmailCaregiver(caregiver.email, e)}
                        >
                        <Icons.Mail className="w-4 h-4 mr-2" />
                        Contatta
                        </Button>
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>
            ))}

            <Card variant="default" className="border-dashed border-2 bg-slate-50/50">
            <CardContent className="p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Icons.Plus className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="font-bold mb-2 text-slate-800">Collega un nuovo caregiver</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                Inserisci il codice ricevuto dal tuo caregiver per collegarlo al tuo profilo
                </p>
                <Link href="/Pages/CollegaCaregiver" passHref>
                    <Button variant="outline" asChild>
                        <span className="cursor-pointer">Inserisci codice</span>
                    </Button>
                </Link>
            </CardContent>
            </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            <Card variant="elevated">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                <Icons.Shield className="w-5 h-5 text-[#14b8a6]" />
                Informazioni
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">
                I tuoi caregiver possono visualizzare le tue terapie, l'inventario farmaci e ricevere notifiche quando non confermi un'assunzione.
                </p>
                <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium mb-2 text-slate-700">Cosa possono vedere:</p>
                <ul className="text-sm text-slate-500 space-y-1">
                    <li>• Le tue terapie attive</li>
                    <li>• L'inventario dei farmaci</li>
                    <li>• Le assunzioni confermate</li>
                    <li>• Le scorte in esaurimento</li>
                </ul>
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    </div>
  );
}

// --- VISTA CAREGIVER (Dashboard) ---
function CaregiverView({ patients, recentAlerts }) {
    const totalAlerts = patients.reduce((sum, p) => sum + p.alerts + p.lowStock, 0);
    const avgAdherence = patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.adherenceWeek, 0) / patients.length) : 0;
    const lowStockCount = patients.reduce((sum, p) => sum + p.lowStock, 0);

    return (
        <div className="container mx-auto px-4 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-slate-800 tracking-tight">Dashboard Caregiver</h1>
                <p className="text-slate-500">Monitora e gestisci le terapie dei tuoi assistiti</p>
            </div>
            <Link href="CollegaCaregiver" className="inline-flex items-center justify-center h-11 px-6 rounded-lg font-bold text-sm bg-[#14b8a6] text-white shadow-md hover:bg-[#0d9488] hover:shadow-lg transition-all">
                <Icons.Plus className="w-5 h-5 mr-2" /> Collega paziente
            </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Icons.Users className="w-6 h-6 text-[#14b8a6]" />} bg="bg-teal-50" value={patients.length} label="Pazienti" />
            <StatCard icon={<Icons.Heart className="w-6 h-6 text-emerald-500" />} bg="bg-emerald-50" value={`${avgAdherence}%`} label="Aderenza media" />
            <StatCard icon={<Icons.AlertTriangle className="w-6 h-6 text-rose-500" />} bg="bg-rose-50" value={totalAlerts} label="Alert attivi" />
            <StatCard icon={<Icons.Bell className="w-6 h-6 text-amber-500" />} bg="bg-amber-50" value={lowStockCount} label="Scorte basse" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

            {/* --- LISTA PAZIENTI (Colonna Sinistra) --- */}
            <div className="lg:col-span-2 space-y-4">
                <h2 className="font-bold text-lg text-slate-800">I tuoi assistiti</h2>

                {patients.map((patient) => (
                <Link key={patient.id} href={`/Pages/Assistito/${patient.id}`} className="block group cursor-pointer">
                    <Card className="p-5 hover:border-[#14b8a6]/50 transition-all hover:shadow-md relative overflow-hidden">
                    {/* Status Bar Left */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${patient.status === 'ok' ? 'bg-emerald-500' : patient.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />

                    <div className="flex items-start gap-4 pl-2">
                        {/* Avatar */}
                        <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-[#14b8a6] font-bold text-xl border-2 border-white shadow-sm">
                            {patient.initials}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${patient.status === 'ok' ? 'bg-emerald-500' : patient.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        </div>

                        <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-[#14b8a6] transition-colors">{patient.name}</h3>
                            {(patient.alerts + patient.lowStock) > 0 && <Badge variant="destructive">{patient.alerts + patient.lowStock} alert</Badge>}
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{patient.relationship} • Ultima attività: {patient.lastActivity}</p>

                        <div className="grid sm:grid-cols-3 gap-6">
                            {/* Progress Oggi */}
                            <div>
                            <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-500">
                                <span>Oggi</span>
                                <span className={patient.status === 'ok' ? 'text-emerald-600' : patient.status === 'warning' ? 'text-amber-600' : 'text-rose-600'}>{patient.adherenceToday}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${patient.status === 'ok' ? 'bg-emerald-500' : patient.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${patient.adherenceToday}%` }} />
                            </div>
                            </div>

                            {/* Progress Settimana */}
                            <div>
                            <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-500">
                                <span>Settimana</span>
                                <span className="text-slate-700">{patient.adherenceWeek}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-[#14b8a6]" style={{ width: `${patient.adherenceWeek}%` }} />
                            </div>
                            </div>

                            {/* Next Dose Info */}
                            <div className="flex items-center gap-2 text-sm font-medium">
                            <Icons.Clock className={`w-4 h-4 ${patient.nextDose === "In ritardo" ? "text-rose-500" : "text-slate-400"}`} />
                            <span className={patient.nextDose === "In ritardo" ? "text-rose-600" : "text-slate-600"}>
                                {patient.nextDose}
                            </span>
                            </div>
                        </div>
                        </div>

                        <div className="self-center">
                        <Icons.ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#14b8a6]" />
                        </div>
                    </div>
                    </Card>
                </Link>
                ))}
            </div>

            {/* --- SIDEBAR (Colonna Destra) --- */}
            <div className="space-y-6">

                {/* Alert Recenti */}
                <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-slate-800">Alert Recenti</h2>
                </div>
                <div className="space-y-3">
                    {recentAlerts.map((alert) => (
                    <Card key={alert.id} className={`p-4 border-l-4 ${alert.type === 'critical' ? 'border-l-rose-500' : alert.type === 'warning' ? 'border-l-amber-500' : 'border-l-[#14b8a6]'}`}>
                        <p className="font-bold text-sm text-slate-800 mb-1">{alert.patient}</p>
                        <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                        <p className="text-xs text-slate-400">{alert.time}</p>
                    </Card>
                    ))}
                </div>
                </div>

            </div>
            </div>
        </div>
    );
}

// --- LOGICA PRINCIPALE ---
export default function CaregiverDashboard({ isAuthenticated: initialAuth = false }) {
  const router = useRouter();
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Dati
  const [patients, setPatients] = useState([]); // Pazienti di cui sono caregiver
  const [caregivers, setCaregivers] = useState([]); // Caregiver che mi assistono
  const [recentAlerts, setRecentAlerts] = useState([]);
  
  // Stato UI
  const [viewMode, setViewMode] = useState(null); // 'caregiver' | 'assisted'
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Verifica Auth
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        setIsUserAuthenticated(authData.isAuthenticated);

        // 2. Se autenticato, carica i dati via RUD-account
        if (authData.isAuthenticated) {
          setLoadingData(true);
          const res = await fetch('/api/RUD-account?me');
          if (res.ok) {
            const userData = await res.json();
            
            // --- Elaborazione dati CAREGIVER (Io assisto altri) ---
            let mappedPatients = [];
            let generatedAlerts = [];
            if (userData.caregiver && Array.isArray(userData.caregiver)) {
               // ... logica esistente ...
               mappedPatients = userData.caregiver.map(rel => {
                const p = rel.assistito;
                if(!p) return null;
                const s = p.dashboardStats || {};
                return {
                  id: p.id_utente,
                  name: `${p.nome} ${p.cognome}`,
                  relationship: "Assistito", 
                  initials: `${p.nome?.[0] || '?'}${p.cognome?.[0] || '?'}`.toUpperCase(),
                  adherenceToday: s.adherenceToday ?? 0,
                  adherenceWeek: s.adherenceWeek ?? 0,
                  lastActivity: s.lastActivity || "N/A",
                  status: s.status || "ok",
                  nextDose: s.nextDose || "Nessuna",
                  alerts: s.alerts ?? 0,
                  lowStock: s.lowStock ?? 0
                };
              }).filter(Boolean);
              
              const now = new Date();
              userData.caregiver.forEach(rel => {
                const p = rel.assistito;
                if (!p) return;
                // Alert Terapie
                if (p.terapie) {
                  p.terapie.forEach(t => {
                    if (t.assunzioni) {
                      t.assunzioni.forEach(a => {
                        const d = new Date(a.data_programmata);
                        const isRecent = d > new Date(now.getTime() - 24 * 60 * 60 * 1000) && d <= now;
                        const isMissed = a.esito === false;
                        const isLate = a.esito === null && d < new Date(now.getTime() - 60 * 60 * 1000);
                        if (isRecent && (isMissed || isLate)) {
                           generatedAlerts.push({
                             id: `alert_${a.id_evento}`,
                             patient: `${p.nome} ${p.cognome}`,
                             message: isMissed ? `Mancata assunzione: ${t.nome_utilita}` : `In ritardo: ${t.nome_utilita}`,
                             time: d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                             type: isMissed ? 'critical' : 'warning'
                           });
                        }
                      });
                    }
                  });
                }
                // Alert Scorte
                if (p.armadietto) {
                  p.armadietto.forEach(f => {
                    if (f.quantita_rimanente < 5) {
                       const drugName = f.farmaco?.denominazione || 'Farmaco'; 
                       generatedAlerts.push({
                         id: `stock_${f.id_farmaco_armadietto}`,
                         patient: `${p.nome} ${p.cognome}`,
                         message: `Scorta in esaurimento: ${drugName} (${f.quantita_rimanente})`,
                         time: "Oggi",
                         type: "info"
                       });
                    }
                  });
                }
              });
            }

            setPatients(mappedPatients);
            setRecentAlerts(generatedAlerts);

            // --- Elaborazione dati ASSISTITO (Altri assistono me) ---
            let mappedCaregivers = [];
            if (userData.assistito && Array.isArray(userData.assistito)) {
                mappedCaregivers = userData.assistito.map(rel => {
                    const c = rel.caregiver;
                    if(!c) return null;
                    return {
                        id: c.id_utente,
                        name: `${c.nome} ${c.cognome}`,
                        email: c.email,
                        relationship: "Caregiver",
                        avatar: `${c.nome?.[0] || '?'}${c.cognome?.[0] || '?'}`.toUpperCase(),
                        connectedSince: "Attivo", // Non abbiamo data creazione
                        lastOnline: "N/A",
                        status: "offline"
                    };
                }).filter(Boolean);
            }
            setCaregivers(mappedCaregivers);

            // --- DECISIONE VISTA INIZIALE ---
            if (mappedPatients.length > 0) {
                setViewMode('caregiver');
            } else if (mappedCaregivers.length > 0) {
                setViewMode('assisted');
            } else {
                // Default: se non ha nessuno, magari mostra la vista caregiver per aggiungere pazienti (o viceversa)
                setViewMode('caregiver'); 
            }
          }
        }
      } catch (err) {
        console.error("Errore inizializzazione dashboard", err);
      } finally {
        setIsAuthChecking(false);
        setLoadingData(false);
      }
    };
    init();
  }, []);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14b8a6]"></div>
      </div>
    );
  }

  if (!isUserAuthenticated) {
    return (
        <GuestOverlay
          title="MediGuard Connect"
          description="Gestisci le relazioni di cura in modo semplice e sicuro"
          features={[
            "Monitoraggio terapie da remoto",
            "Gestione caregiver e permessi",
            "Notifiche in tempo reale",
            "Sicurezza e privacy garantite"
          ]}
        />
    );
  }

  // Toggle Switch se l'utente ha entrambi i ruoli
  const showToggle = patients.length > 0 && caregivers.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16 pt-10">
        
        {/* Switcher dei ruoli (solo se necessario) */}
        {showToggle && (
            <div className="container mx-auto px-4 max-w-7xl mb-6">
                <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
                    <button 
                        onClick={() => setViewMode('caregiver')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'caregiver' ? 'bg-[#14b8a6] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Sono un Caregiver
                    </button>
                    <button 
                        onClick={() => setViewMode('assisted')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'assisted' ? 'bg-[#14b8a6] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Sono Assistito
                    </button>
                </div>
            </div>
        )}

        {viewMode === 'assisted' ? (
            <AssistedView caregivers={caregivers} />
        ) : (
            <CaregiverView patients={patients} recentAlerts={recentAlerts} />
        )}

        <footer className="border-t border-slate-200 py-8 mt-auto text-center text-sm text-slate-400 bg-white mt-12">
            <p>© 2026 MediGuard. La tua salute, organizzata.</p>
        </footer>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function StatCard({ icon, bg, value, label }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none mb-1">{value}</p>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}
