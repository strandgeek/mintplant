import { ethers } from "ethers";
import { useEffect } from "react";
import ABI from '../abi.json'

interface MapData {
  tokens: any[]
}

export const useMapData = (): MapData => {
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
    contract.mapURI().then(console.log).catch(console.log)
  }, [])
  return {
    tokens: [],
  }
}
