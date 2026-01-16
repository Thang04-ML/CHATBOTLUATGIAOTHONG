"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";

interface Sparkle {
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    opacity: number;
    type: "trail" | "burst";
}

const SparklesCursor: React.FC = () => {
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);
    const sparkleIdRef = useRef(0);
    const lastPosRef = useRef({ x: 0, y: 0 });
    const throttleRef = useRef(false);

    const createSparkle = useCallback(
        (x: number, y: number, type: "trail" | "burst" = "trail"): Sparkle => {
            return {
                id: sparkleIdRef.current++,
                x: x + (Math.random() - 0.5) * (type === "burst" ? 60 : 20),
                y: y + (Math.random() - 0.5) * (type === "burst" ? 60 : 20),
                size: type === "burst" ? Math.random() * 12 + 8 : Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                opacity: 1,
                type,
            };
        },
        []
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (throttleRef.current) return;
            throttleRef.current = true;

            const dx = e.clientX - lastPosRef.current.x;
            const dy = e.clientY - lastPosRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 15) {
                const newSparkle = createSparkle(e.clientX, e.clientY, "trail");
                setSparkles((prev) => [...prev.slice(-15), newSparkle]);
                lastPosRef.current = { x: e.clientX, y: e.clientY };
            }

            setTimeout(() => {
                throttleRef.current = false;
            }, 30);
        },
        [createSparkle]
    );

    const handleClick = useCallback(
        (e: MouseEvent) => {
            const burstSparkles: Sparkle[] = [];
            for (let i = 0; i < 8; i++) {
                burstSparkles.push(createSparkle(e.clientX, e.clientY, "burst"));
            }
            setSparkles((prev) => [...prev.slice(-10), ...burstSparkles]);
        },
        [createSparkle]
    );

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleClick);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("click", handleClick);
        };
    }, [handleMouseMove, handleClick]);

    // Fade out sparkles
    useEffect(() => {
        const interval = setInterval(() => {
            setSparkles((prev) =>
                prev
                    .map((sparkle) => ({
                        ...sparkle,
                        opacity: sparkle.opacity - (sparkle.type === "burst" ? 0.08 : 0.05),
                        y: sparkle.y - (sparkle.type === "burst" ? 2 : 0.5),
                    }))
                    .filter((sparkle) => sparkle.opacity > 0)
            );
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const { isDarkMode } = useTheme();

    const getColors = (type: "trail" | "burst") => {
        if (isDarkMode) {
            return {
                fill: type === "burst" ? "#FFD700" : "#FFFFFF",
                filter: "drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))",
            };
        }
        // Light mode colors: Light blue trail (#40a9ff), Deep red burst (#a8071a)
        return {
            fill: type === "burst" ? "#e9485bff" : "#40a9ff",
            filter:
                type === "burst"
                    ? "drop-shadow(0 0 4px rgba(244, 51, 74, 0.6))"
                    : "drop-shadow(0 0 4px rgba(64, 169, 255, 0.6))",
        };
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 9999,
                overflow: "hidden",
            }}
        >
            {sparkles.map((sparkle) => {
                const colors = getColors(sparkle.type);
                return (
                    <svg
                        key={sparkle.id}
                        style={{
                            position: "absolute",
                            left: sparkle.x,
                            top: sparkle.y,
                            width: sparkle.size,
                            height: sparkle.size,
                            opacity: sparkle.opacity,
                            transform: `translate(-50%, -50%) rotate(${sparkle.rotation}deg)`,
                            transition: "opacity 0.1s ease-out",
                        }}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"
                            fill={colors.fill}
                            filter={colors.filter}
                        />
                    </svg>
                );
            })}
        </div>
    );
};

export default SparklesCursor;
