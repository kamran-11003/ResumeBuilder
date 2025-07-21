declare module 'stream-to-buffer' {
  function streamToBuffer(
    stream: NodeJS.ReadableStream,
    callback: (err: Error | null, buffer: Buffer) => void
  ): void;
  export = streamToBuffer;
} 