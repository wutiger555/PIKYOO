import { realAuth } from "./env";

/** The production address (Vercel sets it per project, so the demo gets its own; a custom domain updates it). */
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

/** Search engines see the site only once real people can sign in: B8 clears the sample coaches at the same time.
 *  The demo (and production until then) answers noindex everywhere. */
export const indexable = realAuth;

/** Structured data for Google (PRD F10-2). `<` is escaped so page text can't close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
