export const getTokenExplorerUrl = (tokenId?: number): string => {
  const contract = process.env.REACT_APP_CONTRACT_ADDRESS
  return `https://rinkeby.etherscan.io/token/${contract}?a=${tokenId}`
}
