import { NextRequest, NextResponse } from "next/server";

// The product was NativeApply at nativeapply.net until 10 Oct 2026, when it
// became Hireword at hireword.com.
//
// Paddle opens a live checkout only on a domain it has approved, one domain at
// a time (Paddle, Checkout, Website approval). nativeapply.net is approved;
// hireword.com is not yet. So the earlier address keeps answering the payment
// page itself, and the build files and API routes that page needs, and sends a
// reader on every other path across to the same path on hireword.com.
//
// When hireword.com reads "Checkout approved" on that page, set
// CHECKOUT_ORIGIN in lib/constants.ts to the site's own origin and remove
// "/checkout" from LEGACY_STAYS here, in the same change. Until then, moving
// the payment page means nobody can pay.
const LEGACY_HOSTS = new Set(["nativeapply.net", "www.nativeapply.net"]);
const SITE_ORIGIN = "https://hireword.com";
const LEGACY_STAYS = ["/checkout", "/api", "/_next", "/favicon.ico", "/icon", "/apple-icon"];

function staysOnLegacy(pathname: string): boolean {
  return LEGACY_STAYS.some((p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(`${p}?`));
}

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase().split(":")[0];
  if (!LEGACY_HOSTS.has(host)) return NextResponse.next();
  const { pathname, search } = req.nextUrl;
  if (host === "nativeapply.net" && staysOnLegacy(pathname)) return NextResponse.next();
  return NextResponse.redirect(`${SITE_ORIGIN}${pathname}${search}`, 308);
}

export const config = {
  matcher: "/:path*",
};
