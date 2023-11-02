export interface DbUser {
    id: string,
    accounts?: {
        discord?: string,
        revolt?: string,
    }
}

export type FindDbUser = Pick<DbUser, "id">;
