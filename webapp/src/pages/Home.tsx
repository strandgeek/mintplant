import React, { FC, useState } from 'react'
import { LocationPicker } from '../components/LocationPicker'
import { Map } from '../components/Map'
import { PreviewTokenModal } from '../components/PreviewTokenModal'
import { useMapData } from '../hooks/useMapUri'
import { MainLayout } from '../layouts/MainLayout'
import { Token } from '../types/mapData'

export interface HomeProps {
  
}

export const Home: FC<HomeProps> = (props) => {
  const [open, setOpen] = useState<boolean>(true)
  const [previewItem, setPreviewItem] = useState<Token | null>(null)
  const mapDara = useMapData()
  return (
    <MainLayout>
      <PreviewTokenModal
        open={!!previewItem}
        setOpen={() => setPreviewItem(null)}
        token={previewItem}
      />
      <Map mapData={mapDara} onClickToken={(token) => setPreviewItem(token)} />
    </MainLayout>
  )
}
