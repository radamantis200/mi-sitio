import React, { useState, useEffect } from "react";

const TARGET_DATE = "2026-12-04T00:00:00";
const START_DATE = "2026-09-04T00:00:00";
const TEST_DATE = null;

// Mensajes rotativos que combinan consuelo con un golpe de realidad
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

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isFinished: false,
    });
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        const target = new Date(TARGET_DATE).getTime();
        const start = new Date(START_DATE).getTime();

        const timeOffset = TEST_DATE
            ? new Date(TEST_DATE).getTime() - new Date().getTime()
            : 0;

        const calculateTime = () => {
            const now = new Date().getTime() + timeOffset;
            const difference = target - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true });
                setPercentage(100);
                setIsLoaded(true);
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

    // Selecciona un mensaje basado en los días restantes para que cambie diariamente
    const currentMessage = DAILY_MESSAGES[days % DAILY_MESSAGES.length];

    let theme = {
        titleText: "Faltan 3 meses para el 4 de Diciembre",
        titleClasses: "from-indigo-400 to-cyan-400",
        barClasses: "from-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]",
        secondsBox: "bg-indigo-900/20 border-indigo-500/30 shadow-indigo-500/10",
        secondsNum: "text-indigo-300",
        secondsLabel: "text-indigo-400",
        progressText: "text-slate-400",
        messageBox: "bg-indigo-900/10 border-indigo-500/20 text-indigo-200"
    };

    if (isFinished) {
        theme.titleText = "¡El gran día ha llegado! Ya puedes manejar.";
    } else if (days <= 7) {
        theme = {
            titleText: "¡Faltan menos de una semana!",
            titleClasses: "from-red-500 to-rose-400 animate-pulse",
            barClasses: "from-red-600 to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]",
            secondsBox: "bg-red-900/30 border-red-500/60 shadow-red-500/30 animate-pulse",
            secondsNum: "text-red-300",
            secondsLabel: "text-red-400",
            progressText: "text-red-400",
            messageBox: "bg-red-900/10 border-red-500/20 text-red-200"
        };
    } else if (days <= 31) {
        theme = {
            titleText: "Falta 1 mes para el 4 de Diciembre",
            titleClasses: "from-orange-400 to-amber-300",
            barClasses: "from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]",
            secondsBox: "bg-orange-900/20 border-orange-500/40 shadow-orange-500/20",
            secondsNum: "text-orange-300",
            secondsLabel: "text-orange-400",
            progressText: "text-orange-400",
            messageBox: "bg-orange-900/10 border-orange-500/20 text-orange-200"
        };
    } else if (days <= 61) {
        theme = {
            titleText: "Faltan 2 meses para el 4 de Diciembre",
            titleClasses: "from-purple-400 to-pink-400",
            barClasses: "from-purple-500 to-pink-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
            secondsBox: "bg-purple-900/20 border-purple-500/40 shadow-purple-500/20",
            secondsNum: "text-purple-300",
            secondsLabel: "text-purple-400",
            progressText: "text-purple-400",
            messageBox: "bg-purple-900/10 border-purple-500/20 text-purple-200"
        };
    }

    if (!isLoaded) {
        return (
            <div className="max-w-5xl w-full flex flex-col items-center animate-pulse">
                <div className="h-10 sm:h-12 w-3/4 md:w-1/2 bg-slate-800 rounded-lg mb-6"></div>
                <div className="w-full max-w-[280px] md:max-w-lg mb-12 flex flex-col items-center">
                    <div className="w-full bg-slate-800 rounded-full h-2.5 mb-3"></div>
                    <div className="h-4 w-32 bg-slate-800 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 w-full max-w-[320px] md:max-w-5xl mx-auto">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center justify-center bg-slate-800/40 rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800/50">
                            <div className="h-16 sm:h-20 md:h-24 w-24 sm:w-32 bg-slate-700/50 rounded-lg mb-6"></div>
                            <div className="h-4 sm:h-5 w-16 bg-slate-700/50 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl w-full flex flex-col items-center animate-fade-in">

            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r ${theme.titleClasses} text-center drop-shadow-sm transition-all duration-700`}>
                {theme.titleText}
            </h1>

            <div className="w-full max-w-[280px] md:max-w-lg mb-8 text-center">
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 mb-3 overflow-hidden shadow-inner border border-slate-700/50">
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${theme.barClasses} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <span className={`text-base font-medium tabular-nums tracking-wider ${theme.progressText}`}>
                    {isFinished ? "100% completado" : `${percentage.toFixed(5)}% transcurrido`}
                </span>

                {TEST_DATE && (
                    <div className="text-sm text-yellow-400 mt-2 animate-pulse font-semibold uppercase tracking-wider">
                        ⚠️ Modo Prueba Activado
                    </div>
                )}
            </div>

            {/* Mensaje de consuelo y realidad */}
            {!isFinished && (
                <div className={`mb-10 max-w-2xl text-center p-5 rounded-2xl border backdrop-blur-sm shadow-lg transition-colors duration-700 ${theme.messageBox}`}>
                    <p className="text-sm sm:text-base md:text-lg font-medium italic tracking-wide">
                        "{currentMessage}"
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 w-full max-w-[320px] md:max-w-5xl mx-auto">
                {[
                    { label: "Días", value: format(days) },
                    { label: "Horas", value: format(hours) },
                    { label: "Minutos", value: format(minutes) }
                ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-500/50 transition-colors duration-300 rounded-3xl p-8 sm:p-10 shadow-xl">
                        <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tabular-nums text-white">
                            {item.value}
                        </span>
                        <span className="text-sm sm:text-base md:text-lg text-slate-400 font-semibold uppercase tracking-[0.25em] mt-4">
                            {item.label}
                        </span>
                    </div>
                ))}

                <div className={`flex flex-col items-center justify-center backdrop-blur-sm border transition-all duration-700 rounded-3xl p-8 sm:p-10 shadow-xl ${theme.secondsBox}`}>
                    <span className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tabular-nums transition-colors duration-700 ${theme.secondsNum}`}>
                        {format(seconds)}
                    </span>
                    <span className={`text-sm sm:text-base md:text-lg font-semibold uppercase tracking-[0.25em] mt-4 transition-colors duration-700 ${theme.secondsLabel}`}>
                        Segundos
                    </span>
                </div>
            </div>
        </div>
    );
}