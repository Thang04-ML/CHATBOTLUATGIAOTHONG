import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { promptMessageSchema } from "@/schemas/message";
import { isMetaQuestion } from "@/lib/detectMetaQuestion";
import { isComparisonQuestion } from "@/lib/isComparisonQuestion";
import { getConversationWindow } from "@/lib/getConversationWindow";

// Force dynamic rendering to avoid build-time database connection
export const dynamic = "force-dynamic";

interface MessageData {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    chatId: string;
}

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const chatId = url.searchParams.get("chatId");
        const { message, language = "vi" } = await req.json();

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Validate message
        const validatedMessage = promptMessageSchema.parse(message);

        // 2. Get or create chat
        const chat = chatId
            ? await prisma.chat.findUnique({
                where: { id: chatId },
                include: { messages: true },
            })
            : await prisma.chat.create({
                data: {
                    userId,
                    title: validatedMessage.content.slice(0, 50),
                },
                include: { messages: true },
            });

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        // 3. Save user message
        const userMessage = await prisma.message.create({
            data: {
                chatId: chat.id,
                role: "user",
                content: validatedMessage.content,
            },
        });

        // 4. Detect meta-question
        const isMeta = isMetaQuestion(validatedMessage.content);

        if (isMeta) {
            // Return confirmation answer without calling backend
            const confirmAnswer = `
Bạn đang yêu cầu xác nhận hoặc làm rõ câu trả lời trước đó.

Tôi xin xác nhận rằng:
- Câu trả lời trên được xây dựng dựa trên các ngữ cảnh pháp lý mà hệ thống đã truy xuất.
- Tôi không sử dụng kiến thức bên ngoài dữ liệu được cung cấp.
- Tôi KHÔNG bổ sung, sửa đổi hoặc diễn giải thêm nội dung pháp lý ngoài câu trả lời đã nêu.

Nếu bạn cho rằng câu trả lời chưa chính xác, bạn có thể:
- Chỉ rõ nội dung cần kiểm tra lại
- Hoặc đặt lại câu hỏi với tình huống cụ thể hơn
      `.trim();

            const botMessage = await prisma.message.create({
                data: {
                    chatId: chat.id,
                    role: "assistant",
                    content: confirmAnswer,
                },
            });

            return NextResponse.json({
                chatId: chat.id,
                message: botMessage,
            });
        }

        // 5. Prepare context for RAG
        const isComparison = isComparisonQuestion(validatedMessage.content);
        const allMessages = [
            ...chat.messages.map((m: { role: string; content: string }) => ({
                role: m.role,
                content: m.content,
            })),
            {
                role: "user" as const,
                content: userMessage.content,
            },
        ];

        const contextMessages = isComparison
            ? allMessages.slice(-15) // Thêm nhiều hơn cho so sánh
            : allMessages.slice(-11); // Tối thiểu 5 cặp câu hỏi - trả lời + câu hỏi hiện tại

        // 6. Call backend API
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${backendUrl}/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: contextMessages,
                language,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch from chatbot API");
        }

        const { answer } = await response.json();

        // 7. Save bot response
        const botMessage = await prisma.message.create({
            data: {
                chatId: chat.id,
                role: "assistant",
                content: answer,
            },
        });

        // Update chat's updatedAt
        await prisma.chat.update({
            where: { id: chat.id },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({
            chatId: chat.id,
            message: botMessage,
        });
    } catch (error) {
        console.error("POST /api/messages error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
