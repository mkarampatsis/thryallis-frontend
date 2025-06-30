export interface IEquipmentConfig {
  resourceSubcategory: string
  kind: Kind[]
}

export interface Kind {
  name: string
  type: Type[]
}

export interface Type {
  name: string
  itemDescription: string[]
  info?: string[]
}