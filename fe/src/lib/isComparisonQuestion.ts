/**
 * Detects if a question is asking for comparison between topics
 */
export function isComparisonQuestion(content: string): boolean {
    const comparisonPatterns = [
        /so sánh/i,
        /khác nhau/i,
        /giống nhau/i,
        /so với/i,
        /và.*khác gì/i,
        /compare/i,
        /difference/i,
        /vs\b/i,
        /versus/i,
    ];

    return comparisonPatterns.some((pattern) => pattern.test(content));
}
