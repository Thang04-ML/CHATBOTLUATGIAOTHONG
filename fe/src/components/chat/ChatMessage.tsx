"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, theme } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
    createdAt?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    role,
    content,
    createdAt,
}) => {
    const { token } = theme.useToken();
    const isUser = role === "user";

    return (
        <div
            style={{
                display: "flex",
                gap: 12,
                padding: "16px 24px",
                flexDirection: isUser ? "row-reverse" : "row",
            }}
        >
            <Avatar
                size={36}
                src={!isUser ? "/capybara.jpg" : undefined}
                icon={isUser ? <UserOutlined /> : undefined}
                style={{
                    backgroundColor: isUser ? token.colorBgContainer : "transparent",
                    color: isUser ? token.colorText : token.colorTextLightSolid,
                    flexShrink: 0,
                    border: isUser ? `1px solid ${token.colorBorder}` : "none",
                }}
            />
            <div
                style={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                }}
            >
                <div
                    style={{
                        background: isUser ? token.colorBgContainer : token.colorBgLayout,
                        color: token.colorText,
                        padding: "12px 16px",
                        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        fontSize: 14,
                        wordBreak: "break-word",
                        border: isUser ? "none" : `1px solid ${token.colorBorderSecondary}`,
                        boxShadow: isUser ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                    }}
                >
                    {isUser ? (
                        <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
                    ) : (
                        <div className="markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                        </div>
                    )}
                </div>
                {createdAt && (
                    <span
                        style={{
                            fontSize: 11,
                            color: "#666",
                            marginTop: 4,
                        }}
                    >
                        {new Date(createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
