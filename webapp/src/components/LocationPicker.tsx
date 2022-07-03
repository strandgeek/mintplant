import React, { FC, useState } from 'react'
import MapPicker from "react-google-map-picker";
import { Modal } from './Modal';


export interface LocationPickerProps {
  open: boolean
  setOpen: (open: boolean) => void
  onChange: (lat: number, lng: number) => void
}

const DefaultLocation = { lat: 10, lng: 106 };
const DefaultZoom = 10;

export const LocationPicker: FC<LocationPickerProps> = ({
  open,
  setOpen,
  onChange,
}) => {
  return (
    <Modal open={open} setOpen={setOpen}>
        <MapPicker
          defaultLocation={{
            lat: 0,
            lng: 0,
          }}
          zoom={2}
          style={{ width: '100%', height: '600px' }}
          onChangeLocation={onChange}
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}
        />
    </Modal>
  );
}

