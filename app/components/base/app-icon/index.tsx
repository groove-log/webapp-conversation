import type { FC } from 'react'
import classNames from 'classnames'
import style from './style.module.css'

export interface AppIconProps {
  size?: 'xs' | 'tiny' | 'small' | 'medium' | 'large'
  rounded?: boolean
  icon?: string
  background?: string
  className?: string
}

const AppIcon: FC<AppIconProps> = ({
  size = 'medium',
  rounded = false,
  icon,
  background,
  className,
}) => {
  return (
    <span
      className={classNames(
        style.appIcon,
        size !== 'medium' && style[size],
        rounded && style.rounded,
        className ?? '',
      )}
      style={{
        background: background || undefined,
      }}
    >
      {icon
        ? (
          <img
            src={icon}
            alt="App Icon"
            className="w-full h-full object-contain pointer-events-none"
          />
        )
        : (
          <img
            src="/logo.png"
            alt="App Icon"
            className="w-full h-full object-contain pointer-events-none"
          />
        )}
    </span>
  )
}

export default AppIcon
