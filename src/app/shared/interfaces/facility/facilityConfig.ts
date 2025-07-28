export interface IFacilityConfig {
  _id?: string;
  type: string
  spaces: Space[]
}

export interface Space {
  type: string
  spaces: string[]
}