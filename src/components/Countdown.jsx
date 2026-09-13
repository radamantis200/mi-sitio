import React, { useState, useEffect, useRef } from "react";

const TARGET_DATE = "2026-12-04T00:00:00";
const START_DATE = "2026-09-04T00:00:00";
const TEST_DATE = null;

const DAILY_MESSAGES = [
    "Un día menos. Tú te buscaste esto, pero tranquilo, que nadie se muere por no manejar unos meses.",
    "Ánimo. Asume las consecuencias de tus actos como un campeón. Es solo un tiempo sin el carro, no es el fin del mundo.",
    "Paciencia. Fue un error tuyo, sí, pero velo por el lado amable: estás ahorrando en gasolina y evitando el estrés del tráfico.",
    "Respira profundo. Te toca pagar el castigo que te ganaste, pero el tiempo vuela. Sobrevivirás.",
    "Tranquilo. Tres meses pasan rápido. Lección aprendida a la mala, pero al final no es para tanto.",
    "Fuerza. Aceptar que la regaste es el primer paso. Ahora solo toca tener paciencia, hay cosas mucho peores en la vida.",
    "No te desesperes. Todo acto tiene su consecuencia. Tómalo como una anécdota temporal, pronto volverás al volante."
];

export default function Countdown() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isWakeLockActive, setIsWakeLockActive] = useState(false);
    const wakeLockRef = useRef(null);

    const [activeView, setActiveView] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isFinished: false,
    });
    const [percentage, setPercentage] = useState(0);
    const [calendarDays, setCalendarDays] = useState([]);

    useEffect(() => {
        const generateCalendar = () => {
            const start = new Date(START_DATE);
            const end = new Date(TARGET_DATE);
            const today = TEST_DATE ? new Date(TEST_DATE) : new Date();
            today.setHours(0, 0, 0, 0);

            const daysArray = [];
            let current = new Date(start);

            while (current <= end) {
                const isPast = current < today;
                const isToday = current.getTime() === today.getTime();

                daysArray.push({
                    date: new Date(current),
                    isPast,
                    isToday
                });
                current.setDate(current.getDate() + 1);
            }
            setCalendarDays(daysArray);
        };
        generateCalendar();
    }, []);

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && activeView === 0) setActiveView(1);
        if (isRightSwipe && activeView === 1) setActiveView(0);
    };

    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([50]);
        }
    };

    const toggleWakeLock = async () => {
        if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
            try {
                if (isWakeLockActive && wakeLockRef.current) {
                    await wakeLockRef.current.release();
                    wakeLockRef.current = null;
                    setIsWakeLockActive(false);
                } else {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                    setIsWakeLockActive(true);
                }
            } catch (err) {
                console.error("Error con Wake Lock:", err);
            }
        } else {
            alert("Tu navegador no soporta mantener la pantalla encendida.");
        }
    };

    const enableAppBadge = async () => {
        if (typeof window !== 'undefined' && !('Notification' in window)) {
            alert("Tu navegador no soporta insignias en el ícono.");
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
                navigator.setAppBadge(timeLeft.days).catch(console.error);
                alert("¡Listo! Ve a la pantalla de inicio y mira el ícono de la app.");
            }
        } else {
            alert("Necesitas aceptar el permiso para ver los días en el ícono.");
        }
    };

    useEffect(() => {
        return () => {
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(console.error);
            }
        };
    }, []);

    useEffect(() => {
        const target = new Date(TARGET_DATE).getTime();
        const start = new Date(START_DATE).getTime();
        const timeOffset = TEST_DATE ? new Date(TEST_DATE).getTime() - new Date().getTime() : 0;

        const calculateTime = () => {
            const now = new Date().getTime() + timeOffset;
            const difference = target - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true });
                setPercentage(100);
                setIsLoaded(true);
                if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator) {
                    navigator.clearAppBadge().catch(console.error);
                }
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            const totalDuration = target - start;
            const elapsed = now - start;
            let currentPercentage = (elapsed / totalDuration) * 100;
            if (currentPercentage < 0) currentPercentage = 0;
            if (currentPercentage > 100) currentPercentage = 100;

            if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                    navigator.setAppBadge(days).catch(console.error);
                }
            }

            setTimeLeft({ days, hours, minutes, seconds, isFinished: false });
            setPercentage(currentPercentage);
            setIsLoaded(true);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const { days, hours, minutes, seconds, isFinished } = timeLeft;
    const format = (num) => num.toString().padStart(2, "0");
    const currentMessage = DAILY_MESSAGES[days % DAILY_MESSAGES.length];

    let theme = {
        titleText: (
            <>Faltan 3 meses para<br className="block lg:hidden" /> el 4 de Diciembre</>
        ),
        titleClasses: "from-indigo-400 to-cyan-400",
        barClasses: "from-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]",
        secondsBox: "bg-indigo-900/20 border-indigo-500/30 shadow-indigo-500/10",
        secondsNum: "text-indigo-300",
        secondsLabel: "text-indigo-400",
        progressText: "text-slate-400",
        messageBox: "bg-indigo-900/10 border-indigo-500/20 text-indigo-200"
    };

    if (isFinished) {
        theme.titleText = (<>¡El gran día ha llegado! <br className="block lg:hidden" /> Ya puedes manejar.</>);
    } else if (days <= 7) {
        theme = { ...theme, titleText: (<>¡Falta menos de <br className="block lg:hidden" /> una semana!</>), titleClasses: "from-red-500 to-rose-400 animate-pulse", barClasses: "from-red-600 to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]", secondsBox: "bg-red-900/30 border-red-500/60 shadow-red-500/30 animate-pulse", secondsNum: "text-red-300", secondsLabel: "text-red-400", progressText: "text-red-400", messageBox: "bg-red-900/10 border-red-500/20 text-red-200" };
    } else if (days <= 31) {
        theme = { ...theme, titleText: (<>Falta 1 mes para <br className="block lg:hidden" /> el 4 de Diciembre</>), titleClasses: "from-orange-400 to-amber-300", barClasses: "from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]", secondsBox: "bg-orange-900/20 border-orange-500/40 shadow-orange-500/20", secondsNum: "text-orange-300", secondsLabel: "text-orange-400", progressText: "text-orange-400", messageBox: "bg-orange-900/10 border-orange-500/20 text-orange-200" };
    } else if (days <= 61) {
        theme = { ...theme, titleText: (<>Faltan 2 meses para <br className="block md:hidden" /> el 4 de Diciembre</>), titleClasses: "from-purple-400 to-pink-400", barClasses: "from-purple-500 to-pink-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]", secondsBox: "bg-purple-900/20 border-purple-500/40 shadow-purple-500/20", secondsNum: "text-purple-300", secondsLabel: "text-purple-400", progressText: "text-purple-400", messageBox: "bg-purple-900/10 border-purple-500/20 text-purple-200" };
    }

    if (!isLoaded) return <div className="min-h-screen w-full flex items-center justify-center text-white">Cargando...</div>;

    const NavIndicators = () => (
        <div className="flex justify-center items-center gap-3 mb-8 w-full">
            <button
                onClick={() => { setActiveView(0); triggerHaptic(); }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeView === 0 ? 'bg-indigo-400 w-8' : 'bg-slate-700'}`}
                aria-label="Vista de Cuenta Regresiva"
            />
            <button
                onClick={() => { setActiveView(1); triggerHaptic(); }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeView === 1 ? 'bg-indigo-400 w-8' : 'bg-slate-700'}`}
                aria-label="Vista de Calendario"
            />
        </div>
    );

    return (
        <div
            className="w-full max-w-5xl overflow-hidden relative touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeView * 100}%)` }}
            >
                <div className="w-full flex-shrink-0 flex flex-col items-center animate-fade-in px-4 pb-10">
                    <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r ${theme.titleClasses} text-center drop-shadow-sm transition-all duration-700`}>
                        {theme.titleText}
                    </h1>

                    <div className="w-full max-w-[280px] md:max-w-lg mb-8 text-center flex flex-col items-center">
                        <div className="w-full bg-slate-800/80 rounded-full h-2.5 mb-3 overflow-hidden shadow-inner border border-slate-700/50">
                            <div className={`h-full rounded-full bg-gradient-to-r ${theme.barClasses} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className={`text-base font-medium tabular-nums tracking-wider ${theme.progressText}`}>
                            {isFinished ? "100% completado" : `${percentage.toFixed(5)}% transcurrido`}
                        </span>

                        {/* Contenedor de Botones de Hardware (Wake Lock y Badge) */}
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <button
                                onClick={toggleWakeLock}
                                className={`px-5 py-2 rounded-full text-xs md:text-sm font-medium border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isWakeLockActive ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.2)]" : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"}`}
                            >
                                {isWakeLockActive ? "☀️ Pantalla Activa" : "🌙 Mantener Encendida"}
                            </button>

                            <button
                                onClick={enableAppBadge}
                                className="px-5 py-2 rounded-full text-xs md:text-sm font-medium border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
                            >
                                🔴 Activar Contador en Ícono
                            </button>
                        </div>
                    </div>

                    <NavIndicators />

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

                    {!isFinished && (
                        <div className={`mt-10 mb-2 w-full max-w-2xl text-center p-5 rounded-2xl border backdrop-blur-sm shadow-lg transition-colors duration-700 ${theme.messageBox}`}>
                            <p className="text-sm sm:text-base md:text-lg font-medium italic tracking-wide">"{currentMessage}"</p>
                        </div>
                    )}
                </div>

                <div className="w-full flex-shrink-0 flex flex-col items-center px-4 pt-4 pb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 text-center">
                        El Mapa del Castigo
                    </h2>
                    <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
                        Cada "X" roja es un día superado a pie. Los días grises son los que te faltan por cumplir.
                    </p>

                    <NavIndicators />

                    <div className="w-full max-w-3xl bg-slate-800/30 backdrop-blur-sm p-4 sm:p-6 rounded-3xl border border-slate-700/50 shadow-xl">
                        <div className="grid grid-cols-7 gap-1 sm:gap-2 justify-items-center">
                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                <div key={i} className="text-xs text-slate-500 font-semibold mb-2">{d}</div>
                            ))}

                            {calendarDays.map((dayObj, index) => {
                                const isFirstDay = index === 0;
                                const startDayOfWeek = dayObj.date.getDay();
                                const emptySpacesCount = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
                                const emptySpaces = isFirstDay ? Array.from({ length: emptySpacesCount }).map((_, i) => <div key={`empty-${i}`} className="w-8 h-8 sm:w-10 sm:h-10"></div>) : null;

                                return (
                                    <React.Fragment key={index}>
                                        {emptySpaces}
                                        <div
                                            onClick={triggerHaptic}
                                            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer select-none
                                                ${dayObj.isPast ? 'bg-red-900/20 text-red-500 border border-red-500/20 line-through decoration-red-500/50' : ''}
                                                ${dayObj.isToday ? 'bg-indigo-500/20 text-indigo-300 border-2 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse' : ''}
                                                ${!dayObj.isPast && !dayObj.isToday ? 'bg-slate-800/50 text-slate-500 border border-slate-700/50 hover:bg-slate-700' : ''}
                                            `}
                                        >
                                            {dayObj.isPast ? '✘' : dayObj.date.getDate()}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}