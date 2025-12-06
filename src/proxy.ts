import { type NextRequest, NextResponse } from "next/server";

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!api|_next/static|_next/image|favicon|sitemap.xml|robots.txt).*)",
	],
};

export function proxy(req: NextRequest) {
	const basicAuth = req.headers.get("authorization");
	const url = req.nextUrl;

	const validUser = process.env.BASIC_AUTH_USER;
	const validPass = process.env.BASIC_AUTH_PASSWORD;

	// If user or password not set, then we don't check for basic auth.
	if (!validUser || !validPass) {
		return NextResponse.next();
	}

	if (basicAuth) {
		const authValue = basicAuth.split(" ")[1];
		const [user, pwd] = atob(authValue).split(":");

		if (user === validUser && pwd === validPass) {
			return NextResponse.next();
		}
	}

	// Redirect to the basic auth route.
	url.pathname = "/api/basicauth";
	return NextResponse.rewrite(url);
}
