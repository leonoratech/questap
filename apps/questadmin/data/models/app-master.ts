import { BaseEntity } from './basemodel';

export interface AppMaster extends BaseEntity {
  college: {
    name: string;
    accreditation: string;
    affiliation: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    contact: {
      phone: string;
      email: string;
      website: string;
    };
    website: string;
    principalName: string;
    description: string;    
  }
}
