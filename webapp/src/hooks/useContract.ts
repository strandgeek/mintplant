import { Contract, ethers } from "ethers"
// import { useEthContext } from "react-web3-daisyui/dist/eth"
import ABI from '../abi.json'

export const useContract = () => {
  const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || ''
  const contract = new Contract(contractAddress, ABI, signer)
  return contract
}
