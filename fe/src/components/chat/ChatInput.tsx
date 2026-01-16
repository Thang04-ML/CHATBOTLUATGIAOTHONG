"use client";

import React, { useState, KeyboardEvent } from "react";
import { Input, Button, Select, theme } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;

interface ChatInputProps {
    onSend: (message: string, language: string) => void;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
    const { token } = theme.useToken();
    const [message, setMessage] = useState("");
    const [language, setLanguage] = useState("vi");

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim(), language);
            setMessage("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            style={{
                padding: "16px 24px",
                borderTop: `1px solid ${token.colorBorder}`,
                background: token.colorBgBase,
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-end",
                    maxWidth: 800,
                    margin: "0 auto",
                }}
            >
                <Select
                    value={language}
                    onChange={setLanguage}
                    style={{ width: 90 }}
                    options={[
                        { value: "vi", label: "🇻🇳 VI" },
                        { value: "en", label: "🇺🇸 EN" },
                    ]}
                />
                <TextArea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi của bạn về luật giao thông..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    disabled={disabled}
                    style={{
                        flex: 1,
                        background: token.colorBgContainer,
                        border: `1px solid ${token.colorBorder}`,
                        borderRadius: 12,
                        color: token.colorText,
                        fontSize: 14,
                        resize: "none",
                    }}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    style={{
                        height: 40,
                        width: 40,
                        background: message.trim() && !disabled ? token.colorPrimary : token.colorFillSecondary,
                        color: message.trim() && !disabled ? token.colorBgBase : token.colorTextDisabled,
                        border: "none",
                        borderRadius: 10,
                    }}
                />
            </div>
            <p
                style={{
                    textAlign: "center",
                    fontSize: 11,
                    color: token.colorTextSecondary,
                    marginTop: 12,
                    marginBottom: 0,
                }}
            >
                Trợ lý AI tư vấn luật giao thông Việt Nam • Nhấn Enter để gửi, Shift+Enter để xuống dòng
            </p>
        </div>
    );
};

export default ChatInput;
