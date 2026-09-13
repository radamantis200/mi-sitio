import React, { useState, useEffect, useRef } from "react";

const TARGET_DATE = "2026-12-04T00:00:00";
const START_DATE = "2026-09-04T00:00:00";
const TEST_DATE = null;

const MONTH_THEMES = {
    "Septiembre": "text-amber-400 border-amber-500/30 bg-amber-500/10",
    "Octubre": "text-orange-400 border-orange-500/30 bg-orange-500/10",
    "Noviembre": "text-rose-400 border-rose-500/30 bg-rose-500/10",
    "Diciembre": "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
};

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function Countdown() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isWakeLockActive, setIsWakeLockActive] = useState(false);
    const wakeLockRef = useRef(null);

    // 0 = Countdown, 1 = Resumen, 2 = Calendario
    const [activeView, setActiveView] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isFinished: false });
    const [percentage, setPercentage] = useState(0);
    const [calendarMonths, setCalendarMonths] = useState([]);
    const [stats, setStats] = useState({ weekendsLeft: 0, mondaysLeft: 0, daysElapsed: 0 });

    const view1Ref = useRef(null);
    const view2Ref = useRef(null);
    const view3Ref = useRef(null);
    const [containerHeight, setContainerHeight] = useState('auto');

    useEffect(() => {
        const updateHeight = () => {
            if (activeView === 0 && view1Ref.current) {
                setContainerHeight(view1Ref.current.offsetHeight);
            } else if (activeView === 1 && view2Ref.current) {
                setContainerHeight(view2Ref.current.offsetHeight);
            } else if (activeView === 2 && view3Ref.current) {
                setContainerHeight(view3Ref.current.offsetHeight);
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        const timeout = setTimeout(updateHeight, 100);

        return () => {
            window.removeEventListener('resize', updateHeight);
            clearTimeout(timeout);
        };
    }, [activeView, calendarMonths, isLoaded]);

    useEffect(() => {
        const generateData = () => {
            const start = new Date(START_DATE);
            const end = new Date(TARGET_DATE);
            const today = TEST_DATE ? new Date(TEST_DATE) : new Date();
            today.setHours(0, 0, 0, 0);

            const monthsMap = {};
            let current = new Date(start);
            let weekends = 0;
            let mondays = 0;
            let elapsedCount = 0;

            while (current <= end) {
                const monthIdx = current.getMonth();
                const year = current.getFullYear();
                const key = `${year}-${monthIdx}`;
                const isPast = current < today;
                const isFuture = current >= today;

                if (!monthsMap[key]) {
                    monthsMap[key] = { monthName: MONTH_NAMES[monthIdx], year: year, days: [] };
                }

                monthsMap[key].days.push({
                    date: new Date(current),
                    isPast,
                    isToday: current.getTime() === today.getTime(),
                    isStart: current.getTime() === start.getTime(),
                    isTarget: current.getTime() === end.getTime()
                });

                if (isPast) elapsedCount++;
                if (isFuture) {
                    const dayOfWeek = current.getDay();
                    if (dayOfWeek === 6) weekends++;
                    if (dayOfWeek === 1) mondays++;
                }

                current.setDate(current.getDate() + 1);
            }

            setCalendarMonths(Object.values(monthsMap));
            setStats({ weekendsLeft: weekends, mondaysLeft: mondays, daysElapsed: elapsedCount });
        };
        generateData();
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

        if (isLeftSwipe && activeView < 2) setActiveView((prev) => prev + 1);
        if (isRightSwipe && activeView > 0) setActiveView((prev) => prev - 1);
    };

    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([50]);
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
        }
    };

    const enableAppBadge = async () => {
        if (typeof window !== 'undefined' && !('Notification' in window)) return alert("Navegador no soportado para insignias.");
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
                navigator.setAppBadge(timeLeft.days).catch(console.error);
                alert("¡Listo! Ve a la pantalla de inicio y mira el ícono de la app.");
            }
        }
    };

    useEffect(() => {
        return () => { if (wakeLockRef.current) wakeLockRef.current.release().catch(console.error); };
    }, []);

    useEffect(() => {
        const target = new Date(TARGET_DATE).getTime();
        const start = new Date(START_DATE).getTime();
        const timeOffset = TEST_DATE ? new Date(TEST_DATE).getTime() - new Date().getTime() : 0;

        const calculateTime = () => {
            const now = new Date().getTime() + timeOffset;
            const difference = target - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isFinished: true });
                setPercentage(100);
                setIsLoaded(true);
                if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator) navigator.clearAppBadge().catch(console.error);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            const totalHours = Math.floor(difference / (1000 * 60 * 60));

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

            setTimeLeft({ days, hours, minutes, seconds, totalHours, isFinished: false });
            setPercentage(currentPercentage);
            setIsLoaded(true);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const { days, hours, minutes, seconds, isFinished } = timeLeft;
    const format = (num) => num.toString().padStart(2, "0");

    let theme = {
        titleText: (<>Faltan 3 meses para<br className="block lg:hidden" /> el 4 de Diciembre</>),
        titleClasses: "from-indigo-400 to-cyan-400",
        barClasses: "from-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]",
        secondsBox: "bg-indigo-900/20 border-indigo-500/30 shadow-indigo-500/10",
        secondsNum: "text-indigo-300",
        secondsLabel: "text-indigo-400",
        progressText: "text-slate-400",
    };

    if (isFinished) {
        theme.titleText = (<>¡El gran día ha llegado! <br className="block lg:hidden" /> Ya puedes manejar.</>);
    } else if (days <= 7) {
        theme = { ...theme, titleText: (<>¡Falta menos de <br className="block lg:hidden" /> una semana!</>), titleClasses: "from-red-500 to-rose-400 animate-pulse", barClasses: "from-red-600 to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]", secondsBox: "bg-red-900/30 border-red-500/60 shadow-red-500/30 animate-pulse", secondsNum: "text-red-300", secondsLabel: "text-red-400", progressText: "text-red-400" };
    } else if (days <= 31) {
        theme = { ...theme, titleText: (<>Falta 1 mes para <br className="block lg:hidden" /> el 4 de Diciembre</>), titleClasses: "from-orange-400 to-amber-300", barClasses: "from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]", secondsBox: "bg-orange-900/20 border-orange-500/40 shadow-orange-500/20", secondsNum: "text-orange-300", secondsLabel: "text-orange-400", progressText: "text-orange-400" };
    } else if (days <= 61) {
        theme = { ...theme, titleText: (<>Faltan 2 meses para <br className="block md:hidden" /> el 4 de Diciembre</>), titleClasses: "from-purple-400 to-pink-400", barClasses: "from-purple-500 to-pink-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]", secondsBox: "bg-purple-900/20 border-purple-500/40 shadow-purple-500/20", secondsNum: "text-purple-300", secondsLabel: "text-purple-400", progressText: "text-purple-400" };
    }

    if (!isLoaded) return <div className="min-h-screen w-full flex items-center justify-center text-white">Cargando...</div>;

    const NavIndicators = ({ className = "mt-6 mb-2" }) => (
        <div className={`flex justify-center items-center gap-3 w-full ${className}`}>
            {[0, 1, 2].map((idx) => (
                <button
                    key={idx}
                    onClick={() => { setActiveView(idx); triggerHaptic(); }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${activeView === idx ? 'bg-indigo-400 w-8' : 'bg-slate-700 w-2.5'}`}
                    aria-label={`Vista ${idx + 1}`}
                />
            ))}
        </div>
    );

    return (
        <div
            className="w-full max-w-5xl overflow-hidden relative touch-pan-y transition-[height] duration-500 ease-in-out"
            style={{ height: containerHeight !== 'auto' ? `${containerHeight}px` : 'auto' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div
                className="w-full flex transition-transform duration-500 ease-in-out items-start"
                style={{ transform: `translateX(-${activeView * 100}%)` }}
            >
                {/* VISTA 1: COUNTDOWN */}
                <div ref={view1Ref} className="w-full min-w-full flex-shrink-0 flex flex-col items-center animate-fade-in px-4 pt-1 pb-6">
                    <div className="h-[72px] sm:h-[84px] md:h-[64px] flex items-center justify-center mb-3">
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${theme.titleClasses} text-center drop-shadow-sm transition-all duration-700 leading-tight`}>
                            {theme.titleText}
                        </h1>
                    </div>

                    <div className="w-full max-w-[320px] md:max-w-xl h-[72px] sm:h-[80px] mb-6 flex flex-col items-center justify-center">
                        <div className="w-full flex items-center gap-3">
                            <div className="flex-1 bg-slate-800/80 rounded-full h-2.5 overflow-hidden shadow-inner border border-slate-700/50">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${theme.barClasses} transition-all duration-1000 ease-out`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                    onClick={toggleWakeLock}
                                    title={isWakeLockActive ? "Pantalla fija activa" : "Fijar pantalla"}
                                    className={`w-8 h-8 rounded-full text-xs border flex items-center justify-center transition-all ${isWakeLockActive
                                            ? "bg-yellow-500/20 border-yellow-500/60 text-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                                            : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    {isWakeLockActive ? "☀️" : "🌙"}
                                </button>

                                <button
                                    onClick={enableAppBadge}
                                    title="Activar insignia en ícono"
                                    className="w-8 h-8 rounded-full text-xs border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all"
                                >
                                    🔴
                                </button>
                            </div>
                        </div>

                        <span className={`text-sm md:text-base font-medium tabular-nums tracking-wider mt-2 ${theme.progressText}`}>
                            {isFinished ? "100% completado" : `${percentage.toFixed(5)}% transcurrido`}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 w-full max-w-[320px] md:max-w-5xl mx-auto">
                        {[{ label: "Días", value: format(days) }, { label: "Horas", value: format(hours) }, { label: "Minutos", value: format(minutes) }].map((item, idx) => (
                            <div
                                key={idx}
                                onClick={triggerHaptic}
                                className="flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-500/50 transition-all duration-300 rounded-3xl p-8 sm:p-10 shadow-xl cursor-pointer active:scale-95 select-none"
                            >
                                <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tabular-nums text-white">
                                    {item.value}
                                </span>
                                <span className="text-sm sm:text-base md:text-lg text-slate-400 font-semibold uppercase tracking-[0.25em] mt-4">
                                    {item.label}
                                </span>
                            </div>
                        ))}

                        <div
                            onClick={triggerHaptic}
                            className={`flex flex-col items-center justify-center backdrop-blur-sm border transition-all duration-700 rounded-3xl p-8 sm:p-10 shadow-xl cursor-pointer active:scale-95 select-none ${theme.secondsBox}`}
                        >
                            <span className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tabular-nums transition-colors duration-700 ${theme.secondsNum}`}>
                                {format(seconds)}
                            </span>
                            <span className={`text-sm sm:text-base md:text-lg font-semibold uppercase tracking-[0.25em] mt-4 transition-colors duration-700 ${theme.secondsLabel}`}>
                                Segundos
                            </span>
                        </div>
                    </div>

                    <NavIndicators />
                </div>

                {/* VISTA 2: RESUMEN DE PROGRESO */}
                <div ref={view2Ref} className="w-full min-w-full flex-shrink-0 flex flex-col items-center animate-fade-in px-4 pt-1 pb-6">
                    <div className="h-[72px] sm:h-[84px] md:h-[64px] flex items-center justify-center mb-3">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-center drop-shadow-sm leading-tight">
                            Resumen del Progreso
                        </h2>
                    </div>

                    <div className="w-full max-w-[320px] md:max-w-xl h-[72px] sm:h-[80px] mb-6 flex items-center justify-center">
                        <p className="text-slate-400 text-sm md:text-base text-center">
                            Balance general del período del 4 de septiembre al 4 de diciembre.
                        </p>
                    </div>

                    <div className="w-full max-w-3xl flex flex-col gap-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
                                    {stats.daysElapsed} <span className="text-sm font-normal text-slate-400">/ 91</span>
                                </span>
                                <span className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1 text-center font-semibold">
                                    Días Cumplidos
                                </span>
                            </div>

                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-2xl sm:text-3xl font-bold text-amber-400 tabular-nums">
                                    {days}
                                </span>
                                <span className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1 text-center font-semibold">
                                    Días Restantes
                                </span>
                            </div>

                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-2xl sm:text-3xl font-bold text-cyan-400 tabular-nums">
                                    {Math.ceil(days / 7)}
                                </span>
                                <span className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1 text-center font-semibold">
                                    Semanas
                                </span>
                            </div>

                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-2xl sm:text-3xl font-bold text-indigo-400 tabular-nums">
                                    {percentage.toFixed(1)}%
                                </span>
                                <span className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1 text-center font-semibold">
                                    Avance Total
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-5 rounded-2xl flex flex-col gap-3 mt-1">
                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Puntos de Control
                            </span>

                            <div className="space-y-2.5 text-sm">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                                        <span className="text-slate-200 font-medium">Inicio</span>
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono">04 Sep 2026</span>
                                </div>

                                <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${percentage >= 50
                                        ? "bg-slate-800/60 border-slate-700/40"
                                        : "bg-slate-800/20 border-slate-800/50 opacity-80"
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2.5 h-2.5 rounded-full ${percentage >= 50
                                                ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                                                : "bg-slate-600"
                                            }`}></span>
                                        <span className={percentage >= 50 ? "text-slate-200 font-medium" : "text-slate-400"}>
                                            Punto Medio (50%)
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono">19 Oct 2026</span>
                                </div>

                                <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isFinished
                                        ? "bg-slate-800/60 border-slate-700/40"
                                        : "bg-slate-800/20 border-slate-800/50 opacity-80"
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2.5 h-2.5 rounded-full ${isFinished
                                                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                                : "bg-slate-600"
                                            }`}></span>
                                        <span className={isFinished ? "text-slate-200 font-medium" : "text-slate-400"}>
                                            Finalización
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono">04 Dic 2026</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <NavIndicators />
                </div>

                {/* VISTA 3: CALENDARIO */}
                <div ref={view3Ref} className="w-full min-w-full flex-shrink-0 flex flex-col items-center animate-fade-in px-4 pt-1 pb-6">
                    <div className="h-[72px] sm:h-[84px] md:h-[64px] flex items-center justify-center mb-3">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 text-center drop-shadow-sm leading-tight">
                            Lo que Queda por Delante
                        </h2>
                    </div>

                    <div className="w-full max-w-[320px] md:max-w-xl h-[72px] sm:h-[80px] mb-6 flex items-center justify-center">
                        <p className="text-slate-400 text-sm md:text-base text-center leading-relaxed">
                            <span className="text-red-400 font-medium">Rojo</span> son días pasados. <span className="text-emerald-400 font-medium">Verde</span> los que faltan. <br className="hidden sm:block" /> El 4 de Septiembre 🚩 marca el inicio.
                        </p>
                    </div>

                    <div className="w-full max-w-3xl">
                        {calendarMonths.map((monthData, mIndex) => {
                            const monthTheme = MONTH_THEMES[monthData.monthName] || "text-slate-400 border-slate-500/30 bg-slate-800/50";
                            const isLastMonth = mIndex === calendarMonths.length - 1;

                            return (
                                <div key={mIndex} className={`${isLastMonth ? 'mb-2' : 'mb-8'} bg-slate-800/30 backdrop-blur-sm p-4 sm:p-6 rounded-3xl border border-slate-700/50 shadow-xl`}>
                                    <div className={`px-4 py-2 rounded-xl mb-4 border text-center font-bold tracking-wider uppercase text-sm sm:text-base ${monthTheme}`}>
                                        {monthData.monthName} {monthData.year}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 sm:gap-2 justify-items-center">
                                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                            <div key={`head-${i}`} className="text-xs text-slate-500 font-semibold mb-2">{d}</div>
                                        ))}

                                        {monthData.days.map((dayObj, index) => {
                                            const isFirstDay = index === 0;
                                            const startDayOfWeek = dayObj.date.getDay();
                                            const emptySpacesCount = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
                                            const emptySpaces = isFirstDay ? Array.from({ length: emptySpacesCount }).map((_, i) => <div key={`empty-${i}`} className="w-8 h-8 sm:w-10 sm:h-10"></div>) : null;

                                            return (
                                                <React.Fragment key={index}>
                                                    {emptySpaces}
                                                    <div
                                                        onClick={triggerHaptic}
                                                        className={`relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer select-none
                                                            ${dayObj.isStart ? 'ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] z-10' : ''}
                                                            ${dayObj.isTarget ? 'ring-2 ring-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)] z-10' : ''}
                                                            ${dayObj.isToday && !dayObj.isPast ? 'bg-indigo-500/30 text-indigo-200 border-2 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse' : ''}
                                                            ${dayObj.isPast && !dayObj.isToday ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20' : ''}
                                                            ${!dayObj.isPast && !dayObj.isToday ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' : ''}
                                                        `}
                                                    >
                                                        {dayObj.date.getDate()}
                                                        {dayObj.isStart && <span className="absolute -top-2 -right-2 text-[10px]">🚩</span>}
                                                        {dayObj.isTarget && <span className="absolute -top-2 -right-2 text-[10px]">🏁</span>}
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <NavIndicators className="mt-2 mb-1" />
                </div>
            </div>
        </div>
    );
}