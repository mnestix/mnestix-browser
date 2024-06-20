export function getSanitizedHref(link: string | undefined): string {
    if (!link) {
        return '';
    }
    let sanitizedLink = link;
    if (!sanitizedLink.startsWith('http') && !sanitizedLink.startsWith('//')) {
        sanitizedLink = '//' + link;
    }
    return sanitizedLink;
}

export function getTelHref(tel: string | undefined): string {
    if (!tel) {
        return '';
    }
    // Remove everything but digits and '+'
    const sanitizedTel = tel.replace(/[^+\d]/g, '');
    return 'tel:' + sanitizedTel;
}

export function getMailToHref(email: string | undefined): string {
    if (!email) {
        return '';
    }
    return 'mailto:' + email;
}
