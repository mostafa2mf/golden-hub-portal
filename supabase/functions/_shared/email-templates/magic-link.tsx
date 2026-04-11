/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_URL = 'https://iketcqfmrhdpgmbacxpy.supabase.co/storage/v1/object/public/logos/email-logo.png'

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="fa" dir="rtl">
    <Head />
    <Preview>لینک ورود به {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Bloggerha" width="48" height="48" style={logo} />
        <Heading style={h1}>لینک ورود</Heading>
        <Text style={text}>
          برای ورود به {siteName} روی دکمه زیر کلیک کنید. این لینک به‌زودی منقضی می‌شود.
        </Text>
        <Button style={button} href={confirmationUrl}>
          ورود به حساب
        </Button>
        <Text style={footer}>
          اگر این درخواست از طرف شما نبوده، این ایمیل را نادیده بگیرید.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '30px 25px', textAlign: 'center' as const }
const logo = { margin: '0 auto 20px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a2e', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: '0 0 25px' }
const button = { backgroundColor: 'hsl(43, 80%, 55%)', color: '#1a1a2e', fontSize: '14px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '12px 28px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#9ca3af', margin: '30px 0 0' }
