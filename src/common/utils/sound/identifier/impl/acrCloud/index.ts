import crypto from "node:crypto";
import {
  BaseMusicIdentifier, NotFoundError, MusicIdentiferLink, MusicIdentifierResponse,
} from "../../model/index.js";
import { ACRCloudMetadataResponse, ACRCloudResponse } from "./types.js";
import {
  acrCloudBearer, acrCloudHost, acrCloudKey, acrCloudSecret,
} from "../../../../../../constants/index.js";

function sign(signString: string, accessSecret: string) {
  return crypto.createHmac("sha1", accessSecret)
    .update(Buffer.from(signString, "utf-8"))
    .digest()
    .toString("base64");
}

function createStringToSign(
  method: string,
  endpoint: string,
  accessKey: string,
  dataType: string,
  signatureVersion: string,
  timestamp: number,
) {
  return [method, endpoint, accessKey, dataType, signatureVersion, timestamp].join("\n");
}

const options = {
  host: acrCloudHost,
  endpoint: "/v1/identify",
  signature_version: "1",
  data_type: "audio",
  secure: true,
  access_key: acrCloudKey,
  access_secret: acrCloudSecret,
};

export class ACRCloudMusicIdentifier extends BaseMusicIdentifier {
  private async fetchInfo(data: Buffer) {
    if (!options.access_key || !options.access_secret || !options.host) {
      throw new Error("You must add ACRCloud ENV variables to use ACRCloud identification.");
    }

    const timestamp = new Date().getTime() / 1000;

    const stringToSign = createStringToSign(
      "POST",
      options.endpoint,
      options.access_key,
      options.data_type,
      options.signature_version,
      timestamp,
    );

    const signature = sign(stringToSign, options.access_secret);

    const form = new FormData();
    form.append("sample", new Blob([data]));
    form.append("sample_bytes", data.length.toString());
    form.append("access_key", options.access_key);
    form.append("data_type", options.data_type);
    form.append("signature_version", options.signature_version);
    form.append("signature", signature);
    form.append("timestamp", timestamp.toString());

    const result = await fetch(`https://${options.host}/${options.endpoint}`, {
      method: "POST",
      body: form,
    });

    const body: ACRCloudResponse = await result.json();

    // Music first, humming second
    const music = body.metadata.music?.[0] ?? body.metadata.humming?.[0];
    if (body.status.msg !== "Success" || !music) throw new Error("Unsuccessful retrieval.");

    const query = JSON.stringify({
      // track: music.title,
      // artists: music.artists.map((x) => x.name),
      acr_id: music.acrid,
    });
    const metadataResult = await fetch(`https://eu-api-v2.acrcloud.com/api/external-metadata/tracks?query=${query}&format=json`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${acrCloudBearer}`,
      },
    });
    const metadata: ACRCloudMetadataResponse = await metadataResult.json();

    return { body, metadata };
  }

  async find(url: string) {
    const musicData = await fetch(url);
    const musicBuffer = Buffer.from(await musicData.arrayBuffer());
    const info = await this.fetchInfo(musicBuffer);
    const result = info.body;
    const { metadata } = info;

    if (result.status.msg !== "Success") throw new Error(`Unsuccessful ACR status: ${result.status.msg}`);

    const music = result.metadata.music?.[0] ?? result.metadata.humming?.[0];
    if (!music) throw new NotFoundError();

    const { title, artists, album } = music;
    const links: MusicIdentiferLink[] = [];

    const { deezer, spotify, youtube } = music.external_metadata;
    if (spotify) {
      links.push({
        name: "Spotify",
        url: `https://open.spotify.com/track/${spotify.track.id}`,
      });
    }
    if (deezer) {
      links.push({
        name: "Deezer",
        url: `https://deezer.com/track${deezer.track.id}`,
      });
    }
    if (youtube) {
      links.push({
        name: "YouTube",
        url: `https://youtu.be/${youtube.vid}`,
      });
    }

    const finalResult: MusicIdentifierResponse = {
      artist: artists.map((artist) => artist.name).join(", "),
      title,
      album: album.name,
      links,
      release_date: music.release_date,
    };
    if (music.duration_ms) finalResult.timecode = music.duration_ms.toString();

    const primaryMetadata = metadata.data[0];

    if (primaryMetadata) {
      const {
        applemusic: appleMusicMetadata,
        spotify: spotifyMetadata,
      } = primaryMetadata.external_metadata;
      const primaryAppleMusicMetadata = appleMusicMetadata?.[0];
      const primarySpotifyMetadata = spotifyMetadata?.[0];

      const artworkUrl = primaryMetadata.album?.cover
        ?? primaryAppleMusicMetadata?.album.cover
        ?? primarySpotifyMetadata?.album.cover;
      const previewUrl = primaryAppleMusicMetadata?.preview
        ?? primarySpotifyMetadata?.preview;

      if (artworkUrl) finalResult.artwork_url = artworkUrl;
      if (previewUrl) finalResult.preview_url = previewUrl;
    }

    return finalResult;
  }
}
