/* eslint-disable no-use-before-define */
export interface ACRCloudMetadataResponse {
    data: Daum[]
  }

export interface Daum {
    name: string
    disc_number: number
    track_number: number
    isrc: string
    genres: string[]
    duration_ms: number
    release_date: string
    artists: Artist[]
    album: Album
    external_metadata: ExternalMetadata
    type: string
    works: Work[]
  }

export interface Artist {
    name: string
  }

export interface Album {
    track_count: number
    upc: string
    release_date: string
    label: string
    cover: string
    covers: Covers
  }

export interface Covers {
    small: string
    medium: string
    large: string
  }

export interface ExternalMetadata {
    applemusic?: Applemusic[]
    deezer?: Deezer[]
    youtube?: Youtube[]
    spotify?: Spotify[]
  }

export interface Applemusic {
    id: string
    link: string
    preview: string
    artists: Artist2[]
    album: Album2
  }

export interface Artist2 {
    id: string
  }

export interface Album2 {
    id: string
    cover: string
  }

export interface Deezer {
    id: string
    link: string
    artists: Artist3[]
    album: Album3
  }

export interface Artist3 {
    id: number
  }

export interface Album3 {
    id: number
    cover: string
  }

export interface Youtube {
    id: string
    link: string
    artists: Artist4[]
    album: Album4
  }

export interface Artist4 {
    id: string
    link: string
  }

export interface Album4 {
    id: string
    link: string
  }

export interface Spotify {
    id: string
    link: string
    preview: string
    artists: Artist5[]
    album: Album5
  }

export interface Artist5 {
    id: string
  }

export interface Album5 {
    id: string
    cover: string
  }

export interface Work {
    iswc: string
    contributors: Contributor[]
    name: string
  }

export interface Contributor {
    name: string
    ipi: number
    roles: string[]
  }
