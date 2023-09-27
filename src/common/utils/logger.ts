export namespace Logger {
    const FgGreen = "\x1b[32m";
    const FgRed = "\x1b[31m";
    const Reset = "\x1b[0m";

    export function log(...args: any[]) {
      console.log(...args);
    }

    export function error(...args: any[]) {
      return console.log(`${FgRed}%s${Reset}`, ...args);
    }

    export function success(...args: any[]) {
      return console.log(`${FgGreen}%s${Reset}`, ...args);
    }
}
