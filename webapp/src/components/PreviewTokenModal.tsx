import React, { FC, useState } from "react";
import { useTreeToken } from "../hooks/useTreeToken";
import ClipLoader from "react-spinners/ClipLoader";
import { Modal, ModalProps } from "./Modal";
import { Token } from "../types/mapData";
import { uriToGatewayUrl } from "../utils/web3storage";
import classNames from "classnames";
import { getTokenExplorerUrl } from "../utils/explorer";

export interface PreviewTokenModalProps
  extends Pick<ModalProps, "open" | "setOpen"> {
  token?: Token | null;
}

export const PreviewTokenModal: FC<PreviewTokenModalProps> = ({
  open,
  setOpen,
  token,
}) => {
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const imgClasses = classNames(
    "w-full h-80 object-cover mb-4",
    {
      'hidden': !imgLoaded,
    }
  )
  return (
    <Modal
      open={open}
      setOpen={(open) => {
        setImgLoaded(false);
        setOpen(open);
      }}
    >
      <img
        alt="Upload Preview"
        className={imgClasses}
        src={token ? uriToGatewayUrl(token?.image) : ""}
        onLoad={() => setImgLoaded(true)}
      />
      {!imgLoaded && (
        <div className="flex items-center justify-center py-24">
          <ClipLoader color="#21A83F" loading={true} size={24} />
        </div>
      )}
      <div className="divider"></div>
      <a
          className="text-primary text-sm"
          href={getTokenExplorerUrl(token?.id)}
          target="_blank"
          rel="noreferrer"
        >
          View on Explorer
        </a>
      <div className="flex items-center mt-4 text-lg font-bold">
        # {token?.id}
      </div>
      <div>
        <strong>Name:</strong> {token?.name}
      </div>
      <div>
        <strong>Species:</strong> {token?.treeSpecies}
      </div>
      <div>
        <strong>Location:</strong> {token?.location.country.name}
      </div>
      <div>
        <strong>Lat/Lng:</strong> {token?.location.lat}, {token?.location.lng}
      </div>
      <div className="divider"></div> 
      <button className="btn btn-ghost btn-outline btn-block" onClick={() => setOpen(false)}>
        Close
      </button>
    </Modal>
  );
};
