import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLandlordRoute = path.startsWith("/landlord");
  const isTenantRoute   = path.startsWith("/tenant");
  const isAdminRoute    = path.startsWith("/admin");

  // Redirect unauthenticated users to login
  if (!user && (isLandlordRoute || isTenantRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based route protection
  if (user && (isLandlordRoute || isTenantRoute || isAdminRoute)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // Admin routes — only admins allowed
    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Cross-role guards for landlord / tenant routes
    if (role === "tenant" && isLandlordRoute) {
      return NextResponse.redirect(new URL("/tenant/dashboard", request.url));
    }
    if (role === "landlord" && isTenantRoute) {
      return NextResponse.redirect(new URL("/landlord/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/landlord/:path*", "/tenant/:path*", "/admin/:path*"],
};
