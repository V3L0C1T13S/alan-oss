/* eslint-disable no-console */
export namespace Logger {
    const FgGreen = "\x1b[32m";
    const FgYellow = "\x1b[33m";
    const FgRed = "\x1b[31m";
    const Reset = "\x1b[0m";

    export function log(...args: any[]) {
      console.log(...args);
    }

    export function debug(...args: any[]) {
      console.debug(...args);
    }

    export function warn(...args: any[]) {
      console.warn(`${FgYellow}%s${Reset}`, ...args);
    }

    export function info(...args: any[]) {
      return console.log(`${FgGreen}%s${Reset}`, ...args);
    }

    export function error(...args: any[]) {
      return console.error(`${FgRed}%s${Reset}`, ...args);
    }

    export function success(...args: any[]) {
      return console.log(`${FgGreen}%s${Reset}`, ...args);
    }
}
