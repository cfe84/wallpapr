import * as Flickr from "flickr-sdk"
const parse = require('url').parse;
import * as http from "http"
import { Configuration } from "./Configuration";

interface Dependencies {
  configuration: Configuration
}

const key = "9d4245967dab4342323f56e5a3729d4e";
const secret = "285ef7f67de72667";

class FlickrAdapter {
  constructor(private deps: Dependencies) {
  }

  getFlickrAuth() {
    const token = this.deps.configuration.getToken();
    const auth = Flickr.OAuth.createPlugin(
      key,
      secret,
      token.oauth_token,
      token.oauth_token_secret
    );
    return auth;
  }

  async login() {
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
    const token = verifyRes.body;
    return token;
  }

  // async listAlbums() {
  //   const generateFieldFlattener = (field) => (entry) => {
  //     entry[field] = entry[field]["_content"];
  //     return entry;
  //   };
  //   const auth = this.getFlickrAuth();
  //   const flickr = new Flickr(auth);
  //   const res = await flickr.photosets.getList();
  //   const list = res.body.photosets.photoset;
  //   const flattenedList = list
  //     .map(generateFieldFlattener("title"))
  //     .map(generateFieldFlattener("description"));
  //   return flattenedList;
  // }

  // async getAlbumContent(albumId) {
  //   const generateFieldFlattener = (field) => (entry) => {
  //     entry[field] = entry[field]["_content"];
  //     return entry;
  //   };
  //   const auth = this.getFlickrAuth();
  //   const flickr = new Flickr(auth);
  //   const res = await flickr.photosets.getPhotos({ photoset_id: albumId, user_id: auth.user_id });
  //   const list = res.body.photoset.photo;
  //   const flattenedList = list;
  //   return flattenedList;
  // }

}

module.exports = FlickrAdapter;