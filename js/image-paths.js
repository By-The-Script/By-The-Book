export function normalizeImagePath(path) {
    if (typeof path !== 'string') return path;

    return path.replace(/(^|[\\/])pictures(?=[\\/])/g, '$1assets/images');
}
