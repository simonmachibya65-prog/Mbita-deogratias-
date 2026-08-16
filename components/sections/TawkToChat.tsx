"use client";

import Script from "next/script";

interface TawkToChatProps {
  propertyId: string; // format: "PROPERTY_ID/WIDGET_ID"
}

export default function TawkToChat({ propertyId }: TawkToChatProps) {
  if (!propertyId) return null;

  const [pid, wid] = propertyId.split("/");
  if (!pid || !wid) return null;

  const src = `https://embed.tawk.to/${pid}/${wid}`;

  return (
    <Script
      id="tawkto-script"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='${src}';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
