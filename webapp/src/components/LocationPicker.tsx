import React, { FC, useState } from "react";
import MapPicker from "react-google-map-picker";
import { Country, reverseGeocode } from "../utils/gmaps";
import { Modal } from "./Modal";

export interface LocationPickerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onChange: (lat: number, lng: number, country: Country) => void;
}



const MemoMap =  React.memo(MapPicker, () => true);

export const LocationPicker: FC<LocationPickerProps> = ({
  open,
  setOpen,
  onChange,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number, country: Country} | null>(null)

  const onChangeLocation = async (lat: number, lng: number) => {
    console.log(lat, lng)
    const country = await reverseGeocode(lat, lng);
    if (!country) {
      setError(
        'Please, select a location in a country'
      );
      setLocation(null)
      return;
    }
    setLocation({
      lat,
      lng,
      country,
    })
    setError(null)
    onChange(lat, lng, country);
  };

  const onConfirm = (e: any) => {
    e.preventDefault()
    if (location) {
      onChange(location.lat, location.lng, location.country)
      setOpen(false)
    }
  }

  return (
    <Modal open={open} setOpen={setOpen}>
      <MemoMap
        zoom={2}
        defaultLocation={{
          lat: location?.lat || 38.272688535980976,
          lng: location?.lng || -7.734375,
        }}
        style={{ width: "100%", height: "500px" }}
        onChangeLocation={(lat, lng) => onChangeLocation(lat, lng)}
        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}
      />
      {error && (
        <div className="alert shadow-lg mt-4">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}
      {location && !error && (
        <div className="text-sm mt-4 flex items-center">
          {location.country.name} <span className="text-xs ml-2">({location.lat}, {location.lng})</span>
        </div>
      )}
      <div className="mt-6 text-right">
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button type="button" className="ml-4 btn btn-outline btn-primary" disabled={!!error} onClick={onConfirm}>
          Select Location
        </button>
      </div>
    </Modal>
  );
};
