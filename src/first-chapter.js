import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

// Custom cursor (unchanged)
const customCursor = document.querySelector(".custom-cursor");
const cursorText = customCursor.querySelector("span");

document.addEventListener("mousemove", (e) => {
  customCursor.classList.add("visible");

  gsap.to(customCursor, {
    x: e.clientX - 5,
    y: e.clientY - 3,
    duration: 0.2,
    ease: "power2.out",
  });
});

const clickableElements = document.querySelectorAll('a, button, [data-cursor="hover"]');
clickableElements.forEach((element) => {
  element.addEventListener("mouseenter", () => {
    customCursor.classList.add("visible");
    cursorText.textContent = "Click";
  });

  element.addEventListener("mouseleave", () => {
    customCursor.classList.remove("visible");
    cursorText.textContent = "Scroll";
  });
});

document.fonts.ready.then(() => {
  gsap.set(".title-line", { opacity: 1 });

  let title;
  SplitText.create(".title-line", {
    type: "words,lines",
    linesClass: "line",
    autoSplit: true,
    mask: "lines",
    onSplit: (self) => {
      title = gsap.from(self.lines, {
        duration: 5,
        yPercent: 100,
        opacity: 0,
        stagger: 0.2,
        ease: "expo.out",
      });
      return title;
    },
  });
});
