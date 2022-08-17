export function createSelector(element, config = { isMulti: false }) {
    let index;
    let pathSelector = '';
    let localName;
    // call getIndex function
    index = getIndex(element);
    while (element.tagName) {
        // selector path
        pathSelector = element.localName + (pathSelector ? " > " + pathSelector : "");
        element = element.parentNode;
    }
    if (!config.isMulti) {
        // selector path for nth of type
        pathSelector = pathSelector + `:nth-of-type(${index})`;
    }
    return pathSelector;
}
;
// get index for nth of type element
export function getIndex(node) {
    let i = 1;
    let tagName = node.tagName;
    while (node.previousSibling) {
        node = node.previousSibling;
        if (node.nodeType === 1 &&
            tagName.toLowerCase() == node.tagName.toLowerCase()) {
            i++;
        }
    }
    return i;
}
