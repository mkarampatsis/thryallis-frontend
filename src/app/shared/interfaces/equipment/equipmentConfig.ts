export interface IEquipmentConfig {
  type: string
  kind: Kind[]
}

export interface Kind {
  type: string
  category: Category[]
}

export interface Category {
  type: string
  values: string[]
  info?: string[]
}