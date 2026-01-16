"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Spin, theme } from "antd";
import Header from "@/components/layout/Header";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

interface Chat {
    id: string;
    title: string;
    messages: Message[];
}

export default function ChatPage() {
    const { token } = theme.useToken();
    const params = useParams();
    const chatId = params.id as string;

    const [chat, setChat] = useState<Chat | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchChat = useCallback(async () => {
        try {
            const response = await fetch(`/api/chats/${chatId}`);
            if (response.ok) {
                const data = await response.json();
                setChat(data);
            }
        } catch (error) {
            console.error("Failed to fetch chat:", error);
        } finally {
            setIsFetching(false);
        }
    }, [chatId]);

    useEffect(() => {
        if (chatId) {
            fetchChat();
        }
    }, [chatId, fetchChat]);

    const handleSendMessage = async (content: string, language: string) => {
        if (!chat) return;

        // Add user message immediately
        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            content,
            createdAt: new Date().toISOString(),
        };
        setChat((prev) =>
            prev ? { ...prev, messages: [...prev.messages, userMessage] } : null
        );
        setIsLoading(true);

        try {
            const response = await fetch(`/api/messages?chatId=${chatId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: { content },
                    language,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response.json();

            // Update chat with bot message
            setChat((prev) =>
                prev
                    ? {
                        ...prev,
                        messages: [
                            ...prev.messages.filter((m) => m.id !== userMessage.id),
                            { ...userMessage, id: `user-${data.message.id}` },
                            {
                                id: data.message.id,
                                role: "assistant",
                                content: data.message.content,
                                createdAt: data.message.createdAt,
                            },
                        ],
                    }
                    : null
            );
        } catch (error) {
            console.error("Error sending message:", error);
            // Remove the temporary user message on error
            setChat((prev) =>
                prev
                    ? {
                        ...prev,
                        messages: prev.messages.filter((m) => m.id !== userMessage.id),
                    }
                    : null
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div
                style={{
                    display: "flex",
                    height: "100vh",
                    background: token.colorBgBase,
                }}
            >
                <ChatSidebar currentChatId={chatId} />
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (!chat) {
        return (
            <div
                style={{
                    display: "flex",
                    height: "100vh",
                    background: token.colorBgBase,
                }}
            >
                <ChatSidebar currentChatId={chatId} />
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: token.colorTextSecondary,
                    }}
                >
                    Không tìm thấy cuộc trò chuyện
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                background: token.colorBgBase,
            }}
        >
            <ChatSidebar currentChatId={chatId} />
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <Header />
                <ChatWindow
                    messages={chat.messages}
                    isLoading={isLoading}
                    onSuggestionClick={(question) => handleSendMessage(question, "vi")}
                />
                <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
}
