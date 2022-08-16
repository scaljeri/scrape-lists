window.findFirstCommonAncestor = (nodeA, nodeB, root) => {
  if (!nodeA) {
    return findListItem(nodeB, root);
  } else if (!nodeB) {
    return findListItem(nodeA, root);
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

window.countParentChild = (parent, child) => {
  let count = 0;
  while(child !== parent && child.parentNode) {
    child = child.parentNode;
    count++;
  }

  return count;
}

window.isParentChild = (parent, child) => {
  return parent !== child && parent.contains(child);
};

window.findListItem = (a, root) => {
  if(!root) {
    return a.parentNode;
  }

  let pNode = a.parentNode;
  let item = a;
  while (pNode !== root && pNode.parentNode) {
    item = pNode;
    pNode = pNode.parentNode;
  }
  return item;
};
