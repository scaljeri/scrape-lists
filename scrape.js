window.scrapeIt = (scrapes) => {
  let levels = [];

  //   let lists = new Map();
  const output = scrapes.reduce((acc, scrape) => {
    const els = document.querySelectorAll(scrape.selector);
    const scrapes = {};
    els.forEach((el) => {
      const path = createSelector(el, { isMulti: true });
      if (!scrapes[path]) {
        scrapes[path] = { elements: [] };
      }
      scrapes[path].elements.push({ el, scrape });
    });
    console.log("scrapes", scrapes);
    levels = scrape2levels(scrapes, levels);
    debugger;
    // lists = determineLists(scrapes); //, lists);
    // console.log(scrapes);
    acc.push(scrapes);
    return acc;
  }, []);

  console.log("xxxx", levels);
  debugger;
  const groups = groupLevels(levels);
  //   const nestedGroups = nestGroups(groups);
  //   const scrape = scrapeGroups(nestedGroups);

  //   const lKeys = Array.from(lists.keys());
  //   const mList = lKeys[0];
  //   const main = lists.get(lKeys[0]);
  //   output.forEach((scrapes) => {
  //     Object.keys(scrapes).forEach((key) => {
  //       const els = scrapes[key];
  //       els.elements.forEach((el) => {
  //         addElementsToList(el, mList, main);
  //       });
  //     });
  //   });
  //   console.log("Lists", lists);
  //   console.log("DONE");
};

function groupLevels(levels) {
  const parents = [];
  levels.forEach((level, index) => {
    parents.push(
      ...document.querySelectorAll(
        createSelector(level.parent, { isMulti: true })
      )
    );
    if (level.elements.length > 1) {
      for (let i = 0; i < level.elements.length; i++) {
        level.groups ??= new Map();
        const first = level.elements[i];
        first.addElementToGroup = true;

        if (first.addedToGroup) {
          continue;
        }

        for (let j = i + 1; j < level.elements.length; j++) {
          const second = level.elements[j];
          if (second?.addedToGroup) {
            continue;
          }

          const isLast = j === level.elements.length - 1;
          const parent = findFirstCommonAncestor(first.el, second?.el);
          if (!parents.includes(parent)) {
            second.addElementToGroup = true;
            const groups = level.groups.get(parent) || { elements: [] };
            groups.elements.push(first);
            groups.elements.push(second);
            level.groups.set(parent, groups);
          } else if (isLast) {
            const groups = level.groups.get(first.el.parentNode) || {
              elements: [],
            };
            groups.elements.push(first);
            level.groups.set(first.el.parentNode, groups);
          }
        }
      }
    }
  });
}

function scrape2levels(scrapes, levels) {
  const parents = [];

  const update = Object.entries(scrapes)
    .sort(([a], [x]) => (a.length > x.length ? 1 : -1))
    .reduce((acc, [path, b], index) => {
      acc[index] = { ...b, path };
      return acc;
    }, [])
    .map((item) => {
      const selectors = [];
      for (let i = 0; i < item.elements.length - 1; i++) {
        for (let j = i + 1; j < item.elements.length + 1; j++) {
          const first = item.elements[i].el;
          const second = item.elements[j]?.el;

          if (second || item.elements === 1) {
            selectors.push(
              createSelector(findFirstCommonAncestor(first, second), {
                isMulti: true,
              })
            );
          }
        }
      }
      // The longest selector is the (nested) list
      const selector = selectors.sort().reverse()[0];
      //  ||
      // createSelector(item.elements[0].el.parentNode, { isMulti: true });
      item.parent = null;
      if (selector) {
        const list = document.querySelector(selector);
        if (parents.includes(list)) {
          item.parent = null;
        } else {
          item.parent = selector;
        }
      }
      parents.push(...document.querySelectorAll(item.parent));
      return item;
    });

  return updateLevels(update, levels);
}

function updateLevels(update, source) {
  debugger;
  if (!source.length) {
    update.forEach(
      (v, i) =>
        (source[i] = {
          ...v,
          //   elements: [v.elements],
        })
    );
    return source;
  }

  update.forEach((u) => {
    source.push(u);
  });

  source.sort((a, b) => {
    return a.path.length > b.path.length ? 1 : -1;
  });

  return mergeLevels(source);
}

function mergeLevels(levels) {
  debugger;
  for (let i = 0; i < levels.length - 1; i++) {
    const level = levels[i];
    if (level.parent === null) {
      level.parent = levels[i - 1].parent;
    }
    const p1s = Array.from(document.querySelectorAll(level.parent));
    for (let j = i + 1; j < levels.length; j++) {
      const other = levels[j];
      if (other.parent === null) {
        other.parent = levels[j - 1].parent;
      }
      const p2s = Array.from(document.querySelectorAll(other.parent));

      const isSameParent = !!p1s.some((p) => p2s.includes(p));

      if (isSameParent) {
        level.delete = true;
        other.elements = [...other.elements, ...level.elements];
      }
    }
  }

  return levels.filter((l) => !l.delete);
}

// ODL -----

function addElementsToList(item, list, value) {
  if (isParentChild(list, item.el)) {
    const children = Array.from(value.children.keys());
    for (let i = 0; i < children.length; i++) {
      if (
        addElementsToList(item, children[i], value.children.get(children[i]))
      ) {
        return true;
      }
    }

    // Add to `list`
    if (!addElementToGroup(item, value.groups, list)) {
      value.groups.push({ items: [item] });
    }
    return true;
  }

  return false;
}

function addElementToGroup(el, groups, list) {
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const item = group.items[0];
    const commonList = findFirstCommonAncestor(el.el, item.el);

    if (commonList !== list) {
      group.items.push(el);
      return true;
    }
  }

  return false;
}

function determineLists(scrapes) {
  const lists = new Map();

  debugger;
  Object.keys(scrapes).forEach((path) => {
    const scrape = scrapes[path];
    const updates = new Map();

    for (let i = 0; i < scrape.elements.length; i++) {
      for (let j = i + 1; j < scrape.elements.length + 1; j++) {
        if (i === j) continue;

        const first = scrape.elements[i].el;
        const second = scrape.elements[j]?.el;
        let list;

        if (second) {
          list = findFirstCommonAncestor(first, second);
        } else if (scrape.elements.length === 1) {
          // Only one element
          list = first.parentNode;
        } else {
          continue;
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
      debugger;
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
              groups: [],
            };

            value.children.set(list, childValue);
          }
          break;
        }
      }

      // done
      main.set(list, childValue || { children: new Map(), groups: [] });
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
