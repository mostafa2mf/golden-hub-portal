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
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const LOGO_URL = 'https://iketcqfmrhdpgmbacxpy.supabase.co/storage/v1/object/public/logos/email-logo.png'

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="fa" dir="rtl">
    <Head />
    <Preview>تأیید ایمیل {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Bloggerha" width="48" height="48" style={logo} />
        <Heading style={h1}>تأیید آدرس ایمیل</Heading>
        <Text style={text}>
          از ثبت‌نام شما در{' '}
          <Link href={siteUrl} style={link}><strong>{siteName}</strong></Link>{' '}
          متشکریم!
        </Text>
        <Text style={text}>
          لطفاً آدرس ایمیل خود ({recipient}) را با کلیک روی دکمه زیر تأیید کنید:
        </Text>
        <Button style={button} href={confirmationUrl}>
          تأیید ایمیل
        </Button>
        <Text style={footer}>
          اگر حساب کاربری ایجاد نکرده‌اید، این ایمیل را نادیده بگیرید.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '30px 25px', textAlign: 'center' as const }
const logo = { margin: '0 auto 20px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a2e', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: '0 0 25px' }
const link = { color: 'inherit', textDecoration: 'underline' }
const button = { backgroundColor: 'hsl(43, 80%, 55%)', color: '#1a1a2e', fontSize: '14px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '12px 28px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#9ca3af', margin: '30px 0 0' }
