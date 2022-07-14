import axios from "axios";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import ABI from '../abi.json'
import { MapData } from "../types/mapData";
import { uriToGatewayUrl } from "../utils/web3storage";

export const useMapData = (): MapData | null => {
  const [mapData, setMapData] = useState<MapData | null>(null)
  useEffect(() => {
    const provider = new ethers.providers.StaticJsonRpcProvider(
      process.env.REACT_APP_RINKEBY_RPC_URL, 
      {
        chainId: 4,
        name: 'Rinkeby',
      }
    );
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS!
    const contract = new ethers.Contract(contractAddress, ABI, provider)
    contract.mapURI().then(async (uri: string) => {
      const { data } = await axios.get(uriToGatewayUrl(uri))
      setMapData(data as MapData)
    }).catch(console.log)
  }, [])
  return mapData
}
