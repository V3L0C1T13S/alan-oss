export { ACRCloudMetadataResponse } from "./metadata.js";

export type Music = {
    external_ids: {
      isrc: string;
      upc: string;
    };
    external_metadata: {
        deezer: {
            track: {
                name: string,
                id: string,
            },
            artists: unknown[],
        },
        spotify: {
            track: {
                name: string,
                id: string,
            },
            album: {
                name: string,
                id: string,
            }
        },
        youtube: {
            vid: string,
        }
    },
    sample_begin_time_offset_ms: string;
    label: string;
    play_offset_ms: number;
    artists: {
      name: string;
    }[];
    release_date: string;
    title: string;
    db_end_time_offset_ms: string;
    duration_ms?: number;
    album: {
      name: string;
    };
    acrid: string;
    result_from: number;
    db_begin_time_offset_ms: string;
    score: number;
  };
export type ACRCloudResponse = {
    status: {
      msg: string;
      code: number;
      version: string;
    };
    metadata: {
      played_duration: number;
      music: Music[];
      humming: Music[];
      timestamp_utc: string;
    };
    result_type: number;
    sample_end_time_offset_ms: string;
  };
