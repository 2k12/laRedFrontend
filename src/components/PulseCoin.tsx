import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface PulseCoinProps {
    className?: string;
    size?: number;
    delay?: number;
    duration?: number;
    xMove?: number;
    yMove?: number;
}

export default function PulseCoin({
    className,
    size = 120,
    delay = 0,
    duration = 6,
    xMove = 100,
    yMove = -170
}: PulseCoinProps) {
    const coinRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const coreRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // 1. Floating Path (The 60deg incline flow)
        gsap.to(coinRef.current, {
            x: xMove,
            y: yMove,
            duration: duration,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: delay
        });

        // 2. Gyroscopic Tumble (3D Rotation)
        gsap.to(ringRef.current, {
            rotationX: 360,
            rotationY: 360,
            rotationZ: 90,
            duration: duration * 2.5,
            repeat: -1,
            ease: "none",
        });

        // 3. Core Pulse (Breathing)
        gsap.to(coreRef.current, {
            scale: 1.2,
            opacity: 0.8,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });

    }, { scope: coinRef });

    return (
        <div
            ref={coinRef}
            className={`absolute z-0 pointer-events-none mix-blend-screen ${className}`}
            style={{ width: size, height: size, perspective: "800px" }}
        >
            {/* 3D Container */}
            <div
                ref={ringRef}
                className="w-full h-full relative preserve-3d"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Outer Rim - Gold Structure */}
                <div
                    className="absolute inset-0 rounded-full border-[1px] border-amber-400/40"
                    style={{
                        boxShadow: "0 0 15px rgba(251, 191, 36, 0.2), inset 0 0 10px rgba(251, 191, 36, 0.2)",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)"
                    }}
                />

                {/* Tech Ring (Dashed) - Gold */}
                <div
                    className="absolute inset-[15%] rounded-full border border-dashed border-amber-400/30"
                    style={{ transform: "rotateX(45deg)" }}
                />

                {/* Inner Core - Gold Energy */}
                <div
                    ref={coreRef}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15%] h-[15%] rounded-full bg-amber-400"
                    style={{
                        boxShadow: "0 0 20px 5px rgba(251, 191, 36, 0.6)"
                    }}
                />
            </div>
        </div>
    );
}
