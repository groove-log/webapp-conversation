import { getLocaleOnServer } from '@/i18n/server'

import './styles/globals.css'
import './styles/markdown.scss'

export const metadata = {
  title: 'GS Retail AX',
  description: 'GS Retail AX AI Chat Platform',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

import ZendeskModal from '@/app/components/zendesk-modal'

const LocaleLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const locale = await getLocaleOnServer()
  return (
    <html lang={locale ?? 'en'} className="h-full">
      <body className="h-full">
        <div className="overflow-x-auto">
          <div className="w-screen h-screen min-w-[300px]">
            {children}
          </div>
        </div>
        <ZendeskModal />
      </body>
    </html>
  )
}

export default LocaleLayout
