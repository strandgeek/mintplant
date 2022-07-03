export const uriToGatewayUrl = (uri: string): string => {
  const paths = uri.replace('ipfs://', '')
  const [cid, ...rest] = paths.split('/')
  return `https://${cid}.ipfs.dweb.link/${rest.join('/')}`
}
