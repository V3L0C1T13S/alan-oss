export interface TagData {
    name: string,
    author: string,
    content: string,
}

export type FindTagData = Pick<TagData, "name" | "author">

export type EditTagData = Partial<TagData>;
