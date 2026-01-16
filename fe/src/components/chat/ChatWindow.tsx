"use client";

import React, { useRef, useEffect } from "react";
import { theme } from "antd";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

interface ChatWindowProps {
    messages: Message[];
    isLoading?: boolean;
    onSuggestionClick?: (question: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    messages,
    isLoading = false,
    onSuggestionClick,
}) => {
    const { token } = theme.useToken();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    if (messages.length === 0 && !isLoading) {
        return (
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 40,
                    color: token.colorTextSecondary,
                }}
            >
                <div
                    style={{
                        fontSize: 64,
                        marginBottom: 24,
                    }}
                >
                    🚗
                </div>
                <h1
                    style={{
                        fontSize: 24,
                        fontWeight: 600,
                        color: token.colorText,
                        marginBottom: 8,
                    }}
                >
                    Trợ lý Luật Giao thông
                </h1>
                <p
                    style={{
                        fontSize: 14,
                        color: token.colorTextSecondary,
                        textAlign: "center",
                        maxWidth: 400,
                        lineHeight: 1.6,
                    }}
                >
                    Xin chào! Tôi là trợ lý AI giúp bạn tìm hiểu về luật giao thông đường
                    bộ Việt Nam. Hãy đặt câu hỏi để bắt đầu.
                </p>
                <div
                    style={{
                        marginTop: 32,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        justifyContent: "center",
                        maxWidth: 500,
                    }}
                >
                    {[
                        "Mức phạt vượt đèn đỏ?",
                        "Không đội mũ bảo hiểm bị phạt bao nhiêu?",
                        "Nồng độ cồn cho phép khi lái xe?",
                    ].map((suggestion, i) => (
                        <div
                            key={i}
                            style={{
                                padding: "8px 16px",
                                background: token.colorFillSecondary,
                                border: `1px solid ${token.colorBorder}`,
                                borderRadius: 20,
                                fontSize: 13,
                                color: token.colorTextDescription,
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onClick={() => onSuggestionClick?.(suggestion)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = token.colorPrimary;
                                e.currentTarget.style.color = token.colorText;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = token.colorBorder;
                                e.currentTarget.style.color = token.colorTextDescription;
                            }}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                flex: 1,
                overflowY: "auto",
                background: token.colorBgBase,
            }}
        >
            <div
                style={{
                    maxWidth: 800,
                    margin: "0 auto",
                }}
            >
                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        createdAt={message.createdAt}
                    />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default ChatWindow;
