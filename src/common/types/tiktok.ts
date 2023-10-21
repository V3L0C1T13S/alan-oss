export interface TiktokSpeaker {
    name: string,
    code: string,
    lang: string,
}

export interface TiktokVoiceTable {
    speakers: TiktokSpeaker[],
}
