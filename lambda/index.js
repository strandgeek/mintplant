const { Web3File, Web3Storage } = require('web3.storage')
const { File, Blob } = require('web-file-polyfill')
const axios = require('axios')
const ethers = require('ethers')
const { ABI } = require('./abi')

const uriToGatewayUrl = (uri) => {
  const paths = uri.replace('ipfs://', '')
  const [cid, ...rest] = paths.split('/')
  return `https://${cid}.ipfs.dweb.link/${rest.join('/')}`
}

const web3StorageClient = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN })
const ethersProvider = new ethers.providers.StaticJsonRpcProvider(
  process.env.RINKEBY_URL, 
  {
    chainId: 4,
    name: 'Rinkeby',
  }
);

const uploadMapJson = async (data) => {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const file = new File([blob], 'map.json')
    const rootCid = await web3StorageClient.put([file])
    const res = await web3StorageClient.get(rootCid)
    if (!res) {
        throw new Error('Could retrieve rootCid')
    }
    const files = await res.files()
    return files[0].cid
}

exports.handler = async (event) => {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS
    const contract = new ethers.Contract(contractAddress, ABI, ethersProvider)
    const total = (await contract.totalSupply()).toNumber()
    const fetchTokenData = async (tokenId) => {
      const tokenURI = await contract.tokenURI(tokenId)
      const { data } = await axios.get(uriToGatewayUrl(tokenURI), { timeout: (1000 * 60 * 5) })
      return {
        id: tokenId,
        ...data
      }
    }
    const tokensToFetch = []
    for (let i=0; i<total; i++) {
      tokensToFetch.push(i)
    }
    const tokens = await Promise.all(tokensToFetch.map(tokenId => fetchTokenData(tokenId)))
    const mapsCID = await uploadMapJson({
      total,
      tokens,
    })
    const mapsURI = `ipfs://${mapsCID}`
    return {
      statusCode: 200,
      body: JSON.stringify({ uri: mapsURI }),
  };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    }
  }
};
