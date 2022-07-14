export interface Country {
  name: string;
  code: string;
}

export interface Location {
  lat: number;
  lng: number;
  country: Country;
}

export interface Token {
  id: number;
  location: Location;
  image: string;
  name: string;
  treeSpecies: string;
}

export interface MapData {
  total: number;
  tokens: Token[];
}
