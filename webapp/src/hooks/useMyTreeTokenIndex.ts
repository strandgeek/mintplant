import { useEffect, useState } from "react"
import { TreeToken } from "../types/treeToken"
import { useContract } from "./useContract"
import { useTreeToken } from "./useTreeToken"
import { useWeb3 } from "./useWeb3"

export interface UseTreeToken {
  treeToken?: TreeToken
  loading: boolean
}

export const useMyTreeTokenIndex = (index?: number): UseTreeToken => {
  const contract = useContract()
  const { accountAddress } = useWeb3()
  const [tokenId, setTokenId] = useState<number>()
  useEffect(() => {
    (async () => {
      if (accountAddress && Number.isInteger(index)) {
        const tokenId = await contract.tokenOfOwnerByIndex(accountAddress, index)
        setTokenId(tokenId.toNumber())
      }
    })()
  }, [accountAddress, contract, index])
  return useTreeToken(tokenId)
}
