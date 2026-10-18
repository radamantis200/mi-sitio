import { useState, useEffect, useRef } from "react";
import { useTime } from "./useTime";
import { useCalendar } from "./useCalendar";
import { useSwipeViews } from "./useSwipeViews";

export function useCountdown() {
    // 1. Integración de los Hooks modularizados
    const { isLoaded, timeLeft, percentage } = useTime();
    const { calendarMonths } = useCalendar(timeLeft.days, timeLeft.isFinished);
    const swipe = useSwipeViews(calendarMonths, isLoaded);

    // 2. Funciones del Sistema (WakeLock, AppBadge, Haptic)
    const [isWakeLockActive, setIsWakeLockActive] = useState(false);
    const wakeLockRef = useRef(null);

    useEffect(() => {
        return () => { if (wakeLockRef.current) wakeLockRef.current.release().catch(console.error); };
    }, []);

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
            } catch (err) { console.error("Error con Wake Lock:", err); }
        }
    };

    const enableAppBadge = async () => {
        if (typeof window !== 'undefined' && !('Notification' in window)) return alert("Navegador no soportado.");
        const permission = await Notification.requestPermission();
        if (permission === 'granted' && typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
            navigator.setAppBadge(timeLeft.days).catch(console.error);
            alert("¡Listo! Ve a la pantalla de inicio y mira el ícono de la app.");
        }
    };

    const triggerHaptic = () => { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([50]); };
    const format = (num) => num.toString().padStart(2, "0");

    // 3. Lógica UI Digerida
    const getSummaryData = () => {
        const { isFinished, days, totalHours } = timeLeft;
        const displayPercent = isFinished ? "100" : (Math.trunc(percentage * 100) / 100).toFixed(2);

        const weeksLeft = isFinished ? 0 : (days < 7 ? 0 : Math.ceil(days / 7));

        const daysPassed = 91 - days;
        const currentDay = isFinished ? 91 : Math.min(90, daysPassed);

        const isSingular = (val) => val === 1 || (val === 0 && !isFinished);
        const formatValue = (val) => val === 0 && !isFinished ? "< 1" : val?.toLocaleString('es-ES');

        return {
            displayPercent,
            currentDay,
            daysLeft: isFinished ? 0 : days,
            weeksLeft: isFinished ? 0 : weeksLeft,
            hoursLeft: isFinished ? 0 : totalHours,
            isSingular,
            formatValue
        };
    };

    const getTheme = () => {
        const { days, isFinished } = timeLeft;
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
        return theme;
    };

    // 4. Exportamos todo el ecosistema (Misma API que tenías antes)
    return {
        isLoaded, isWakeLockActive, timeLeft, percentage, calendarMonths,
        ...swipe,
        triggerHaptic, toggleWakeLock, enableAppBadge, format,
        theme: getTheme(),
        summaryData: getSummaryData()
    };
}