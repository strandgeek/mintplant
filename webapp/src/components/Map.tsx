import GoogleMapReact from 'google-map-react'
import React, { FC } from 'react'

export interface MapProps {
  
}

export const Map: FC<MapProps> = (props) => {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 81px)'}}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY! }}
        defaultCenter={{
          lat: 0,
          lng: 0
        }}
        defaultZoom={0}
        yesIWantToUseGoogleMapApiInternals
      >
      </GoogleMapReact>
    </div>
  )
}
