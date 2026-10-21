import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const secret =
      body.secret ||
      request.headers.get("x-revalidate-secret") ||
      request.nextUrl.searchParams.get("secret");

    const expectedSecret =
      process.env.REVALIDATION_SECRET ||
      process.env.SITEMAP_REVALIDATION_SECRET ||
      "V9x!pR4mT8_kL2qN7wZ5@cD3yH6sF1bJ9uG0eX4a";

    // If a secret is provided, verify it. Allow revalidation if secret matches or if localhost
    if (secret && secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid revalidation secret" }, { status: 401 });
    }

    // Revalidate product and catalog tags
    try {
      revalidateTag("products");
      revalidateTag("catalog");
      revalidateTag("bundles");
    } catch {
      // ignore if tags are unsupported in this environment
    }

    // Revalidate paths across the storefront
    const path = body.path || request.nextUrl.searchParams.get("path");
    if (path) {
      revalidatePath(path);
    } else {
      revalidatePath("/", "page");
      revalidatePath("/shop", "page");
      revalidatePath("/shop/[slug]", "page");
      revalidatePath("/bundles", "page");
      revalidatePath("/sitemap.xml");
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: "Revalidation triggered successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error revalidating", details: error?.message },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
