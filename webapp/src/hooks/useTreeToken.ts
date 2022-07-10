import axios from "axios"
import { useEffect, useState } from "react"
import { TreeToken } from "../types/treeToken"
import { uriToGatewayUrl } from "../utils/web3storage"
import { useContract } from "./useContract"
import { useWeb3 } from "./useWeb3"

export interface UseTreeToken {
  treeToken?: TreeToken
  loading: boolean
}

export const useTreeToken = (tokenId?: number): UseTreeToken => {
  const [loading, setLoading] = useState<boolean>(false)
  const [treeToken, setTreeToken] = useState<TreeToken>()
  const { accountAddress } = useWeb3()
  const contract = useContract()
  useEffect(() => {
    (async () => {
      if (accountAddress && Number.isInteger(tokenId)) {
        setLoading(true)
        const uri = await contract.tokenURI(tokenId)
        const metadataUrl = uriToGatewayUrl(uri)
        const { data } = await axios.get(metadataUrl)
        setTreeToken({
          id: tokenId!,
          imageUrl: uriToGatewayUrl(data.image),
          name: data.name,
          treeSpecies: data.treeSpecies,
        })
        setLoading(false)
      }
    })()
  }, [accountAddress, contract, tokenId])
  if (!Number.isInteger(tokenId)) {
    return { loading }
  }
  return { treeToken, loading }
}
