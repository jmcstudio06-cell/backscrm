/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você foi convidado para o Backstage Pro</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Você foi convidado! 🎉</Heading>
        <Text style={text}>
          Você recebeu um convite especial para conhecer o{' '}
          <Link href={siteUrl} style={link}>
            <strong>Backstage Pro</strong>
          </Link>
          , a plataforma completa para gestão de carreira musical.
        </Text>
        <Text style={text}>
          Gerencie seus shows, contratos, finanças, equipe e muito mais — tudo em um só lugar.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Conhecer o Backstage Pro
        </Button>
        <Text style={footer}>
          Se você não esperava este convite, pode ignorar este e-mail.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'DM Sans', Arial, sans-serif" }
const container = { padding: '30px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1a1d24',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#606570',
  lineHeight: '1.6',
  margin: '0 0 25px',
}
const link = { color: '#2563eb', textDecoration: 'underline' }
const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '16px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
