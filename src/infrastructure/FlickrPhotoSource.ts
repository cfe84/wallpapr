import * as Flickr from "flickr-sdk"
import { AlbumId, PhotoId } from "flickr-sdk";
const parse = require('url').parse;
import * as http from "http"
import fetch from "node-fetch";
import { Configuration, Token } from "./Configuration";

interface Dependencies {
  configuration: Configuration
}

const key = "9d4245967dab4342323f56e5a3729d4e";
const secret = "285ef7f67de72667";

export class FlickrPhotoSource {
  private token: Token | undefined | null
  private authenticated = false
  constructor(private deps: Dependencies) {
  }

  private async authenticateAsync(): Promise<void> {
    this.token = this.deps.configuration.getFlickrToken();
    if (this.token === null) {
      this.token = await this.loginAsync()
      this.deps.configuration.setFlickrToken(this.token)
    }
    this.authenticated = true
  }

  private async loginAsync(): Promise<Token> {
    const listenToAnswer = () => {
      return new Promise((resolve: (verifier: string) => void) => {
        const server = http.createServer((req, res) => {
          var url = parse(req.url, true)
          res.write("You can close that tab now.")
          res.end()
          server.close()
          return resolve(url.query.oauth_verifier as string)
        }).listen(3000)
      })
    }

    const oauth = new Flickr.OAuth(key, secret)
    const res = await oauth.request("http://localhost:3000/")
    const { oauth_token, oauth_token_secret } = res.body
    console.log(`Go to this URL and authorize the application: ${oauth.authorizeUrl(oauth_token, "read")}`)
    const verifier = await listenToAnswer();
    const verifyRes = await oauth.verify(oauth_token, verifier, oauth_token_secret);
    const flickrToken = verifyRes.body;
    const token: Token = {
      oauthToken: flickrToken.oauth_token,
      oauthTokenSecret: flickrToken.oauth_token_secret
    }
    return token
  }

  private async getFlickrAuth(): Promise<any> {
    if (!this.authenticated) {
      await this.authenticateAsync()
    }
    if (!this.token) {
      throw Error("Not authenticated")
    }
    const auth = Flickr.OAuth.createPlugin(
      key,
      secret,
      this.token.oauthToken,
      this.token.oauthTokenSecret
    );
    return auth;
  }

  async listAlbumsAsync(): Promise<Photoset[]> {
    const auth = await this.getFlickrAuth();
    const flickr = new Flickr(auth);
    const res = await flickr.photosets.getList();
    return res.body.photosets.photoset.map(photoset => ({
      id: photoset.id,
      title: photoset.title._content
    }))
  }

  async getPhotosAsync(albumId: AlbumId): Promise<Photo[]> {
    const auth = await this.getFlickrAuth();
    const flickr = new Flickr(auth);
    const res = await flickr.photosets.getPhotos({ photoset_id: albumId, user_id: auth.user_id, extras: "media,tags" });
    const list = res.body.photoset.photo;
    return list
      .filter(photo => photo.media === "photo")
      .filter(photo => photo.tags.indexOf("nowallpapr") < 0)
      .map(photo => ({
        id: photo.id
      }))
  }

  async getPhoto(photoId: PhotoId, minWidth: number): Promise<Buffer> {
    const auth = await this.getFlickrAuth();
    const flickr = new Flickr(auth);
    const res = await flickr.photos.getSizes({ photo_id: photoId });
    const sizes = res.body.sizes.size
      .sort((a, b) => a.width - b.width)
    const matchingSizes = sizes
      .filter(size => size.width >= minWidth || size.height >= minWidth)
    const url = (matchingSizes.length > 0)
      ? matchingSizes[0].source
      : sizes[sizes.length - 1].source
    const photo = await fetch(url)
    const content = await photo.buffer()
    return content
  }

}

export interface Photoset {
  id: string
  title: string
}

export interface Photo {
  id: string
}