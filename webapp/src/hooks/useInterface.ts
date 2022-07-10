import { ethers } from "ethers"
import ABI from '../abi.json'

export const useInterface = () => {
  return new ethers.utils.Interface(ABI);
}
