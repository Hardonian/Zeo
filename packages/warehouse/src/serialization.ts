/** Streaming JSON-lines serialization for large warehouse batches. */
export class RecordSerializationError extends Error {
  constructor(public readonly line: number, message: string) { super(`Invalid JSON-lines record at line ${line}: ${message}`); }
}

export async function* serializeJsonLines<T>(records: Iterable<T> | AsyncIterable<T>): AsyncGenerator<Uint8Array> {
  const encoder = new TextEncoder();
  for await (const record of records) yield encoder.encode(`${JSON.stringify(record)}\n`);
}

export async function* deserializeJsonLines<T>(chunks: AsyncIterable<string | Uint8Array>): AsyncGenerator<T> {
  const decoder = new TextDecoder();
  let remainder = '';
  let line = 0;
  for await (const chunk of chunks) {
    remainder += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
    let newline = remainder.indexOf('\n');
    while (newline >= 0) {
      const source = remainder.slice(0, newline).trim();
      remainder = remainder.slice(newline + 1);
      line += 1;
      if (source) {
        try { yield JSON.parse(source) as T; }
        catch (error) { throw new RecordSerializationError(line, error instanceof Error ? error.message : String(error)); }
      }
      newline = remainder.indexOf('\n');
    }
  }
  remainder += decoder.decode();
  if (remainder.trim()) {
    line += 1;
    try { yield JSON.parse(remainder) as T; }
    catch (error) { throw new RecordSerializationError(line, error instanceof Error ? error.message : String(error)); }
  }
}
