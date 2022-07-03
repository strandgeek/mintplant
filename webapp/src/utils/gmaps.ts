import axios from "axios"

export interface Country {
  name: string
  code: string
}

export const reverseGeocode = async (lat: number, lng: number): Promise<Country | null> => {
  const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: {
      latlng: `${lat},${lng}`,
      result_type: 'country',
      key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    }
  })
  const { results } = data;
  const res = results.length > 0 ? results[results.length - 1] : null
  if (!res) {
    return null
  }

  return {
    name: res.address_components[0].long_name,
    code: res.address_components[0].short_name,
  }
}
