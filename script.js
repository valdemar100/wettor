const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");
const quoteForm = document.querySelector("[data-quote-form]");
const consultingCarousel = document.querySelector("[data-consulting-carousel]");

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 18);
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

menuButton.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

menu.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeMenu();
});

if (consultingCarousel) {
  const track = consultingCarousel.querySelector("[data-consulting-track]");
  const slides = Array.from(consultingCarousel.querySelectorAll(".consulting-slide"));
  const dots = Array.from(consultingCarousel.querySelectorAll("[data-consulting-dot]"));
  const prevButton = consultingCarousel.querySelector("[data-consulting-prev]");
  const nextButton = consultingCarousel.querySelector("[data-consulting-next]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let scrollFrame = null;
  let autoTimer = null;

  function setActive(index) {
    activeIndex = (index + slides.length) % slides.length;
    dots.forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", String(dotIndex === activeIndex));
    });
  }

  function scrollToSlide(index) {
    const normalizedIndex = (index + slides.length) % slides.length;
    const slide = slides[normalizedIndex];
    const left = slide.offsetLeft - track.offsetLeft - ((track.clientWidth - slide.clientWidth) / 2);
    track.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
    setActive(normalizedIndex);
  }

  function updateActiveFromScroll() {
    const trackCenter = track.scrollLeft + (track.clientWidth / 2);
    const closestIndex = slides.reduce((closest, slide, index) => {
      const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
      const distance = Math.abs(slideCenter - trackCenter);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Infinity }).index;

    setActive(closestIndex);
  }

  function stopAuto() {
    if (autoTimer) window.clearInterval(autoTimer);
    autoTimer = null;
  }

  function startAuto() {
    if (reduceMotion || slides.length < 2) return;
    stopAuto();
    autoTimer = window.setInterval(() => scrollToSlide(activeIndex + 1), 5200);
  }

  prevButton.addEventListener("click", () => {
    scrollToSlide(activeIndex - 1);
    startAuto();
  });

  nextButton.addEventListener("click", () => {
    scrollToSlide(activeIndex + 1);
    startAuto();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      scrollToSlide(index);
      startAuto();
    });
  });

  track.addEventListener("scroll", () => {
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(updateActiveFromScroll);
  }, { passive: true });

  consultingCarousel.addEventListener("pointerenter", stopAuto);
  consultingCarousel.addEventListener("pointerleave", startAuto);
  consultingCarousel.addEventListener("focusin", stopAuto);
  consultingCarousel.addEventListener("focusout", startAuto);

  setActive(0);
  startAuto();
}

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(quoteForm);
  const nome = data.get("nome")?.toString().trim();
  const telefone = data.get("telefone")?.toString().trim();
  const projeto = data.get("projeto")?.toString().trim();
  const mensagem = data.get("mensagem")?.toString().trim();

  const text = [
    "Olá, quero um orçamento da Wettor Fitness.",
    nome ? `Nome: ${nome}` : "",
    telefone ? `Telefone: ${telefone}` : "",
    projeto ? `Projeto: ${projeto}` : "",
    mensagem ? `Detalhes: ${mensagem}` : "",
  ].filter(Boolean).join("\n");

  window.open(`https://wa.me/5585981021071?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
});
