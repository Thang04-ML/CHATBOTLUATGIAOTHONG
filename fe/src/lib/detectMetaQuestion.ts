/**
 * Detects if a user question is a meta-question
 * (asking about the previous answer, confirmation, etc.)
 */
export function isMetaQuestion(content: string): boolean {
    const metaPatterns = [
        /có đúng không/i,
        /có chính xác không/i,
        /bạn có chắc không/i,
        /bạn chắc chứ/i,
        /xác nhận/i,
        /đúng vậy không/i,
        /thật không/i,
        /có thật không/i,
        /nghiêm túc không/i,
        /are you sure/i,
        /is that correct/i,
        /confirm/i,
    ];

    return metaPatterns.some((pattern) => pattern.test(content));
}
