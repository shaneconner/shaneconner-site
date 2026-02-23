// Mark gallery items with multiple photos
document.querySelectorAll('.gallery-item[data-gallery]').forEach(item => {
  const imgs = item.dataset.gallery.split(',');
  if (imgs.length > 1) item.classList.add('has-multi');
});

// Auto-calculate gallery count (excluding sold and wip)
const availableCount = document.querySelectorAll('#works .gallery-item:not(.sold):not(.wip)').length;
document.getElementById('gallery-count').textContent = availableCount + ' paintings available';

// Lightbox with gallery support
let galleryImages = [];
let galleryIndex = 0;

function openLightbox(item) {
  const img = item.querySelector('img');
  const title = item.querySelector('h3').textContent;
  const details = item.querySelector('.details').textContent;
  const lightbox = document.getElementById('lightbox');
  const gallerySrc = item.dataset.gallery;

  document.getElementById('lightbox-img').src = img.src;
  document.getElementById('lightbox-title').textContent = title;
  document.getElementById('lightbox-details').textContent = details;

  if (gallerySrc) {
    galleryImages = gallerySrc.split(',');
    galleryIndex = 0;
    const isMulti = galleryImages.length > 1;
    lightbox.classList.toggle('has-gallery', isMulti);
    if (isMulti) {
      buildThumbs();
      updateCounter();
    } else {
      document.getElementById('lightbox-thumbs').innerHTML = '';
    }
  } else {
    galleryImages = [];
    galleryIndex = 0;
    lightbox.classList.remove('has-gallery');
    document.getElementById('lightbox-thumbs').innerHTML = '';
  }

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function buildThumbs() {
  const container = document.getElementById('lightbox-thumbs');
  container.innerHTML = '';
  galleryImages.forEach((src, i) => {
    const thumb = document.createElement('img');
    thumb.src = src;
    thumb.className = 'lightbox-thumb' + (i === 0 ? ' active' : '');
    thumb.onclick = (e) => { e.stopPropagation(); goToSlide(i); };
    container.appendChild(thumb);
  });
}

function updateCounter() {
  document.getElementById('lightbox-counter').textContent =
    (galleryIndex + 1) + ' / ' + galleryImages.length;
}

function goToSlide(i) {
  galleryIndex = i;
  const newSrc = galleryImages[i];
  document.getElementById('lightbox-img').src = newSrc;
  document.querySelectorAll('.lightbox-thumb').forEach((t, idx) => {
    t.classList.toggle('active', idx === i);
  });
  updateCounter();
  // Show WIP caption with sequence
  const filename = newSrc.split('/').pop();
  const detailsEl = document.getElementById('lightbox-details');
  const baseDetails = detailsEl.dataset.base || detailsEl.textContent;
  detailsEl.dataset.base = baseDetails;
  if (filename.startsWith('wip_')) {
    const wipImages = galleryImages.filter(s => s.split('/').pop().startsWith('wip_'));
    const wipIndex = wipImages.indexOf(newSrc) + 1;
    const wipTotal = wipImages.length;
    detailsEl.textContent = 'Work in Progress' + (wipTotal > 1 ? ' · ' + wipIndex + ' of ' + wipTotal : '');
  } else {
    detailsEl.textContent = baseDetails;
  }
}

function navigateLightbox(dir) {
  if (!galleryImages.length) return;
  galleryIndex = (galleryIndex + dir + galleryImages.length) % galleryImages.length;
  goToSlide(galleryIndex);
}

function closeLightbox(e) {
  const t = e.target;
  if (t.id === 'lightbox' || t.classList.contains('lightbox-close') || t.id === 'lightbox-main') {
    document.getElementById('lightbox').classList.remove('active', 'has-gallery');
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') {
    lightbox.classList.remove('active', 'has-gallery');
    document.body.style.overflow = '';
  } else if (e.key === 'ArrowLeft') {
    navigateLightbox(-1);
  } else if (e.key === 'ArrowRight') {
    navigateLightbox(1);
  }
});

// Inquire mailto generator
function inquire(el) {
  event.stopPropagation();
  const item = el.closest('.gallery-item');
  const name = item.querySelector('h3').textContent;
  const details = item.querySelector('.details').textContent;
  const price = item.querySelector('.price').textContent;
  const subject = encodeURIComponent('Inquiry: ' + name);
  const body = encodeURIComponent(
    'Hi Shane,\n\n' +
    'I\'m interested in "' + name + '".\n\n' +
    name + '\n' +
    details + '\n' +
    price + '\n\n' +
    'Could you share more details?'
  );
  window.location.href = 'mailto:shane@shaneconner.com?subject=' + subject + '&body=' + body;
  return false;
}

// Touch/swipe navigation
let touchState = { startX: 0, startY: 0, endX: 0, endY: 0 };
const lightboxMain = document.getElementById('lightbox-main');

lightboxMain.addEventListener('touchstart', (e) => {
  touchState.startX = e.changedTouches[0].screenX;
  touchState.startY = e.changedTouches[0].screenY;
}, { passive: true });

lightboxMain.addEventListener('touchend', (e) => {
  touchState.endX = e.changedTouches[0].screenX;
  touchState.endY = e.changedTouches[0].screenY;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const deltaX = touchState.endX - touchState.startX;
  const deltaY = touchState.endY - touchState.startY;
  const minSwipeDistance = 50;

  // Only trigger if horizontal swipe is dominant
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
    if (deltaX > 0) {
      // Swipe right = previous
      navigateLightbox(-1);
    } else {
      // Swipe left = next
      navigateLightbox(1);
    }
  }
}
