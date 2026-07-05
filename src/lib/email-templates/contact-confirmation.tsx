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
  fontSize: "24px",
  margin: "0 0 12px",
  color: INK,
  fontWeight: 700 as const,
};
const p = { fontSize: "15px", lineHeight: "1.6", color: INK, margin: "0 0 14px" };
const label = {
  color: MUTED,
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "16px 0 6px",
};
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

const Email = ({ name, message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We've received your message — Ayuniqa</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar} />
        <Heading as="h1" style={h1}>
          Thanks for reaching out, {name}!
        </Heading>
        <Text style={p}>
          We've received your message and a member of the Ayuniqa team will get
          back to you within one business day.
        </Text>
        <Text style={p}>For your reference, here's a copy of what you sent:</Text>

        <Text style={label}>Your message</Text>
        <Section style={messageBox}>
          <Text style={{ margin: 0, color: INK }}>{message}</Text>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>Talk soon,<br />The Ayuniqa Team</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: "We've received your message — Ayuniqa",
  displayName: "Contact form — confirmation to sender",
  previewData: {
    name: "Jane",
    message: "Hi Ayuniqa team, I'd love to learn more about your slot lineup.",
  },
} satisfies TemplateEntry;