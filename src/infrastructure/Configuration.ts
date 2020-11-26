import { LocalStorage } from "node-localstorage"

export interface Token {
  oauthToken: string
  oauthTokenSecret: string
}

export class Configuration {
  private localStorage: LocalStorage
  constructor() {
    const storagePath = ".flickrcli"
    this.localStorage = new LocalStorage(storagePath)
  }

  setFlickrToken(token: Token) {
    this.localStorage.setItem("token", JSON.stringify(token))
  }

  getFlickrToken(): Token | null {
    const token = this.localStorage.getItem("token")
    if (token)
      return JSON.parse(token) as Token
    else
      return null
  }
}