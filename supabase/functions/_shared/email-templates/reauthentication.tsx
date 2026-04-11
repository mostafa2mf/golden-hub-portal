/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL = 'https://iketcqfmrhdpgmbacxpy.supabase.co/storage/v1/object/public/logos/email-logo.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="fa" dir="rtl">
    <Head />
    <Preview>کد تأیید هویت</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Bloggerha" width="48" height="48" style={logo} />
        <Heading style={h1}>تأیید هویت</Heading>
        <Text style={text}>کد زیر را برای تأیید هویت خود وارد کنید:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          این کد به‌زودی منقضی می‌شود. اگر این درخواست از طرف شما نبوده، این ایمیل را نادیده بگیرید.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '30px 25px', textAlign: 'center' as const }
const logo = { margin: '0 auto 20px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a2e', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: '0 0 25px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: '#1a1a2e', backgroundColor: '#f3f4f6', padding: '12px 24px', borderRadius: '12px', margin: '0 0 30px', display: 'inline-block' as const }
const footer = { fontSize: '12px', color: '#9ca3af', margin: '30px 0 0' }
