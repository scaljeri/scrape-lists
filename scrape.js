window.scrape = (scrapes) => {
  const output = scrapes.reduce((acc, scrape) => {
    const els = document.querySelectorAll(scrape.selector);
    const scrapes = {};
    els.forEach((el) => {
      const path = createSelector(el, { isMulti: true });
      if (!scrapes[path]) {
        scrapes[path] = { elements: [], parent: null };
      }
      scrapes[path].elements.push({ el, scrape });
    });
    determineLists(scrapes);
    console.log(scrapes);
    acc.push(scrapes);
    return acc;
  }, []);

  //   console.log(groupByList(output));
};

function groupByList(scrapes) {
  const lists = new Map();

  scrapes.forEach((scrape) => {
    Object.entries(scrape).forEach(([path, listItems]) => {
      console.log("path=" + path);
      if (!lists.get(listItems.parent)) {
        console.log("new", lists.size);
        lists.set(listItems.parent, { scrapes: [] });
      }

      lists.get(listItems.parent).scrapes.push({ path, listItems });
    });
  });

  //   console.log(Object.fromEntries(lists), lists.size);
  console.dir(lists);
}

function determineLists(scrapes) {
  const lists = new Map();

  Object.keys(scrapes).forEach((key) => {
    const scrape = scrapes[key];
    const updates = new Map();

    for (let i = 0; i < scrape.elements.length; i++) {
      for (let j = 0; j < scrape.elements.length; j++) {
        if (i === j) continue;

        const first = scrape.elements[i].el;
        const second = scrape.elements[j]?.el;

        if (second) {
          const list = findFirstCommonAncestor(first, second);
          if (!updates.get(list)) {
            updates.set(list, {});
          }
        } else {
          scrape.parent = first;
        }
      }
    }

    mergeLists(lists, updates);
  });
}

function mergeLists(main, updates) {
    debugger;
  updates.forEach((value, list) => {
    if (!main.get(list)) {
      // new list
      // First check: Is one of the existing lists the parent
      const mLists = Array.from(main.keys());
      for (let i = 0; i < mLists.length; i++) {
        const parentList = findNestedParent(list, mLists[i], main.get(mLists[i]));

        if (parentList) {
          main.get(parentList).child = list; // never an array?!
          value.parent = parentList;
          break;
        }
      }

      // done
      main.set(list, {});
    }
  });
  debugger;
}

function findNestedParent(child, parent, value) {
  let retVal = null;

  if (isParentChild(parent, child)) {
    retVal = parent;

    while (retVal.child) {
        retVal = retVal.child
    }
  }

  return retVal;
}
