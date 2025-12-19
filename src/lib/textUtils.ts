/**
 * Utilitários para processamento e otimização de texto
 * Usado para compactar cláusulas de contratos e outros textos longos
 */

/**
 * Remove espaços em branco desnecessários e normaliza quebras de linha
 */
export function compactText(text: string): string {
  if (!text) return '';
  
  return text
    // Remove espaços múltiplos
    .replace(/[ \t]+/g, ' ')
    // Remove espaços no início e fim de cada linha
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove mais de 2 quebras de linha consecutivas
    .replace(/\n{3,}/g, '\n\n')
    // Remove espaços no início e fim
    .trim();
}

/**
 * Estima o tamanho em bytes de uma string UTF-8
 */
export function estimateByteSize(text: string): number {
  return new Blob([text]).size;
}

/**
 * Formata tamanho em bytes para exibição
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compacta um array de cláusulas de contrato
 */
export function compactClauses(clauses: Array<{ title: string; content: string; sort_order: number }>): Array<{ title: string; content: string; sort_order: number }> {
  return clauses.map(clause => ({
    ...clause,
    title: compactText(clause.title),
    content: compactText(clause.content)
  }));
}

/**
 * Verifica se um texto excede o limite de caracteres
 */
export function exceedsLimit(text: string, maxChars: number = 10000): boolean {
  return text.length > maxChars;
}

/**
 * Trunca texto mantendo palavras completas
 */
export function truncateText(text: string, maxChars: number = 10000): string {
  if (text.length <= maxChars) return text;
  
  const truncated = text.substring(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}
