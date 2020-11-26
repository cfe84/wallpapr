declare module "node-localstorage" {
  export class LocalStorage {
    constructor(filePath: string)
    setItem(key: string, value: string): void
    getItem(key: string): string
  }
}