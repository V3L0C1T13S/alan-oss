export interface MusicIdentiferLink {
    name: string,
    url: string,
}

export interface MusicIdentifierResponse {
    artist: string,
    album?: string,
    artist_url?: string,
    artist_icon?: string,
    artwork_url?: string,
    bg_color?: string,
    release_date?: string,
    title: string,
    timecode?: string,
    links: MusicIdentiferLink[],
    preview_url?: string,
}
