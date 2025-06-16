export interface IEquipmentConfig {
  type: string
  kind: Kind[]
}

export interface Kind {
  type: string
  category: string[]
  values: Value[]
}

export interface Value {
  category: string
  values: string[]
}