interface SpotifyArtist {
  external_urls: Record<string, string>,
  id: string,
}

interface SpotifySong {
  id: string,
  artists?: SpotifyArtist[],
  external_urls?: Record<string, string>
}

interface AppleMusicPreview {
  url: string,
}

interface AppleMusicSong {
    artwork: {
      width: number,
      height: number,
      url: string,
      bgColor: string,
      textColor1: string,
      textColor2: string,
      textColor3: string,
      textColor4: string,
    },
    artistName: string,
    url: string,
    discNumber: number,
    previews: AppleMusicPreview[],
}

interface DeezerSong {
  id: number,
  link: string,
  share: string,
  artist: {
    id: number,
    name: string,
    link: string,
    picture: string,
    picture_small: string,
  },
  album: {
    id: number,
    title: string,
    link: string,
    cover: string,
    cover_small: string,
  }
}

export interface AuddIOResponse {
    status: "success" | "error",
    result: {
      artist: string,
      title: string,
      album: string,
      release_date: string,
      label: string,
      timecode: string,
      song_link: string,
      apple_music?: AppleMusicSong,
      spotify?: SpotifySong,
      deezer?: DeezerSong,
    } | null
}
