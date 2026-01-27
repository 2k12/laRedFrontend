import { useState, useEffect, useRef } from "react";

interface ScrambleTextProps {
    text: string;
    duration?: number;
    revealDuration?: number;
    trigger?: boolean;
    autoStart?: boolean;
    className?: string;
}

const chars = "!<>-_\\/[]{}—=+*^?#________";

export default function ScrambleText({
    text,
    duration = 0.5,
    revealDuration = 0.5,
    trigger = true,
    autoStart = false,
    className = ""
}: ScrambleTextProps) {
    const [displayText, setDisplayText] = useState("");
    const iterations = useRef(0);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!trigger && !autoStart) return;

        const totalFrames = (duration + revealDuration) * 60;
        const revealStartFrame = duration * 60;

        const update = () => {
            iterations.current++;

            const iterationsThisFrame = iterations.current;
            const revealProgress = Math.max(0, (iterationsThisFrame - revealStartFrame) / revealStartFrame);

            const scrambled = text.split("").map((char, index) => {
                if (index < text.length * revealProgress) {
                    return char;
                }
                return chars[Math.floor(Math.random() * chars.length)];
            }).join("");

            setDisplayText(scrambled);

            if (iterations.current < totalFrames) {
                frameRef.current = requestAnimationFrame(update);
            } else {
                setDisplayText(text);
            }
        };

        iterations.current = 0;
        frameRef.current = requestAnimationFrame(update);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [text, trigger, duration, revealDuration]);

    return <span className={className}>{displayText}</span>;
}
