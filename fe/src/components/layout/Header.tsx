"use client";

import React from "react";
import { Button, Dropdown, MenuProps, theme } from "antd";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { LoginOutlined, SettingOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useTheme } from "@/components/layout/ThemeProvider";

const Header: React.FC = () => {
    const { token } = theme.useToken();
    const { isDarkMode, toggleTheme } = useTheme();

    const settingsItems: MenuProps["items"] = [
        {
            key: "about",
            label: "Giới thiệu",
        },
        {
            key: "help",
            label: "Trợ giúp",
        },
    ];

    return (
        <header
            style={{
                height: 56,
                background: token.colorBgBase,
                borderBottom: `1px solid ${token.colorBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                position: "sticky",
                top: 0,
                zIndex: 100,
                transition: "all 0.3s",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>🚗</span>
                <span
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: token.colorText,
                    }}
                >
                    VN Traffic Law AI
                </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Button
                    type="text"
                    icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                    onClick={toggleTheme}
                    style={{ color: token.colorText }}
                />

                <Dropdown menu={{ items: settingsItems }} placement="bottomRight">
                    <Button
                        type="text"
                        icon={<SettingOutlined />}
                        style={{ color: token.colorTextSecondary }}
                    />
                </Dropdown>

                <SignedIn>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: {
                                    width: 32,
                                    height: 32,
                                },
                            },
                        }}
                    />
                </SignedIn>

                <SignedOut>
                    <Link href="/sign-in">
                        <Button
                            type="primary"
                            icon={<LoginOutlined />}
                            style={{
                                background: token.colorBgContainer,
                                color: token.colorText,
                                border: "none",
                            }}
                        >
                            Đăng nhập
                        </Button>
                    </Link>
                </SignedOut>
            </div>
        </header>
    );
};

export default Header;
