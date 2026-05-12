import type { FC } from 'react'
import React from 'react'
import {
  Bars3Icon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid'
import AppIcon from '@/app/components/base/app-icon'
export interface IHeaderProps {
  title: string
  appIcon?: string
  appIconBackground?: string
  isMobile?: boolean
  onShowSideBar?: () => void
  onCreateNewChat?: () => void
}
const Header: FC<IHeaderProps> = ({
  title,
  appIcon,
  appIconBackground,
  isMobile,
  onShowSideBar,
  onCreateNewChat,
}) => {
  return (
    <div className="shrink-0 flex items-center justify-between h-14 px-6 bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-50 sticky top-0 transition-all duration-300">
      {isMobile
        ? (
          <div
            className='flex items-center justify-center h-9 w-9 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors'
            onClick={() => onShowSideBar?.()}
          >
            <Bars3Icon className="h-5 w-5 text-gray-500" />
          </div>
        )
        : <div className="w-9"></div>}
      <div className='flex items-center space-x-3'>
        <div className="p-1 bg-white rounded-lg shadow-sm border border-gray-100">
          <AppIcon size="small" icon={appIcon} background={appIconBackground} />
        </div>
        <div className="text-base text-gray-900 font-extrabold tracking-tight">{title}</div>
      </div>
      {isMobile
        ? (
          <div className='flex items-center justify-center h-9 w-9 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors' onClick={() => onCreateNewChat?.()} >
            <PencilSquareIcon className="h-5 w-5 text-gray-500" />
          </div>)
        : <div className="w-9"></div>}
    </div>
  )
}

export default React.memo(Header)
