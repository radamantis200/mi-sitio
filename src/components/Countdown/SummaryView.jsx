import NavIndicators from './NavIndicators';

export default function SummaryView({ viewRef, theme, percentage, isFinished, days, stats, isWakeLockActive, toggleWakeLock, enableAppBadge, activeView, setActiveView, triggerHaptic }) {
    return (
        <div ref={viewRef} className="w-full min-w-full flex-shrink-0 flex flex-col items-center animate-fade-in px-4 pt-6 pb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-center drop-shadow-sm leading-tight">
                Resumen del Progreso
            </h2>

            <p className="text-slate-400 text-sm md:text-base text-center mb-8">
                Balance general del período del 4 de septiembre al 4 de diciembre.
            </p>

            <div className="w-full max-w-[320px] md:max-w-xl mb-8 flex flex-col items-center justify-center">
                <div className="w-full flex items-center gap-3">
                    <div className="flex-1 bg-slate-800/80 rounded-full h-2.5 overflow-hidden shadow-inner border border-slate-700/50">
                        <div className={`h-full rounded-full bg-gradient-to-r ${theme.barClasses} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={toggleWakeLock} title={isWakeLockActive ? "Pantalla fija activa" : "Fijar pantalla"} className={`w-8 h-8 rounded-full text-xs border flex items-center justify-center transition-all cursor-pointer ${isWakeLockActive ? "bg-yellow-500/20 border-yellow-500/60 text-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.3)]" : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"}`}>
                            {isWakeLockActive ? "☀️" : "🌙"}
                        </button>

                        <button onClick={enableAppBadge} title="Activar insignia en ícono" className="w-8 h-8 rounded-full text-xs border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all cursor-pointer">
                            🔴
                        </button>
                    </div>
                </div>

                <span className={`text-sm md:text-base font-medium tabular-nums tracking-wider mt-2 ${theme.progressText}`}>
                    {isFinished ? "100% completado" : `${percentage.toFixed(5)}% transcurrido`}
                </span>
            </div>

            <div className="w-full max-w-3xl flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                        { val: stats.daysElapsed, suffix: " / 91", label: "Días Cumplidos", color: "text-emerald-400" },
                        { val: days, suffix: "", label: "Días Restantes", color: "text-amber-400" },
                        { val: Math.ceil(days / 7), suffix: "", label: "Semanas", color: "text-cyan-400" },
                        { val: `${percentage.toFixed(1)}%`, suffix: "", label: "Avance Total", color: "text-indigo-400" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 p-4 rounded-2xl flex flex-col items-center justify-center">
                            <span className={`text-2xl sm:text-3xl font-bold ${stat.color} tabular-nums`}>
                                {stat.val} {stat.suffix && <span className="text-sm font-normal text-slate-400">{stat.suffix}</span>}
                            </span>
                            <span className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1 text-center font-semibold">{stat.label}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-5 rounded-2xl flex flex-col gap-3 mt-1">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Puntos de Control</span>
                    <div className="space-y-2.5 text-sm">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                            <div className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                                <span className="text-slate-200 font-medium">Inicio</span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">04 Sep 2026</span>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${percentage >= 50 ? "bg-slate-800/60 border-slate-700/40" : "bg-slate-800/20 border-slate-800/50 opacity-80"}`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full ${percentage >= 50 ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "bg-slate-600"}`}></span>
                                <span className={percentage >= 50 ? "text-slate-200 font-medium" : "text-slate-400"}>Punto Medio (50%)</span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">19 Oct 2026</span>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isFinished ? "bg-slate-800/60 border-slate-700/40" : "bg-slate-800/20 border-slate-800/50 opacity-80"}`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full ${isFinished ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-slate-600"}`}></span>
                                <span className={isFinished ? "text-slate-200 font-medium" : "text-slate-400"}>Finalización</span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">04 Dic 2026</span>
                        </div>
                    </div>
                </div>
            </div>

            <NavIndicators activeView={activeView} setActiveView={setActiveView} triggerHaptic={triggerHaptic} />
        </div>
    );
}