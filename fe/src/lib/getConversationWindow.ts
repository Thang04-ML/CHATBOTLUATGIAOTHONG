interface Message {
    role: string;
    content: string;
}

/**
 * Gets a window of conversation messages for context
 * @param messages - Array of messages
 * @param windowSize - Number of message pairs to include
 * @returns Subset of messages for context
 */
export function getConversationWindow(
    messages: Message[],
    windowSize: number = 2
): Message[] {
    // Get last N pairs (user + assistant messages)
    const pairCount = windowSize * 2;
    return messages.slice(-pairCount);
}
