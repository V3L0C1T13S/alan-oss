export interface DbUser {
    id: string,
    accounts?: {
        discord?: string,
        revolt?: string,
    }
    accepted_ai_tos?: boolean,
}

export type FindDbUser = Pick<DbUser, "id">;
export type UpdateDbUser = Partial<DbUser>;
