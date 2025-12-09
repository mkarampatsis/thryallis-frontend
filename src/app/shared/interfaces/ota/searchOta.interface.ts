export interface ISearchOTA_Output {
  score: number
  object_id: string
  remitText: string
  remitType: string
  remitLocalOrGlobal: string
  remitCompetence: string
  publicPolicyAgency_organization: string
  publicPolicyAgency_organizationType: string
}

export interface ISearchOTA_Input {
  otas: Otas
}

export interface Otas {
  must: Must[]
}

export interface Must {
  field: string
  type: string
  query: string
}