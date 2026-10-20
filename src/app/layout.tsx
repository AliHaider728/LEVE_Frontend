import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "../styles.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://leva.pk"),
  title: {
    default: "LEVA — Skincare for Her",
    template: "%s | LEVA",
  },
  description: "LEVA skincare essentials, delivered across Pakistan. Discover considered rituals crafted for healthy, radiant skin.",
  keywords: [
    "LEVA",
    "LEVA skincare",
    "LEVA Pakistan",
    "leva.pk",
    "leva official",
    "skincare Pakistan",
    "best skincare brand Pakistan",
    "skincare routine",
    "gentle cleanser",
    "hydrating cleanser",
    "face wash Pakistan",
    "balancing toner",
    "skin toner",
    "pore tightening toner",
    "barrier moisturizer",
    "ceramide moisturizer",
    "face cream Pakistan",
    "skincare bundles",
    "routine builder",
    "buy skincare online Pakistan",
    "cash on delivery skincare",
    "glowing skin routine",
    "acne safe skincare",
    "healthy skin barrier",
    "pakistani skincare brands",
    "skincare for women",
  ],
  authors: [{ name: "LEVA", url: "https://leva.pk" }],
  creator: "LEVA",
  publisher: "LEVA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://leva.pk",
  },
  openGraph: {
    title: "LEVA — Skincare for Her",
    description: "LEVA skincare essentials, delivered across Pakistan. Considered rituals for healthy, radiant skin.",
    url: "https://leva.pk",
    siteName: "LEVA",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LEVA — Skincare for Her",
    description: "LEVA skincare essentials, delivered across Pakistan.",
  },
  icons: { icon: "/favicon.ico" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://leva.pk/#organization",
      "name": "LEVA",
      "url": "https://leva.pk",
      "logo": "https://leva.pk/favicon.ico",
      "sameAs": [
        "https://www.instagram.com/leva.pk.official/",
        "https://www.facebook.com/leva.pk.official",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://leva.pk/#website",
      "url": "https://leva.pk",
      "name": "LEVA",
      "publisher": { "@id": "https://leva.pk/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://leva.pk/shop?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        {/* Primary Google Search & SEO Meta Tags */}
        <meta
          name="description"
          content="LEVA offers premium skincare essentials delivered across Pakistan. Gentle Cleanser, Balancing Toner, and Barrier Moisturizer crafted for healthy, radiant skin. Cash on Delivery nationwide."
        />
        <meta
          name="keywords"
          content="LEVA, LEVA skincare, LEVA Pakistan, leva.pk, leva official, skincare Pakistan, best skincare brand Pakistan, skincare routine, gentle cleanser, hydrating cleanser, face wash Pakistan, balancing toner, skin toner, pore tightening toner, barrier moisturizer, ceramide moisturizer, face cream Pakistan, skincare bundles, routine builder, buy skincare online Pakistan, cash on delivery skincare, glowing skin routine, acne safe skincare, healthy skin barrier, pakistani skincare brands, skincare for women"
        />
        <meta name="author" content="LEVA Pakistan" />
        <meta name="publisher" content="LEVA" />

        {/* Google & Search Engine Indexing Directives */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* Regional & Target Audience Tags for Pakistan */}
        <meta name="geo.region" content="PK" />
        <meta name="geo.placename" content="Pakistan" />
        <meta name="language" content="English" />
        <meta name="rating" content="General" />
        <link rel="canonical" href="https://leva.pk" />

        {/* OpenGraph & Social Search Sharing Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="LEVA" />
        <meta property="og:locale" content="en_PK" />
        <meta property="og:url" content="https://leva.pk" />
        <meta property="og:title" content="LEVA — Considered Skincare Rituals for Her | Pakistan" />
        <meta property="og:description" content="Discover LEVA skincare essentials in Pakistan. Gentle Cleanser, Balancing Toner, and Barrier Moisturizer. Cash on Delivery nationwide." />

        {/* Twitter Card Search Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="LEVA — Skincare for Her" />
        <meta name="twitter:description" content="Premium skincare essentials crafted for healthy, radiant skin. Delivered across Pakistan with Cash on Delivery." />

        <script
          dangerouslySetInnerHTML={{
            __html: `if (typeof window !== 'undefined' && 'scrollRestoration' in history) { history.scrollRestoration = 'manual'; window.scrollTo(0, 0); }`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NKXTJ2PP"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NKXTJ2PP');`}
        </Script>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5ELNQLZJB0"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-5ELNQLZJB0');`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
