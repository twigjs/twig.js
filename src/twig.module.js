// Provide a CommonJS module export.
if (typeof module !== undefined && module.exports) {
    module.exports = twig;
} else {
    window.twig = twig;
}

