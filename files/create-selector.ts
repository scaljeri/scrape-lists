export interface ICreateSelectorConfig {
  isMulti: boolean
}
export function createSelector(element: Element, config: ICreateSelectorConfig = { isMulti: false }): string {
  let index;
  let pathSelector = '';
  let localName;
  // call getIndex function
  index = getIndex(element);

  while (element.tagName) {
    // selector path
    pathSelector = element.localName + (pathSelector ? " > " + pathSelector : "");
    element = element.parentNode as HTMLElement;
  }
  if (!config.isMulti) {
    // selector path for nth of type
    pathSelector = pathSelector + `:nth-of-type(${index})`;
  }

  return pathSelector;
};

// get index for nth of type element
export function getIndex(node: Element) {
  let i = 1;
  let tagName = node.tagName;

  while (node.previousSibling) {
    node = node.previousSibling as HTMLElement;
    if (
      node.nodeType === 1 &&
      tagName.toLowerCase() == node.tagName.toLowerCase()
    ) {
      i++;
    }
  }
  return i;
}
