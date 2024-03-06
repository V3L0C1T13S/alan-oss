type AgreementDate = string;

export type Agreement = {
    agreed_at: AgreementDate,
}

export interface DbUser {
    id: string,
    accounts?: {
        discord?: string,
        revolt?: string,
    }
    agreements?: {
        ai_tos?: Agreement,
    },
}

export type FindDbUser = Pick<DbUser, "id">;
export type UpdateDbUser = Partial<DbUser>;
