import React, { FC } from 'react'
import { Topbar } from '../components/Topbar'

export interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <div>
      <Topbar />
      <div>
        {children}
      </div>
    </div>
  )
}
