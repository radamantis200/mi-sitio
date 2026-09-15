import NavIndicators from './NavIndicators';

export default function TimerView({ viewRef, theme, format, days, hours, minutes, seconds, triggerHaptic, activeView, setActiveView }) {
    return (
        <div ref={viewRef} className="w-full min-w-full flex-shrink-0 flex flex-col items-center animate-fade-in px-4 pt-6 pb-6">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r ${theme.titleClasses} text-center drop-shadow-sm transition-all duration-700 leading-tight`}>
                {theme.titleText}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 w-full max-w-[320px] md:max-w-5xl mx-auto">
                {[{ label: "Días", value: format(days) }, { label: "Horas", value: format(hours) }, { label: "Minutos", value: format(minutes) }].map((item, idx) => (
                    <div key={idx} onClick={triggerHaptic} className="flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-500/50 transition-all duration-300 rounded-3xl p-8 sm:p-10 shadow-xl cursor-pointer active:scale-95 select-none">
                        <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tabular-nums text-white">{item.value}</span>
                        <span className="text-sm sm:text-base md:text-lg text-slate-400 font-semibold uppercase tracking-[0.25em] mt-4">{item.label}</span>
                    </div>
                ))}

                <div onClick={triggerHaptic} className={`flex flex-col items-center justify-center backdrop-blur-sm border transition-all duration-700 rounded-3xl p-8 sm:p-10 shadow-xl cursor-pointer active:scale-95 select-none ${theme.secondsBox}`}>
                    <span className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tabular-nums transition-colors duration-700 ${theme.secondsNum}`}>{format(seconds)}</span>
                    <span className={`text-sm sm:text-base md:text-lg font-semibold uppercase tracking-[0.25em] mt-4 transition-colors duration-700 ${theme.secondsLabel}`}>Segundos</span>
                </div>
            </div>

            <NavIndicators activeView={activeView} setActiveView={setActiveView} triggerHaptic={triggerHaptic} />
        </div>
    );
}