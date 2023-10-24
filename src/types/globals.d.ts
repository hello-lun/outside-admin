declare module '*.less';
declare module '*.sass';
declare module '*.pdf';
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__();
  }
}

declare function speak(text: string, options: any): void;
