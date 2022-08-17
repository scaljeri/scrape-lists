import { parseScrapeConfig } from "./files/build-scrapes.js";
import { groupScrapes } from "./files/group-scrapes.js";
import { IScrapeSelector } from "./files/types.js";

const SCRAPES = [
    { name: "title", selector: "ol > li > section > header" },
    { name: "content", selector: "ol > li > section > article" },
] as IScrapeSelector[];

declare global {
    interface Window { doMagic: () => void }
}

window.doMagic = function () {
    const scrapes = parseScrapeConfig(SCRAPES);
    const groups = groupScrapes(scrapes);
}