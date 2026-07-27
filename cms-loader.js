async function loadCMSData() {
  try {
    const response = await fetch('/content.json');
    const data = await response.json();

    // 1. Populate simple text fields (data-cms-edit)
    document.querySelectorAll('[data-cms-edit]').forEach(el => {
      const key = el.getAttribute('data-cms-edit');
      let value = getValueByPath(data, key);
      if (value !== undefined) {
        // If it's a URL (like logo), set src for images
        if (el.tagName === 'IMG') {
          el.src = value;
        } else {
          el.innerHTML = value;
        }
      }
    });

    // 2. Populate repeatable lists (data-cms-repeat)
    document.querySelectorAll('[data-cms-repeat]').forEach(container => {
      const key = container.getAttribute('data-cms-repeat');
      const items = getValueByPath(data, key);
      if (!items || !Array.isArray(items)) return;

      // Use the first child as template
      const template = container.children[0];
      if (!template) return;

      container.innerHTML = ''; // Clear

      items.forEach((item, index) => {
        const clone = template.cloneNode(true);
        // Fill sub-elements with item data
        clone.querySelectorAll('[data-cms-edit]').forEach(el => {
          const field = el.getAttribute('data-cms-edit');
          const val = item[field] !== undefined ? item[field] : '';
          if (el.tagName === 'IMG') {
            el.src = val;
          } else {
            el.innerHTML = val;
          }
        });
        // Add delay class for staggered animations
        clone.classList.add(`delay-${index * 75}`);
        container.appendChild(clone);
      });
    });

    // Special handling for logo: update all logo places
    const logoUrl = data.site?.logo_url;
    if (logoUrl) {
      document.querySelectorAll('.logo-icon img, .logo-img').forEach(img => {
        img.src = logoUrl;
      });
      // If using SVG placeholder inside .logo-icon, replace with image
      document.querySelectorAll('.logo-icon').forEach(icon => {
        if (!icon.querySelector('img')) {
          icon.innerHTML = `<img src="${logoUrl}" alt="Nookly" class="w-full h-full object-cover rounded-xl">`;
        }
      });
    }
  } catch (err) {
    console.error('CMS data loading failed:', err);
  }
}

// Helper to get nested value from dot-path
function getValueByPath(obj, path) {
  return path.split('.').reduce((o, k) => (o || {})[k], obj);
}

// Run on page load
document.addEventListener('DOMContentLoaded', loadCMSData);
