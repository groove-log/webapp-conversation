import type { AppInfo } from '@/types/app'
export const APP_ID = process.env.APP_ID || process.env.NEXT_PUBLIC_APP_ID || 'runtime-app-id'
export const API_KEY = process.env.APP_KEY || process.env.NEXT_PUBLIC_APP_KEY || 'runtime-api-key'
export const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || ''
export const APP_INFO: AppInfo = {
  title: process.env.NEXT_PUBLIC_APP_TITLE || 'GS리테일 상담봇',
  description: '',
  copyright: 'GS Retail AX',
  privacy_policy: '',
  default_language: 'ko',
  disable_session_same_site: false, // set it to true if you want to embed the chatbot in an iframe
}

export const isShowPrompt = false
export const promptTemplate = 'I want you to act as a javascript console.'

export const API_PREFIX = '/api'

export const LOCALE_COOKIE_NAME = 'locale'

export const DEFAULT_VALUE_MAX_LEN = 48
