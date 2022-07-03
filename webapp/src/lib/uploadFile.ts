import { Web3File, Web3Storage } from 'web3.storage'

// @ts-ignore
const client = new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_TOKEN })

export const uploadWeb3Files = async (inputFiles: FileList | File[]): Promise<Web3File[]>=> {
  const rootCid = await client.put(inputFiles)
  const res = await client.get(rootCid)
  const info = await client.status(rootCid)
  if (!res) {
    throw new Error('Could retrieve rootCid')
  }
  const files = await res.files()
  return files
}
