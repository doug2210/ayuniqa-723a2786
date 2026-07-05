import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name: string;
  company?: string | null;
  email: string;
  message: string;
}

const BRAND = "#F24B02";
const INK = "#3B342C";
const MUTED = "#7A6F62";
const CARD = "#F6F4F0";
const BORDER = "#E8E1D6";

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
  color: INK,
  padding: "24px 0",
};
const container = {
  width: "100%",
  maxWidth: "560px",
  margin: "0 auto",
  padding: "24px",
};
const brandBar = {
  height: "4px",
  backgroundColor: BRAND,
  borderRadius: "2px",
  marginBottom: "20px",
};
const h1 = {
  fontSize: "22px",
  margin: "0 0 8px",
  color: INK,
  fontWeight: 700 as const,
};
const sub = { color: MUTED, margin: "0 0 20px", fontSize: "14px" };
const label = {
  color: MUTED,
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 4px",
};
const value = { margin: "0 0 14px", fontSize: "15px", color: INK };
const messageBox = {
  padding: "14px 16px",
  backgroundColor: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: "10px",
  fontSize: "15px",
  lineHeight: "1.55",
  whiteSpace: "pre-wrap" as const,
  color: INK,
};
const hr = { borderColor: BORDER, margin: "24px 0 12px" };
const footer = { color: MUTED, fontSize: "12px", margin: 0 };

const Email = ({ name, company, email, message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New contact from {name} via ayuniqa.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar} />
        <Heading as="h1" style={h1}>
          New contact message
        </Heading>
        <Text style={sub}>Submitted via ayuniqa.com/contact</Text>

        <Text style={label}>Name</Text>
        <Text style={value}>{name}</Text>

        {company ? (
          <>
            <Text style={label}>Company</Text>
            <Text style={value}>{company}</Text>
          </>
        ) : null}

        <Text style={label}>Email</Text>
        <Text style={value}>{email}</Text>

        <Text style={label}>Message</Text>
        <Section style={messageBox}>
          <Text style={{ margin: 0, color: INK }}>{message}</Text>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Reply directly to this email to respond to {name}.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New contact — ${data.name}${data.company ? ` (${data.company})` : ""}`,
  displayName: "Contact form — internal notification",
  previewData: {
    name: "Jane Doe",
    company: "Acme Casino",
    email: "jane@example.com",
    message: "Hi Ayuniqa team, I'd love to learn more about your slot lineup.",
  },
} satisfies TemplateEntry;