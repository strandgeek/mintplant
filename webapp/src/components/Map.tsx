import GoogleMapReact from "google-map-react";
import React, { FC } from "react";
import treeMapMarkerSrc from '../assets/img/tree-map-marker.svg'
import { MapData, Token } from "../types/mapData";

export interface MapProps {
  mapData: MapData | null
  onClickToken: (token: Token) => void
}

const Marker: FC<{ lat: number, lng: number, text: string, onClick: () => void }>= ({ text, onClick }) => {
  return (
    <div className="tooltip tooltip-primary" data-tip={text} onClick={() => onClick()}>
      <img
        src={treeMapMarkerSrc}
        style={{ width: '32px', height: '32px', cursor: 'pointer' }}
        alt={text}
      />
    </div>
  );
};

export const MapContainer: FC<MapProps> = ({ mapData, onClickToken }) => {
  const tokens = (mapData?.tokens || []) as Token[]
  return (
    <div style={{ width: "100%", height: "calc(100vh - 81px)" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY! }}
        defaultCenter={{
          lat: 0,
          lng: 0,
        }}
        defaultZoom={0}
        yesIWantToUseGoogleMapApiInternals
      >
        {tokens.map(token => (
         <Marker
            key={token.id}
            lat={token?.location?.lat}
            lng={token?.location?.lng}
            text={`#${token.id} -  ${token.name}`}
            onClick={() => onClickToken(token)}
          />
        ))}
      </GoogleMapReact>
    </div>
  );
};

export const Map =  React.memo(MapContainer, (prevPros, nextProps) => prevPros.mapData?.tokens.length === nextProps.mapData?.tokens.length);
