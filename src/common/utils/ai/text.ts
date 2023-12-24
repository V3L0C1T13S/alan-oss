export namespace AIUtils {
  export function replaceVariables(target: string, vars: {
      username?: string | undefined,
    }) {
    let result = target;
    if (vars.username) {
      result = result.replaceAll("{{user}}", vars.username);
    }

    return result;
  }
}
