'use client';

import React, { useState } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const [isProvisioned, setIsProvisioned] = useState(false);

  useEffect(() => {
    // Check if user has already provisioned this session
    const cached = localStorage.getItem('cognitive_os_provisioned');
    if (cached === 'true') {
      setIsProvisioned(true);
    }
  }, []);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeView, setActiveView] = useState('insights');

  const handleProvisionStep = async (step: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, email: session?.user?.email || 'jeremy@example.com', accessToken: (session as any)?.accessToken }),
      });
      const data = await response.json();

      if (data.success) {
        setLogs(prev => [...prev, data.log]);
        setCurrentStep(step + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center bg-[#0a0a0c] text-white">Loading Cognitive Core...</div>;
  }

  if (status === 'unauthenticated') return null;

  if (!isProvisioned) {
    return (
      <div className="flex h-screen bg-[#0a0a0c] text-white items-center justify-center p-6 font-sans">
        <div className="max-w-4xl w-full glass rounded-3xl border border-[#27272a] overflow-hidden flex shadow-2xl h-[600px]">
          {/* Left Panel: The Agent Persona */}
          <div className="w-1/3 bg-primary/5 p-10 border-r border-[#27272a] hidden md:flex flex-col justify-between">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-xl shadow-primary/30 ring-1 ring-white/20">C</div>
              <h2 className="text-2xl font-bold mb-4 tracking-tight">Digital Chief of Staff</h2>
              <p className="text-muted-foreground text-sm leading-relaxed opacity-80">
                "Simplicity is the ultimate sophistication."
                <br /><br />
                I am initializing your private cognitive infrastructure. No manual setup required.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-accent animate-ping' : 'bg-green-500'} `}></div>
                <span>{isLoading ? 'Processing...' : 'Awaiting Command'}</span>
              </div>
            </div>
          </div>

          {/* Right Panel: The Agentic Flow */}
          <div className="flex-1 p-10 flex flex-col justify-between relative bg-gradient-to-b from-transparent to-[#16161a]/30">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Stage 3: Agentic Onboarding</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">Heartbeat: Linked</span>
              </div>

              {/* Agent Message Portal */}
              <div className="space-y-6 mt-8">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shadow-inner">AI</div>
                    <div className="flex-1 space-y-4">
                      <p className="text-lg font-medium leading-normal text-zinc-100">
                        {currentStep === 1 && "Welcome. I've drafted your 'Filing Cabinet' template. Shall I clone it to your secure Drive?"}
                        {currentStep === 2 && "Storage is ready. Now injecting your 'Intelligence Engine' into your private workspace. Ready to deploy?"}
                        {currentStep === 3 && "Handshake complete. Your OS is now heartbeat-synced with your Google Chat. Ready to enter the dashboard?"}
                      </p>

                      {/* Background Action Log */}
                      <div className="bg-[#0a0a0c]/50 rounded-xl p-4 border border-[#27272a] font-mono text-[10px] text-primary/60 space-y-1 h-32 overflow-y-auto custom-scrollbar">
                        {logs.map((log, i) => (
                          <div key={i} className="flex justify-between border-b border-[#27272a]/50 pb-1 mb-1 last:border-0 last:mb-0 last:pb-0">
                            <span className="truncate mr-4">{log.split("...")[0]}...</span>
                            <span className="text-accent shrink-0">SUCCESS</span>
                          </div>
                        ))}
                        {logs.length === 0 && <span className="opacity-30 italic">System ready...</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center pt-8 border-t border-[#27272a]">
              {currentStep < 3 ? (
                <button
                  onClick={() => handleProvisionStep(currentStep)}
                  disabled={isLoading}
                  className="py-4 px-10 bg-primary text-white rounded-2xl font-bold hover:bg-primary/80 transition-all text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                >
                  {isLoading ? "Provisioning..." : (currentStep === 1 ? "Yes, Clone Storage" : "Yes, Deploy Engine")}
                </button>
              ) : (
                <button
                  onClick={() => handleProvisionStep(3).then(() => {
                    localStorage.setItem('cognitive_os_provisioned', 'true');
                    setIsProvisioned(true);
                  })}
                  className="py-4 px-10 bg-accent text-white rounded-2xl font-bold hover:bg-accent/80 transition-all text-sm shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Activate My OS →
                </button>
              )}
            </div>

            {/* Visual Flourish: Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[80px] -z-10 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-white overflow-hidden transition-all duration-1000 animate-in fade-in">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-[#27272a] flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">C</div>
          <span className="text-xl font-bold tracking-tight">Cognitive OS</span>
        </div>

        <nav className="flex-1 space-y-2 mt-8">
          <NavItem icon={<DashboardIcon />} label="Insights" active={activeView === 'insights'} onClick={() => setActiveView('insights')} />
          <NavItem icon={<DatabaseIcon />} label="Brain Log" active={activeView === 'brain'} onClick={() => setActiveView('brain')} />
          <NavItem icon={<PeopleIcon />} label="Graph" active={activeView === 'graph'} onClick={() => setActiveView('graph')} />
          <NavItem icon={<ProjectIcon />} label="Projects" active={activeView === 'projects'} onClick={() => setActiveView('projects')} />
        </nav>

        <div className="pt-6 border-t border-[#27272a] space-y-4">
          <button
            onClick={() => {
              localStorage.removeItem('cognitive_os_provisioned');
              setIsProvisioned(false);
            }}
            className="w-full py-3 px-4 bg-primary/10 text-primary border border-primary/20 rounded-xl font-medium hover:bg-primary/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>+ Provision Exec</span>
          </button>
          <div className="flex items-center space-x-3 p-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
              {session?.user?.name?.[0] || 'ME'}
            </div>
            <div className="text-sm">
              <p className="font-semibold">{session?.user?.name || 'Loading...'}</p>
              <p className="text-muted-foreground text-[10px]">{session?.user?.email || 'C-Suite Exec'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar pb-32">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
            <p className="text-muted-foreground hidden md:block">System Active. Waiting for ingress...</p>
          </div>
          <div className="flex space-x-4">
            <div className="glass px-4 py-2 rounded-xl border border-[#27272a] flex items-center space-x-2 text-sm text-muted-foreground text-center">
              <SearchIcon />
              <span>Deep Search Brain...</span>
            </div>
            <button className="glass p-2 rounded-xl border border-[#27272a] relative">
              <BellIcon />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-[#0a0a0c]"></span>
            </button>
          </div>
        </header>

        {activeView === 'insights' && (
          <>
            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="metric-card card-gradient">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Operational Velocity</p>
                    <h3 className="text-4xl font-bold mt-1">--<span className="text-xl text-muted-foreground font-normal ml-1"></span></h3>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-[#27272a] flex items-center justify-center font-bold text-xs text-muted-foreground">
                    0%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Average loop closure time: <span className="text-white">--</span></p>
              </div>

              <div className="metric-card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Cognitive Savings</p>
                    <h3 className="text-4xl font-bold mt-1">0</h3>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-muted-foreground">
                    <BrainIcon />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Estimated focus hours reclaimed today: <span className="text-white">0 hrs</span></p>
              </div>

              <div className="metric-card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Relational Links</p>
                    <h3 className="text-4xl font-bold mt-1">0</h3>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-muted-foreground">
                    <PeopleIcon />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Contextual nodes ready for next meeting.</p>
              </div>
            </section>

            {/* Action Center */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="glass rounded-2xl border border-[#27272a] overflow-hidden p-6">
                <h3 className="font-bold flex items-center space-x-2 mb-4">
                  <TerminalIcon />
                  <span>Active Loops</span>
                </h3>
                <div className="space-y-4">
                  <div className="p-8 text-center text-muted-foreground text-sm border border-dashed border-[#27272a] rounded-xl">
                    No active loops. Use Google Chat to capture.
                  </div>
                </div>
              </div>
              <div className="metric-card">
                <h3 className="font-bold text-lg mb-2">Relational Intelligence Synthesis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  System is listening. Relation graph will populate after 24 hours of ingress.
                </p>
              </div>
            </section>
          </>
        )}

        {activeView === 'brain' && (
          <div className="flex items-center justify-center h-64 text-muted-foreground border border-dashed border-[#27272a] rounded-2xl">
            Brain Log Empty.
          </div>
        )}

        {/* Floating Ingress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-6">
          <div className="glass rounded-3xl border border-[#27272a] p-2 flex items-center space-x-3 shadow-2xl ring-1 ring-white/10">
            <button className="w-12 h-12 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all animate-pulse">
              <MicIcon />
            </button>
            <input
              type="text"
              placeholder="Tell your Digital Chief of Staff..."
              className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 text-sm h-12"
            />
            <button className="w-10 h-10 rounded-full bg-[#27272a] hover:bg-[#3f3f46] flex items-center justify-center text-white transition-all">
              <ArrowUpIcon />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
function StepIndicator({ step, current, label }: { step: number, current: number, label: string }) {
  const active = current === step;
  const done = current > step;

  return (
    <div className={`flex items - center space - x - 3 transition - opacity ${done ? 'opacity-40' : 'opacity-100'} `}>
      <div className={`w - 6 h - 6 rounded - full flex items - center justify - center text - [10px] font - bold border ${active ? 'bg-primary border-primary' : done ? 'bg-accent border-accent' : 'border-[#27272a]'} `}>
        {done ? <CheckIcon size={12} /> : step}
      </div>
      <span className={`text - sm font - medium ${active ? 'text-white' : 'text-muted-foreground'} `}>{label}</span>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items - center space - x - 3 p - 3 rounded - xl transition - all cursor - pointer ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-[#1f2937] hover:text-white'} `}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

// Icons
const CheckIcon = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const DashboardIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const DatabaseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>;
const PeopleIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const ProjectIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const BrainIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.04-2.44 2.5 2.5 0 0 1 2-2.45 2.5 2.5 0 0 1-2-2.45 2.5 2.5 0 0 1 2-2.45 2.5 2.5 0 0 1-2-2.45 2.5 2.5 0 0 1 2.5-2.5Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.04-2.44 2.5 2.5 0 0 0-2-2.45 2.5 2.5 0 0 0 2-2.45 2.5 2.5 0 0 0-2-2.45 2.5 2.5 0 0 0 2-2.45 2.5 2.5 0 0 0-2.5-2.5Z"></path></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const TerminalIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>;
const MicIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const ArrowUpIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>;
