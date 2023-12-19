export type GenerateMediaResult = {
    data?: Buffer,
    url?: string,
}

export type GenerateImageResult = GenerateMediaResult
export type GenerateVideoResult = GenerateMediaResult
export type GenerateMusicResult = GenerateMediaResult

export type GenerateImageParams = {
    prompt: string
}

export type GenerateVideoParams = {
    inputImageURL: string
}

export type GenerateMusicParams = {
    prompt: string,
}
