/** Lets TypeScript accept `import logo from '@assets/images/logo.png'` (Metro resolves these to a numeric asset id at runtime). */
declare module '*.png' {
  const value: number;
  export default value;
}

declare module '*.jpg' {
  const value: number;
  export default value;
}

declare module '*.jpeg' {
  const value: number;
  export default value;
}
