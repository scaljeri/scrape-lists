window.highlightClick = (selector) => {
  document
    .querySelectorAll(".highlight")
    .forEach((el) => el.classList.remove("highlight"));

  const els = document.querySelectorAll(selector);
  els.forEach((el) => el.classList.add("highlight"));
};
