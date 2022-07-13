import React, { FC, useState } from 'react'
import { LocationPicker } from '../components/LocationPicker'
import { Map } from '../components/Map'
import { useMapData } from '../hooks/useMapUri'
import { MainLayout } from '../layouts/MainLayout'

export interface HomeProps {
  
}

export const Home: FC<HomeProps> = (props) => {
  const [open, setOpen] = useState<boolean>(true)
  const data = useMapData()
  console.log(data)
  return (
    <MainLayout>
      {/* <Map /> */}
    </MainLayout>
  )
}
