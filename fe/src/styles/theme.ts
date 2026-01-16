import type { ThemeConfig } from "antd";

export const darkTheme: ThemeConfig = {
    token: {
        colorPrimary: "#ffffff",
        colorBgBase: "#0a0a0a",
        colorTextBase: "#ffffff",
        colorBgContainer: "#141414",
        colorBorder: "#2a2a2a",
        colorBorderSecondary: "#1f1f1f",
        borderRadius: 8,
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Button: {
            primaryColor: "#000000",
            colorPrimaryHover: "#e0e0e0",
        },
        Input: {
            colorBgContainer: "#141414",
            colorBorder: "#2a2a2a",
            activeBorderColor: "#444",
            hoverBorderColor: "#333",
        },
        Select: {
            colorBgContainer: "#141414",
            colorBorder: "#2a2a2a",
            optionSelectedBg: "#1f1f1f",
        },
        List: {
            colorText: "#ffffff",
            colorTextDescription: "#888",
        },
        Message: {
            contentBg: "#1a1a1a",
        },
        Modal: {
            contentBg: "#141414",
            headerBg: "#141414",
        },
        Popconfirm: {
            colorText: "#ffffff",
        },
    },
};

export const lightTheme: ThemeConfig = {
    token: {
        colorPrimary: "#000000",
        colorBgBase: "#ffffff",
        colorTextBase: "#000000",
        colorBgContainer: "#f5f5f5",
        colorBorder: "#d9d9d9",
        colorBorderSecondary: "#e8e8e8",
        borderRadius: 8,
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Button: {
            primaryColor: "#ffffff",
        },
        Input: {
            colorBgContainer: "#ffffff",
            colorBorder: "#d9d9d9",
        },
        Select: {
            colorBgContainer: "#ffffff",
            colorBorder: "#d9d9d9",
        },
    },
};
