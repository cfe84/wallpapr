import { LocalStorage } from "node-localstorage"

export interface Token {
  oauthToken: string
  oauthTokenSecret: string
}

export class Configuration {
  private localStorage: LocalStorage
  constructor() {
    const storagePath = ".flickrcli";
    this.localStorage = new LocalStorage(storagePath);
  }

  setToken(token: Token) {
    this.localStorage.setItem("token", JSON.stringify(token));
  }

  getToken() {
    return JSON.parse(this.localStorage.getItem("token"));
  }
}