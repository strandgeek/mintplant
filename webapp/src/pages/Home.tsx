import React, { FC, useState } from 'react'
import { LocationPicker } from '../components/LocationPicker'
import { MainLayout } from '../layouts/MainLayout'

export interface HomeProps {
  
}

export const Home: FC<HomeProps> = (props) => {
  const [open, setOpen] = useState<boolean>(true)
  return (
    <MainLayout>
      <LocationPicker open={open}  setOpen={setOpen} onChange={(lat, lng) => console.log({ lat, lng })} />
    </MainLayout>
  )
}
