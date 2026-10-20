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
    "skincare Pakistan",
    "skincare ritual",
    "gentle cleanser",
    "balancing toner",
    "barrier moisturizer",
    "routine bundle",
    "Cash on Delivery Pakistan",
    "beauty products Pakistan",
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
