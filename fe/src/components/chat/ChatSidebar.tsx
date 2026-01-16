"use client";

import React, { useEffect, useState } from "react";
import { Button, Popconfirm, message, Spin, theme } from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    MessageOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface Chat {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

interface ChatSidebarProps {
    currentChatId?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ currentChatId }) => {
    const { token } = theme.useToken();
    const router = useRouter();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    const fetchChats = async () => {
        try {
            const response = await fetch("/api/chats");
            if (response.ok) {
                const data = await response.json();
                setChats(data);
            }
        } catch (error) {
            console.error("Failed to fetch chats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, [currentChatId]);

    const handleNewChat = () => {
        router.push("/");
    };

    const handleSelectChat = (chatId: string) => {
        router.push(`/chat/${chatId}`);
    };

    const handleDeleteChat = async (chatId: string) => {
        try {
            const response = await fetch(`/api/chats/${chatId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                messageApi.success("Đã xóa cuộc trò chuyện");
                if (chatId === currentChatId) {
                    router.push("/");
                }
                fetchChats();
            }
        } catch (error) {
            messageApi.error("Không thể xóa cuộc trò chuyện");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div
            style={{
                width: 280,
                height: "100vh",
                background: token.colorBgBase,
                borderRight: `1px solid ${token.colorBorder}`,
                display: "flex",
                flexDirection: "column",
                padding: "16px",
            }}
        >
            {contextHolder}
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleNewChat}
                style={{
                    marginBottom: 16,
                    background: "#ffffff",
                    color: "#000000",
                    border: "none",
                    height: 44,
                    fontWeight: 600,
                }}
                block
            >
                Cuộc trò chuyện mới
            </Button>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                {loading ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                        <Spin />
                    </div>
                ) : (
                    chats.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
                            Chưa có cuộc trò chuyện nào
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => handleSelectChat(chat.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px",
                                    marginBottom: 8,
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    background:
                                        chat.id === currentChatId ? token.colorFillTertiary : "transparent",
                                    border:
                                        chat.id === currentChatId
                                            ? `1px solid ${token.colorBorder}`
                                            : "1px solid transparent",
                                    transition: "all 0.2s",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        flex: 1,
                                        overflow: "hidden",
                                    }}
                                >
                                    <MessageOutlined
                                        style={{
                                            fontSize: 18,
                                            color: token.colorTextSecondary,
                                            marginRight: 12,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <div style={{ overflow: "hidden" }}>
                                        <div
                                            style={{
                                                color: token.colorText,
                                                fontSize: 14,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {chat.title}
                                        </div>
                                        <div style={{ color: token.colorTextSecondary, fontSize: 12 }}>
                                            {formatDate(chat.updatedAt)}
                                        </div>
                                    </div>
                                </div>
                                <Popconfirm
                                    title="Xóa cuộc trò chuyện này?"
                                    onConfirm={(e) => {
                                        e?.stopPropagation();
                                        handleDeleteChat(chat.id);
                                    }}
                                    onCancel={(e) => e?.stopPropagation()}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <Button
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ color: "#666" }}
                                    />
                                </Popconfirm>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
