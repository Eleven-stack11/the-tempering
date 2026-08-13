// Blade-rule: sweep once when scrolled into view
document.addEventListener('DOMContentLoaded', () => {
  const rules = document.querySelectorAll('.blade-rule.on-scroll');
  if ('IntersectionObserver' in window && rules.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('lit');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    rules.forEach(r => io.observe(r));
  } else {
    rules.forEach(r => r.classList.add('static'));
  }
});
