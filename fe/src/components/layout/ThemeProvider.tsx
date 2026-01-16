"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ConfigProvider } from "antd";
import { darkTheme, lightTheme } from "@/styles/theme";

interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDarkMode: true,
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Optional: Check local storage or system preference here
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light") {
            setIsDarkMode(false);
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode((prev) => {
            const newMode = !prev;
            localStorage.setItem("theme", newMode ? "dark" : "light");
            return newMode;
        });
    };

    if (!mounted) {
        return (
            <div style={{ visibility: "hidden" }}>
                <ConfigProvider theme={darkTheme}>{children}</ConfigProvider>
            </div>
        );
    }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <ConfigProvider theme={isDarkMode ? darkTheme : lightTheme}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};
