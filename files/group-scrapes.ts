import { createSelector } from "./create-selector.js";
import { findFirstCommonAncestor, isParentChild } from "./find-common-ancestor.js";
import { IGrouped, IScrapeElement, IScrapeItem, IScrapped } from "./types";

export function groupScrapes(scrapes: IScrapped[]) {
    const grouped = scrapes.reduce((acc, scrape) => {
        const list = findLongestSelector(scrape.elements);
        acc.push({
            ...scrape,
            list,
            groups: []
        });
        return acc;
    }, [] as IGrouped[]);

    const output = mergeScrapes(grouped);
}

function mergeScrapes(grouped: IGrouped[]) {
    let lists = [] as Element[];
    const groups = [];
    for (let i = 0; i < grouped.length; i++) {
        const first = grouped[i];
        lists = Array.from(document.querySelectorAll(first.list));

        for (let j = i + 1; j < grouped.length + 1; j++) {
            const second = grouped[j];
            if (second && second.elements.length > 0) {
                const boundary = [...lists, ...Array.from(document.querySelectorAll(second.list))];
                groups.push(...createGroups(first.elements, second.elements, boundary);
            }
        }

        if (first.elements.length) {

        }
    }
}

function createGroups(first: IScrapeElement[], second: IScrapeElement[], groups: any, boundaries: Element[]): any[] {
    const output: any[] = []
    if (first[0].scrape === second[0].scrape) {
        return output;
    }
    debugger;

    first.forEach(a => {
        const fb = boundaries.filter(l => isParentChild(l, a.el));
        const node = second.find(b => {
            fb.push(...boundaries.filter(l => isParentChild(l, b.el)));
            const isGroup = fb.every(l => isParentChild(l, a.el) && isParentChild(l, b.el) );
            // TODO: merge into `output`
        });
        if (node) {
            debugger;
        }
    });
    return output;
}

function findLongestSelector(elements: IScrapeElement[]): string {
    if (elements.length > 1) {
        const selectors = [];
        for (let i = 0; i < elements.length - 1; i++) {
            const first = elements[i].el;
            for (let j = i + 1; j < elements.length; j++) {
                const second = elements[j].el;
                selectors.push(createSelector(
                    findFirstCommonAncestor(first, second),
                    { isMulti: true }))
            }
        }

        return selectors.sort().reverse()[0];
    } else {
        return 'body'; //createSelector(elements[0].el, { isMulti: true });
    }
}