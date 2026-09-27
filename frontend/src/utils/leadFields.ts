import { LeadsGetManyOutput } from '../api/types/leads/getMany'

type LeadFieldKey = keyof LeadsGetManyOutput[number]

export interface LeadFieldGroup {
  label: string
  fields: LeadFieldKey[]
}

// Fields available in message templates, grouped for the composer's field picker.
// Adding a field here makes it insertable; the backend must also support it in messageGenerator.ts.
export const LEAD_FIELD_GROUPS: LeadFieldGroup[] = [
  {
    label: 'Contact',
    fields: ['firstName', 'lastName', 'email', 'phoneNumber', 'linkedinUrl'],
  },
  {
    label: 'Company',
    fields: ['companyName', 'jobTitle', 'yearsAtCompany'],
  },
  {
    label: 'Location',
    fields: ['countryCode'],
  },
]
