import path from "node:path";
import process from "node:process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { BaseMusicIdentifier, NotFoundError } from "../../model/index.js";
import { MusicIdentifierResponse } from "../../model/types.js";
import { auddIOToken } from "../../../../../../constants/index.js";
import { AuddIOResponse } from "./types.js";

const cacheDir = path.join(process.cwd(), "data");
const cacheFile = path.join(cacheDir, "auddio_cache.json");
const cacheData = JSON.parse(await readFile(cacheFile, "utf-8").catch(() => "{}"));

if (!existsSync(cacheDir)) await mkdir(cacheDir);

export class AuddIOMusicIdentifier extends BaseMusicIdentifier {
  private cache: Record<string, AuddIOResponse> = cacheData;

  private async fetchAudioInfo(url: string) {
    let response = this.cache[url];
    if (!response) {
      const freshResponse = await fetch("https://api.audd.io", {
        method: "POST",
        body: JSON.stringify({
          url,
          return: "apple_music,spotify,deezer",
          api_token: auddIOToken,
        }),
      });
      const body = await freshResponse.json() as AuddIOResponse;
      response = body;
      this.cache[url] = response;
      await writeFile(cacheFile, Buffer.from(JSON.stringify(this.cache)));
    }

    return response;
  }

  async find(url: string) {
    const body = await this.fetchAudioInfo(url);
    const { result } = body;
    if (!result || body.status !== "success") throw new NotFoundError();

    const artworkURL = result.apple_music?.artwork.url
      .replaceAll("{w}", "256")
      .replaceAll("{h}", "256") ?? result.deezer?.album.cover;

    const bgColor = result.apple_music?.artwork.bgColor;
    const artistURL = result.spotify?.artists?.[0]?.external_urls?.spotify
      ?? result.deezer?.artist.link;
    const artistIcon = result.deezer?.artist.picture_small;
    const previewURL = result.apple_music?.previews?.[0]?.url;

    const links = [{
      name: "lis.tn",
      url: result.song_link,
    }];
    if (result.apple_music?.url) {
      links.push({
        name: "Apple Music",
        url: result.apple_music.url,
      });
    }
    if (result.spotify?.external_urls?.spotify) {
      links.push({
        name: "Spotify",
        url: result.spotify.external_urls.spotify,
      });
    }
    if (result.deezer?.link) {
      links.push({
        name: "Deezer",
        url: result.deezer.link,
      });
    }

    const finalResponse: MusicIdentifierResponse = {
      artist: result.artist,
      album: result.album,
      release_date: result.release_date,
      title: result.title,
      timecode: result.timecode,
      links,
    };

    if (artworkURL) finalResponse.artwork_url = artworkURL;
    if (artistURL) finalResponse.artist_url = artistURL;
    if (artistIcon) finalResponse.artist_icon = artistIcon;
    if (bgColor) finalResponse.bg_color = bgColor;
    if (previewURL) finalResponse.preview_url = previewURL;

    return finalResponse;
  }
}
