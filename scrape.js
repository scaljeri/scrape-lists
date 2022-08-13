window.scrape = (scrapes) => {
  let lists = new Map();
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
    lists = determineLists(scrapes); //, lists);
    console.log(scrapes);
    acc.push(scrapes);
    return acc;
  }, []);

  console.log("XXXXXXXx", lists);
  //   console.log(groupByList(output));
};

// function groupByList(scrapes, lists) {
//   scrapes.forEach((value, key) => {
//     Object.entries(scrape).forEach(([path, listItems]) => {
//       console.log("path=" + path);
//       if (!lists.get(listItems.parent)) {
//         console.log("new", lists.size);
//         lists.set(listItems.parent, { scrapes: [] });
//       }

//       lists.get(listItems.parent).scrapes.push({ path, listItems });
//     });
//   });

//   //   console.log(Object.fromEntries(lists), lists.size);
//   console.dir(lists);
//   return lists;
// }

function determineLists(scrapes) {
  const lists = new Map();

  Object.keys(scrapes).forEach((path) => {
    const scrape = scrapes[path];
    const updates = new Map();

    for (let i = 0; i < scrape.elements.length - 1; i++) {
      for (let j = i + 1; j < scrape.elements.length; j++) {
        if (i === j) continue;

        const first = scrape.elements[i].el;
        const second = scrape.elements[j]?.el;
        let list;

        if (second) {
          list = findFirstCommonAncestor(first, second);
        } else {
          list = first.parentNode;
        }

        if (!updates.get(list)) {
          updates.set(list, {});
        }
      }
    }

    mergeLists(lists, updates);
  });

  return lists;
}

function mergeLists(main, updates) {
  updates.forEach((value, list) => {
    if (!main.get(list)) {
      // new list
      // First check: Is one of the existing lists the parent
      const mLists = Array.from(main.keys());
      let parentList;
      let childValue = null;
      for (let i = 0; i < mLists.length; i++) {
        parentList = findNestedParent(list, mLists[i], main.get(mLists[i]));

        if (parentList) {
          const value = main.get(parentList); //.child = list; // never an array?!
          if (value.children.get(list)) {
            console.log("Ooooooops, not implemented yet!!!!");
          } else {
            childValue = {
              children: new Map(),
              parent: parentList,
            };

            value.children.set(list, childValue);
          }
          break;
        }
      }

      // done
      main.set(list, childValue || { children: new Map() });
    }
  });
}

function findNestedParent(child, parent, parentValue) {
  if (!isParentChild(parent, child)) return null;

  let retVal = parent;

  const children = Array.from(parentValue.children.keys());

  for (let i = 0; i < children.length; i++) {
    if (isParentChild(children[i], child)) {
      parentValue = parentValue.children.get(children[i]);
      retVal = findNestedParent(child, children[i], parentValue);
      break;
    }
  }

  return retVal;
}
