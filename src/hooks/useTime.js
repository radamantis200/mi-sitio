import { useState, useEffect } from "react";
import { TARGET_DATE, START_DATE, TEST_DATE } from "./config";

export function useTime() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isFinished: false });
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        const target = new Date(TARGET_DATE).getTime();
        const start = new Date(START_DATE).getTime();
        const timeOffset = TEST_DATE ? new Date(TEST_DATE).getTime() - new Date().getTime() : 0;
        
        let timeoutId;

        const calculateTime = () => {
            const now = new Date().getTime() + timeOffset;
            const difference = target - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isFinished: true });
                setPercentage(100);
                setIsLoaded(true);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            const totalHours = Math.floor(difference / (1000 * 60 * 60));

            const totalDuration = target - start;
            const elapsed = now - start;
            let currentPercentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

            setTimeLeft({ days, hours, minutes, seconds, totalHours, isFinished: false });
            setPercentage(currentPercentage);
            setIsLoaded(true);

            // Calculamos los milisegundos exactos que faltan para el siguiente segundo (.000)
            // Usamos el reloj del sistema (Date.now()) para evitar desfases.
            const msUntilNextSecond = 1000 - (Date.now() % 1000);
            
            timeoutId = setTimeout(calculateTime, msUntilNextSecond);
        };

        calculateTime();

        return () => clearTimeout(timeoutId);
    }, []);

    return { isLoaded, timeLeft, percentage };
}