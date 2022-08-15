window.findFirstCommonAncestor = (nodeA, nodeB) => {
  if (!nodeA) {
    return nodeB.parentNode;
  } else if (!nodeB) {
    return nodeA.parentNode;
  }

  let range = new Range();
  range.setStartBefore(nodeA);
  range.setEndAfter(nodeB);
  // There's a compilication, if nodeA is positioned after
  // nodeB in the document, we created a collapsed range.
  // That means the start and end of the range are at the
  // same position. In that case `range.commonAncestorContainer`
  // would likely just be `nodeB.parentNode`.
  if (range.collapsed) {
    // The old switcheroo does the trick.
    range.setStartBefore(nodeB);
    range.setEndAfter(nodeA);
  }
  return range.commonAncestorContainer;
};

window.isParentChild = (parent, child) => {
  return parent !== child && parent.contains(child);
};
