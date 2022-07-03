export const renameFile = (file: File, name: string): File => {
  const blob = file.slice(0, file.size, file.type); 
  const renamedFile = new File([blob], name, { type: file.type })
  return renamedFile
}
