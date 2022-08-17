export interface IScrapeSelector {
    name: string;
    selector: string;
}

export interface IScrapeItem {
    elements: IScrapeElement[],
}

export interface IScrapeElement {
    el: Element;
    scrape: IScrapeSelector;
}

export interface IScrape {
    [path: string]: IScrapeItem;
}

export interface IScrapped extends IScrapeItem {
    path: string;
}

export interface IGrouped extends IScrapped {
    list: string;
    groups: []
}