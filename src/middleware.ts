import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const i18nMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'de'],

    // Used when no locale matches
    defaultLocale: 'en',

    // true: the value from the accept-language header is used
    // false: use the defaultLocale if no locale is provided via url
    localeDetection: false,
});

// paths where we do not need localized path
const unlocalizedPaths = ['/api', '/_next/static', '/_next/image', '/favicon.ico', '/LocationMarkers'];

const unlocalizedPathsRegex = RegExp(
    `^(${unlocalizedPaths.map((str) => `(${str.startsWith('/') ? str : '/' + str})`).join('|')})(/?$|/.*)`,
);

export function middleware(req: NextRequest) {
    if (req.nextUrl.pathname.match(unlocalizedPathsRegex)) {
        return NextResponse.next();
    }
    return i18nMiddleware(req);
}
