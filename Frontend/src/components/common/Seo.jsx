// Per-route document metadata. React 19 hoists <title>/<meta>/<link> rendered
// anywhere in the tree up into <head>, so we don't need react-helmet.
//
// Crawlers that execute JS (Google) pick these up; the static defaults in
// index.html cover non-JS crawlers and the initial paint.
const SITE = "https://portal.sqac.space";
const DEFAULT_IMAGE = `${SITE}/pwa-512x512.png`;

export default function Seo({
  title,
  description,
  path = "",
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd = null,
}) {
  const url = `${SITE}${path}`;
  const fullTitle = title
    ? `${title} · SQAC Portal`
    : "SQAC Portal — Software Quality Assurance Community";

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="SQAC Portal" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {/* Optional structured data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
