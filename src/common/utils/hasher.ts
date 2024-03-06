import crypto from "node:crypto";

/**
 * @summary Hash-based cache
*/
export class HashCache<T> {
  private items = new Map<string, T>();

  private generateHash(buffer: Buffer) {
    const hash = crypto.createHash("md5");
    const data = hash.update(buffer.toString("base64"), "base64");
    return data.digest("hex");
  }

  getItem(input: string | Buffer) {
    if (Buffer.isBuffer(input)) return this.items.get(this.generateHash(input));
    return this.items.get(input);
  }

  addItem(input: string | Buffer, data: T) {
    if (Buffer.isBuffer(input)) this.items.set(this.generateHash(input), data);
    else this.items.set(input, data);
  }
}
