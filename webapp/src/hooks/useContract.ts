import { Contract, ethers } from "ethers"
// import { useEthContext } from "react-web3-daisyui/dist/eth"
import ABI from '../abi.json'
import { useWeb3 } from "./useWeb3"

export const useContract = () => {
  const { signer } = useWeb3()
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || ''
  const contract = new Contract(contractAddress, ABI, signer)
  return contract
}
