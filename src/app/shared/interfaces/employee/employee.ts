export interface IQualification {
  qualification: string;
  qualificationTitle: string;
  qualificationOrganization: string;
  date: string | null;  // ISO date string or null
  file?: string | null; // file name or path (optional)
}

export interface IEmployee {
  id?: string;  // optional because it's assigned by MongoDB
  organization: string;
  organizationCode: string;
  code: string;
  firstname?: string;
  lastname: string;
  fathername: string;
  mothername: string;
  identity: string;
  birthday?: string | null;  // ISO date string or null
  // sex?: 'Male' | 'Female';
  sex: string;
  dateAppointment?: string | null;
  workStatus?: string;
  workCategory?: string;
  workSector?: string;
  organizationalUnit?: string;
  building?: string;
  office?: string;
  phoneWork?: string;
  emailWork?: string;
  finalized: boolean;
  qualifications: IQualification[];
}