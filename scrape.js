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
    acc.push(scrapes);
    return acc;
  }, []);

  groupLevels(levels);
  const result = scrapeGroups(levels);
  cleanup(result);
  console.log(JSON.stringify(result, null, 4));
};

function cleanup(scrapes) {
    scrapes.captures?.forEach(scrape => {
        delete scrape.parent;
        cleanup(scrape);
    });
}

function scrapeGroups(levels) {
  const scrp = {
    date: new Date(),
    captures: [],
  };

  levels.forEach((level, index) => {
    const lists = Array.from(document.querySelectorAll(level.parent));
    level.groups.forEach((group) => {
      const parentList = lists.find((l) =>
        isParentChild(l, group.elements[0].el)
      );
      const scrape = {
        captures: [],
        parent: findFirstCommonAncestor(
          group.elements[0].el,
          group.elements[1]?.el,
          parentList
        ),
      };
      group.elements.forEach((item) => {
        scrape[item.scrape.name] = item.el.innerText;
      });
      if (!addNestedScrape(scrp.captures, scrape)) {
        scrp.captures.push(scrape);
      }
    });
  });
  return scrp;
}

function addNestedScrape(captures, update) {
  for (let i = 0; i < captures.length; i++) {
    const capture = captures[i];
    if (isParentChild(capture.parent, update.parent)) {
      if (capture.captures.length > 0) {
        if (addNestedScrape(capture.captures, update)) {
          return true;
        }
      }
      capture.captures.push(update);
      return true;
    }
  }
  return false;
}

function groupLevels(levels) {
  const parents = [];

  levels.forEach((level, index) => {
    parents.push(...document.querySelectorAll(level.parent));
    parents.sort((a, b) => {
      return isParentChild(a, b) ? 1 : -1;
    });
    if (level.elements.length > 1) {
      for (let i = 0; i < level.elements.length; i++) {
        level.groups ??= new Map();
        const first = level.elements[i];
        const parent = parents.find((p) => isParentChild(p, first.el));

        if (first.addedToGroup) {
          continue;
        }

        if (i === level.elements.length - 1 && !first.addedToGroup) {
          const groups = level.groups.get(findListItem(first.el, parent)) || {
            elements: [],
          };
          groups.elements.push(first);
          level.groups.set(first.el.parentNode, groups);
        }

        for (let j = i + 1; j < level.elements.length; j++) {
          const second = level.elements[j];
          const isLast = j === level.elements.length - 1;
          const cparent = findFirstCommonAncestor(first.el, second?.el, parent);

          if (second?.addedToGroup) {
            if (isLast && !first.addedToGroup) {
              const groups = level.groups.get(
                findListItem(first.el, cparent)
              ) || { elements: [] };
              groups.elements.push(first);
              level.groups.set(first.el.parentNode, groups);
            }
            continue;
          }

          if (!parents.includes(cparent)) {
            second.addedToGroup = true;
            const groups = level.groups.get(cparent) || { elements: [] };

            if (!first.addedToGroup) {
              // only add once
              groups.elements.push(first);
              first.addedToGroup = true;
            }
            groups.elements.push(second);
            level.groups.set(cparent, groups);
          } else if (isLast && !first.addedToGroup) {
            const groups = level.groups.get(
              findListItem(first.el, cparent)
            ) || {
              elements: [],
            };
            groups.elements.push(first);
            level.groups.set(first.el.parentNode, groups);
          }
          if (!first.addedToGroup) {
          }
        }
      }
    }
  });

  return levels;
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
