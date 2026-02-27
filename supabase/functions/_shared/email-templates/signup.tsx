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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu e-mail para o Backstage Pro</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Bem-vindo ao Backstage Pro! 🎶</Heading>
        <Text style={text}>
          Que bom ter você aqui! Confirme seu e-mail (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) clicando no botão abaixo para começar a organizar sua carreira musical.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar meu e-mail
        </Button>
        <Text style={footer}>
          Se você não criou uma conta, pode ignorar este e-mail com segurança.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
