export function findFirstCommonAncestor(nodeA: any, nodeB: any, root?: any) {
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

export function cocuntParentChild(parent: any, child: any) {
  let count = 0;
  while (child !== parent && child.parentNode) {
    child = child.parentNode;
    count++;
  }

  return count;
}

export function isParentChild(parent: any, child: any) {
  return parent !== child && parent.contains(child);
};

export function findListItem(a: any, root: any) {
  if (!root) {
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
