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
    const shineRef = useRef<SVGLinearGradientElement>(null);

    useGSAP(() => {
        // 1. Floating Path
        gsap.to(coinRef.current, {
            x: xMove,
            y: yMove,
            duration: duration,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: delay
        });

        // 2. 3D Tumble
        gsap.to(ringRef.current, {
            rotationX: 360,
            rotationY: 360,
            duration: duration * 2,
            repeat: -1,
            ease: "none",
        });

        // 3. Shimmer Animation
        gsap.to(shineRef.current, {
            attr: { x1: "150%", x2: "250%" },
            duration: 3,
            repeat: -1,
            ease: "power2.inOut",
            delay: delay
        });

    }, { scope: coinRef });

    return (
        <div
            ref={coinRef}
            className={`absolute z-0 pointer-events-none ${className}`}
            style={{ width: size, height: size, perspective: "1000px" }}
        >
            <div
                ref={ringRef}
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
            >
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                >
                    <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FBDF8C" />
                            <stop offset="50%" stopColor="#FBBF24" />
                            <stop offset="100%" stopColor="#B45309" />
                        </linearGradient>

                        <linearGradient id="shineGradient" x1="-150%" y1="0%" x2="-50%" y2="0%" ref={shineRef}>
                            <stop offset="0%" stopColor="white" stopOpacity="0" />
                            <stop offset="50%" stopColor="white" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>

                        <filter id="innerShadow">
                            <feOffset dx="0" dy="1" />
                            <feGaussianBlur stdDeviation="1" result="offset-blur" />
                            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                            <feFlood floodColor="black" floodOpacity="0.5" result="color" />
                            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                        </filter>
                    </defs>

                    {/* Outer Rim */}
                    <circle cx="50" cy="50" r="48" fill="url(#goldGradient)" stroke="#F59E0B" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#B45309" strokeWidth="1" strokeDasharray="1,2" opacity="0.3" />

                    {/* Coin Face */}
                    <circle cx="50" cy="50" r="42" fill="url(#goldGradient)" filter="url(#innerShadow)" />

                    {/* Minting Details */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />

                    {/* Central Symbol 'L' (LaRed) */}
                    <text
                        x="50"
                        y="62"
                        textAnchor="middle"
                        fill="#78350F"
                        style={{
                            fontSize: '35px',
                            fontWeight: 'bold',
                            fontFamily: 'serif',
                            filter: 'drop-shadow(0px 1px 1px rgba(255,255,255,0.3))'
                        }}
                    >
                        PL
                    </text>

                    {/* Animated Shine Overlay */}
                    <circle cx="50" cy="50" r="48" fill="url(#shineGradient)" pointerEvents="none" />
                </svg>
            </div>
        </div>
    );
}
