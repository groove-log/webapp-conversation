import React, { useState } from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChatBubbleOvalLeftEllipsisIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsisSolidIcon } from '@heroicons/react/24/solid'
import Button from '@/app/components/base/button'
import type { ConversationItem } from '@/types/app'

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

const MAX_CONVERSATION_LENTH = 20

export interface ISidebarProps {
  copyRight: string
  currentId: string
  onCurrentIdChange: (id: string) => void
  onDeleteConversation?: (id: string) => void
  list: ConversationItem[]
}

const Sidebar: FC<ISidebarProps> = ({
  copyRight,
  currentId,
  onCurrentIdChange,
  onDeleteConversation,
  list,
}) => {
  const { t } = useTranslation()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (id === '-1') return // Don't delete unsaved new chats
    setConfirmDeleteId(id)
  }

  const handleConfirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onDeleteConversation?.(id)
    setConfirmDeleteId(null)
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDeleteId(null)
  }

  return (
    <div
      className="shrink-0 flex flex-col overflow-y-auto bg-white pc:w-[244px] tablet:w-[192px] mobile:w-[240px]  border-r border-gray-200 tablet:h-[calc(100vh_-_3rem)] mobile:h-screen"
    >
      {list.length < MAX_CONVERSATION_LENTH && (
        <div className="flex flex-shrink-0 p-4 !pb-0">
          <Button
            onClick={() => { onCurrentIdChange('-1') }}
            className="group block w-full flex-shrink-0 !justify-start !h-10 text-[#004bbb] bg-blue-50/30 hover:bg-blue-50 border border-blue-100/50 items-center text-sm font-bold rounded-xl transition-all duration-300"
          >
            <PencilSquareIcon className="mr-2 h-4 w-4" /> {t('app.chat.newChat')}
          </Button>
        </div>
      )}

      <nav className="mt-4 flex-1 space-y-1 bg-white p-4 !pt-0">
        {list.map((item) => {
          const isCurrent = item.id === currentId
          const isConfirming = confirmDeleteId === item.id
          const ItemIcon
            = isCurrent ? ChatBubbleOvalLeftEllipsisSolidIcon : ChatBubbleOvalLeftEllipsisIcon
          return (
            <div
              onClick={() => onCurrentIdChange(item.id)}
              key={item.id}
              className={classNames(
                isCurrent
                  ? 'bg-blue-50/80 text-[#004bbb] border-l-[3px] border-[#004bbb] rounded-r-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent',
                'group flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold cursor-pointer transition-all duration-200',
              )}
            >
              <div className="flex items-center min-w-0 flex-1">
                <ItemIcon
                  className={classNames(
                    isCurrent
                      ? 'text-[#004bbb]'
                      : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </div>
              {item.id !== '-1' && (
                isConfirming ? (
                  <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                    <button
                      className="p-0.5 rounded text-red-500 hover:bg-red-50 transition-colors text-xs font-bold"
                      onClick={(e) => handleConfirmDelete(e, item.id)}
                      title="삭제 확인"
                    >
                      ✓
                    </button>
                    <button
                      className="p-0.5 rounded text-gray-400 hover:bg-gray-100 transition-colors text-xs font-bold"
                      onClick={handleCancelDelete}
                      title="취소"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                    onClick={(e) => handleDeleteClick(e, item.id)}
                    title="대화 삭제"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )
              )}
            </div>
          )
        })}
      </nav>
      <div className="flex flex-shrink-0 pr-4 pb-4 pl-4">
        <div className="text-gray-400 font-normal text-xs">© {copyRight} {(new Date()).getFullYear()}</div>
      </div>
    </div>
  )
}

export default React.memo(Sidebar)
