import strainsData from "./strains.json";

export type Strain = {
  code: string;
  sequencingIdentified: string;
  sequencingType: string;
  sequencingCompany: string;
  sequenceText: string;
  phylum: string;
  className: string;
  order: string;
  family: string;
  genus: string;
  crop: string;
  sourcePart: string;
  collectionLocation: string;
  isolationDate: string;
  medium: string;
  temperature: string;
  storageCondition: string;
  freezerNumber: string;
  originalFreezerNumber: string;
  storageLocation: string;
  owner: string;
  hasPatent: string;
  patentName: string;
  hasPaper: string;
  paperName: string;
};

export const strains = strainsData as Strain[];

export function getStrainByCode(code: string) {
  return strains.find(
    (strain) => strain.code.toLowerCase() === code.toLowerCase(),
  );
}
