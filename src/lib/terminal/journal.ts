export interface TranscriptEntry { id: number; text: string; kind: 'command' | 'output' | 'error' }
export function appendTranscript(entries: TranscriptEntry[], entry: TranscriptEntry): TranscriptEntry[] {
  const bounded = entry.text.length > 180000 ? { ...entry, text: `${entry.text.slice(0, 180000)}\n… [180000 character output limit]` } : entry;
  const result = [...entries, bounded].slice(-200);
  let characters = result.reduce((total, row) => total + row.text.length, 0);
  while (characters > 200000 && result.length > 1) characters -= result.shift()!.text.length;
  return result;
}
export function addHistory(history: string[], line: string): string[] {
  return history.at(-1) === line ? history : [...history, line].slice(-100);
}
