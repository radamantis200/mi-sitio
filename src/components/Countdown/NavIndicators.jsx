export default function NavIndicators({ activeView, setActiveView, triggerHaptic, className = "mt-8 mb-2" }) {
    return (
        <div className={`flex justify-center items-center gap-3 w-full ${className}`}>
            {[0, 1, 2].map((idx) => (
                <button
                    key={idx}
                    onClick={() => { setActiveView(idx); triggerHaptic(); }}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${activeView === idx ? 'bg-indigo-400 w-8' : 'bg-slate-700 w-2.5'}`}
                    aria-label={`Vista ${idx + 1}`}
                />
            ))}
        </div>
    );
}