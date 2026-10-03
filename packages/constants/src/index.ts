export const JLI_DOMAIN = "jli.li";
export const SHORT_LINK_DOMAIN = "short-link.ro80t.com";

export const JLI_URL = "https://jli.li";
export const SHORT_LINK_URL = "https://short-link.ro80t.com";

/**
 * Short-link domains that redirect `/{id}` to the link it stands for. To add one: add it here, run
 * `bun run generate` in `packages/db` for the `domain` enum migration, then deploy a redirect
 * Worker with that domain's route (see CONTRIBUTING.md).
 */
export const SHORT_LINK_DOMAINS = [JLI_DOMAIN] as const;

export type ShortLinkDomain = (typeof SHORT_LINK_DOMAINS)[number];

/** The domain short-link.ro80t.com issues new links on. */
export const DEFAULT_SHORT_LINK_DOMAIN: ShortLinkDomain = JLI_DOMAIN;

/** The short-link domain a request arrived on, or null when it's not one of ours. */
export function toShortLinkDomain(hostname: string): ShortLinkDomain | null {
  return SHORT_LINK_DOMAINS.find((domain) => domain === hostname) ?? null;
}

/** Domains this project owns — a link pointing at one of these can't be shortened into a link on itself. */
export const OWN_DOMAINS = new Set<string>([...SHORT_LINK_DOMAINS, SHORT_LINK_DOMAIN]);

export const SITE_NAME = "ro80t's short link";
export const REPO_URL = "https://github.com/ro80t/url-shortener";
