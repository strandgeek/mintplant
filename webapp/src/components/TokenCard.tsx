import React, { FC } from "react";
import { TreeToken } from "../types/treeToken";

export interface TokenCardProps {
  treeToken: TreeToken
}

export const TokenCard: FC<TokenCardProps> = ({ treeToken }) => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <figure>
        <img src={treeToken.imageUrl} alt={treeToken.name} />
      </figure>
      <div className="card-body">
        <div className="text-gray-500 text-sm">#{treeToken.id}</div>
        <h2 className="card-title">{treeToken.name}</h2>
        <div className="text-gray-500 text-sm">{treeToken.treeSpecies}</div>
      </div>
    </div>
  );
};
