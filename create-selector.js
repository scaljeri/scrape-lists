window.createSelector = (context, config = { isMulti: false }) => {
  let index, pathSelector, localName;

  if (context == "null") throw "Not a DOM reference";
  // call getIndex function
  index = getIndex(context);

  while (context.tagName) {
    // selector path
    pathSelector = context.localName + (pathSelector ? " > " + pathSelector : "");
    context = context.parentNode;
  }
  if (!config.isMulti) {
    // selector path for nth of type
    pathSelector = pathSelector + `:nth-of-type(${index})`;
  }

  return pathSelector;
};

// get index for nth of type element
function getIndex(node) {
  let i = 1;
  let tagName = node.tagName;

  while (node.previousSibling) {
    node = node.previousSibling;
    if (
      node.nodeType === 1 &&
      tagName.toLowerCase() == node.tagName.toLowerCase()
    ) {
      i++;
    }
  }
  return i;
}
