import { parseScrapeConfig } from "./files/build-scrapes.js";
import { groupScrapes } from "./files/group-scrapes.js";
const SCRAPES = [
    { name: "title", selector: "ol > li > section > header" },
    { name: "content", selector: "ol > li > section > article" },
];
window.doMagic = function () {
    const scrapes = parseScrapeConfig(SCRAPES);
    const groups = groupScrapes(scrapes);
};
