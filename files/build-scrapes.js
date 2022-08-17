import { createSelector } from "./create-selector.js";
export function parseScrapeConfig(scrapes) {
    let output = [];
    scrapes.forEach(scrape => {
        const els = document.querySelectorAll(scrape.selector);
        const scrapes = {};
        els.forEach((el) => {
            const path = createSelector(el, { isMulti: true });
            if (!scrapes[path]) {
                scrapes[path] = { elements: [] };
            }
            scrapes[path].elements.push({ el, scrape });
        });
        Object.keys(scrapes).sort((a, b) => {
            return a.length > b.length ? 1 : -1;
        }).reduce((acc, key) => {
            const update = Object.assign({ path: key }, scrapes[key]);
            acc.push(update);
            return acc;
        }, output);
    });
    return output;
}
