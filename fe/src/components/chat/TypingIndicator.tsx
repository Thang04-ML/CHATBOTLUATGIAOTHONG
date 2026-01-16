"use client";

import React from "react";
import { theme } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const TypingIndicator: React.FC = () => {
    const { token } = theme.useToken();

    return (
        <div
            style={{
                display: "flex",
                gap: 12,
                padding: "16px 24px",
            }}
        >
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: token.colorBgLayout,
                    color: token.colorText,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${token.colorBorder}`,
                }}
            >
                <div className="loading-spinner">
                    <LoadingOutlined style={{ fontSize: 18 }} />
                </div>
            </div>
            <div
                style={{
                    background: token.colorBgLayout,
                    padding: "12px 16px",
                    borderRadius: "16px 16px 16px 4px",
                    border: `1px solid ${token.colorBorderSecondary}`,
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                }}
            >
                <span className="typing-dot" style={{ animationDelay: "0ms", background: token.colorTextDescription }} />
                <span className="typing-dot" style={{ animationDelay: "150ms", background: token.colorTextDescription }} />
                <span className="typing-dot" style={{ animationDelay: "300ms", background: token.colorTextDescription }} />
                <style jsx>{`
          .typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
          }
          @keyframes typing {
            0%,
            60%,
            100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-6px);
              opacity: 1;
            }
          }
        `}</style>
            </div>
        </div>
    );
};

export default TypingIndicator;
