(() => {
  const works = window.IvosArtStatements;
  const section = document.getElementById("statements");
  if (!section || !works?.length) return;
  const image = document.getElementById("frImage");
  const title = document.getElementById("frTitle");
  const caption = document.getElementById("frCaption");
  const opener = document.getElementById("frOpen");
  const viewer = document.getElementById("frViewer");
  const viewerImage = document.getElementById("frViewerImage");
  const choices = [...section.querySelectorAll("[data-fr-choice]")];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let selected = 0, previousOverflow = "";

  function select(index, animate = true) {
    selected = (index + works.length) % works.length;
    const work = works[selected];
    image.src = work.image;
    image.srcset = work.thumbnail + " " + work.thumbnailWidth + "w, " + work.image + " " + work.width + "w";
    image.alt = work.alt;
    image.width = work.width;
    image.height = work.height;
    opener.style.aspectRatio = work.width + " / " + work.height;
    title.textContent = work.title;
    caption.textContent = work.caption;
    opener.setAttribute("aria-label", "View " + work.title + " full-screen");
    choices.forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.frChoice) === selected)));
    if (animate && !reducedMotion.matches) image.animate([{ opacity: .4, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out" });
    if (viewer.open) drawViewer();
  }

  function drawViewer() {
    const work = works[selected];
    viewerImage.src = work.image;
    viewerImage.alt = work.alt;
    viewerImage.width = work.width;
    viewerImage.height = work.height;
    document.getElementById("frOriginal").href = work.image;
    document.getElementById("frViewerTitle").textContent = work.title;
    document.getElementById("frViewerCaption").textContent = work.caption;
    document.getElementById("frCount").textContent = String(selected + 1).padStart(2, "0") + " / " + String(works.length).padStart(2, "0");
  }

  function openViewer() {
    if (viewer.open) return;
    previousOverflow = document.body.style.overflow;
    viewer.showModal();
    document.body.style.overflow = "hidden";
    drawViewer();
  }
  choices.forEach(button => button.addEventListener("click", () => {
    select(Number(button.dataset.frChoice), false);
    openViewer();
  }));
  opener.addEventListener("click", openViewer);
  document.getElementById("frClose").addEventListener("click", () => viewer.close());
  viewer.addEventListener("close", () => { document.body.style.overflow = previousOverflow; });
  document.getElementById("frPrevious").addEventListener("click", () => select(selected - 1));
  document.getElementById("frNext").addEventListener("click", () => select(selected + 1));
  viewer.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      select(selected + (event.key === "ArrowRight" ? 1 : -1));
    }
  });

  function inquire() {
    if (viewer.open) viewer.close();
    window.pre?.("Framed statement — " + works[selected].title);
  }
  function ask() {
    if (viewer.open) viewer.close();
    const work = works[selected];
    window.openIvoAI?.("Tell me about the framed art statement '" + work.title + "' in the Framed. Never tamed. gallery. The image shows " + work.alt + ". What could I see in it?");
  }
  document.getElementById("frInquire").addEventListener("click", inquire);
  document.getElementById("frViewerInquire").addEventListener("click", inquire);
  document.getElementById("frAsk").addEventListener("click", ask);
  document.getElementById("frViewerAsk").addEventListener("click", ask);
  select(0, false);
})();
