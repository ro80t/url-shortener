import { OWN_DOMAINS } from "consts";

const MAX_URL_LENGTH = 2048;
const URL_FORMAT = /^https?:\/\/[\w/:%#$&?()~.=+-]+$/;

export function validateLink(link: string): string | null {
  if (!URL_FORMAT.test(link)) return "URL Format Error";
  if (link.length > MAX_URL_LENGTH) return "URL CHARACTER LIMIT ERROR";

  let host: string | null = null;
  try {
    host = new URL(link).host;
  } catch {
    return "URL Format Error";
  }
  if (OWN_DOMAINS.has(host)) return "URL Host Name Error";

  return null;
}
