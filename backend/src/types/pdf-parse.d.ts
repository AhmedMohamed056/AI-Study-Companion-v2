declare module 'pdf-parse/lib/pdf-parse.js' {
  function pdf(buffer: Buffer): Promise<any>;
  export default pdf;
}
