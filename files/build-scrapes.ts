import { createSelector } from "./create-selector.js";
import { IScrape, IScrapped, IScrapeItem, IScrapeSelector } from "./types.js";

export function parseScrapeConfig(scrapes: IScrapeSelector[]): IScrapped[] {
    let output: IScrapped[] = [];

    scrapes.forEach(scrape => {
        const els = document.querySelectorAll(scrape.selector);
        const scrapes: IScrape = {};
        els.forEach((el) => {
            const path = createSelector(el, { isMulti: true });
            if (!scrapes[path]) {
                scrapes[path] = { elements: [] };
            }
            scrapes[path].elements.push({ el, scrape });
        });

        Object.keys(scrapes).sort((a, b) => {
            return a.length > b.length ? 1 : -1
        }).reduce((acc, key) => {
            const update = { path: key, ...scrapes[key] } as IScrapped;
            acc.push(update);
            return acc;
        }, output)
    });

    return output;
}
