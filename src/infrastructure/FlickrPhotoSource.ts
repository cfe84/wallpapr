import * as Flickr from "flickr-sdk"
import { AlbumId, PhotoId } from "flickr-sdk";
//const Flickr = require("flickr-sdk") as FlickrType
const parse = require('url').parse;
import * as http from "http"
import { Configuration, Token } from "./Configuration";

interface Dependencies {
  configuration: Configuration
}

const key = "9d4245967dab4342323f56e5a3729d4e";
const secret = "285ef7f67de72667";

export class FlickrPhotoSource {
  private token: Token | undefined | null
  constructor(private deps: Dependencies) {
  }

  public async authenticateAsync(): Promise<void> {
    this.token = this.deps.configuration.getFlickrToken();
    if (this.token === null) {
      this.token = await this.loginAsync()
      this.deps.configuration.setFlickrToken(this.token)
    }
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

  private getFlickrAuth() {
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

  async listAlbums(): Promise<Photoset[]> {
    const auth = this.getFlickrAuth();
    const flickr = new Flickr(auth);
    const res = await flickr.photosets.getList();
    return res.body.photosets.photoset.map(photoset => ({
      id: photoset.id,
      title: photoset.title._content
    }))
  }

  async getPhotosAsync(albumId: AlbumId): Promise<Photo[]> {
    const auth = this.getFlickrAuth();
    const flickr = new Flickr(auth);
    const res = await flickr.photosets.getPhotos({ photoset_id: albumId, user_id: auth.user_id });
    const list = res.body.photoset.photo;
    return list.map(photo => ({
      id: photo.id
    }))
  }

  async getPhotoUrl(photoId: PhotoId, minWidth: number) {
    const auth = this.getFlickrAuth();
    const flickr = new Flickr(auth);
    const res = await flickr.photos.getSizes({ photo_id: photoId });
    const sizes = res.body.sizes.size.sort((a, b) => a.width - b.width)
    const matchingSizes = sizes.filter(size => size.width >= minWidth || size.height >= minWidth)
    if (matchingSizes.length > 0) {
      return matchingSizes[0].source
    } else {
      return sizes[sizes.length - 1].source
    }
  }

}

export interface Photoset {
  id: string
  title: string
}

export interface Photo {
  id: string
}