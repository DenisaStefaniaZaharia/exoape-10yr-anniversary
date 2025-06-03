import gsap from "gsap";

// Custom cursor setup
const customCursor = document.querySelector(".custom-cursor");
const cursorText = customCursor.querySelector("span");

// Track mouse position
document.addEventListener("mousemove", (e) => {
  // Show the cursor
  customCursor.classList.add("visible");

  // Smooth follow using GSAP
  gsap.to(customCursor, {
    x: e.clientX - 5,
    y: e.clientY - 3,
    duration: 0.2,
    ease: "power2.out",
  });
});

// Add hover effects for clickable elements
const clickableElements = document.querySelectorAll('a, button, [data-cursor="hover"]');
clickableElements.forEach(element => {
  element.addEventListener("mouseenter", () => {
    customCursor.classList.add("visible");
    cursorText.textContent = "Click";
  });

  element.addEventListener("mouseleave", () => {
    customCursor.classList.remove("visible");
    cursorText.textContent = "Scroll";
  });
}); 