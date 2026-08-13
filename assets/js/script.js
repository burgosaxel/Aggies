document.addEventListener('DOMContentLoaded',function(){
  // year
  document.getElementById('year').textContent = new Date().getFullYear();

  // mobile nav
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  navToggle && navToggle.addEventListener('click',()=>{
    mainNav.classList.toggle('open');
  })

  // close menu when a link is clicked
  const navLinks = document.querySelectorAll('#main-nav a, .footer-nav a');
  const mobileNavQuery = window.matchMedia('(max-width: 900px)');
  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      if(link.closest('#main-nav')) mainNav.classList.remove('open');
      if(!mobileNavQuery.matches) return;

      const hash = link.getAttribute('href');
      if(!hash || !hash.startsWith('#')) return;

      const section = document.querySelector(hash);
      const heading = section && section.querySelector('h2, h3');
      const scrollTarget = heading || section;
      if(!scrollTarget) return;

      event.preventDefault();
      window.history.pushState(null, '', hash);
      window.requestAnimationFrame(() => {
        const top = scrollTarget.getBoundingClientRect().top + window.scrollY - 8;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  });

  // flavors search using local flavor lists
  const flavorGrid = document.getElementById('flavor-grid');
  const searchInput = document.getElementById('flavor-search');

  const flavorCategories = {
    "Hand Serve": [
      "Vanilla","French Vanilla","Chocolate","Coffee","Chocolate Chip","Totally Turtle","Butter Crunch","Snickers","Milky Way","M&M","Almond Joy","Bubble Gum","Moose Tracks","Strawberry","Phantomberry","Cherry Vanilla","Banana","Frozen Pudding","Rum Raisin","Coconut","Grapenut","Rocky Road","Ginger","Cake Batter","Campfire S’Mores","Caramel Caribou","Cherry Blossom","Fly Fishing Fudge","Moo-slide","Apple Pie","Apple Crisp","Pumpkin","Mint Choco Chip","Muddy Boots","Peanut Butter Pie","Pistachio","Power Play Fudge","Southern Peach","Toasted Coconut","Vanilla Bean","Kahlua Chip","Cappuccino Chip","Monster Mash","Brownie Batter","Extreme Chocolate","Minty MooseTracks","Choco MooseTracks","Magical Unicorn","Banana Pudding","Superman","Playdough","Great Balls of Fire","Banana Walnut Fudge","Double Dutch Chocolate","Cold Brew","Caramocha","Dark Chocolate","Rasp Truffle","Fudge Ripple","Cookie Dough","Toll House Cookie","Oreo","Coffee Oreo","Peanut Butter Oreo","Coffee Kahlua Brownie","Maple Walnut","Peppermint Stick","Cotton Candy","Dinosaur Crunch","Black Raspberry","Red Raspberry Chip","Orange Pineapple","German Choc Cake","Green Monster","Choco Peanut Butter","Blueberry Pie","Reese’s PB","Cheesecake","Death By Chocolate","Choc Walnut Fudge","Freedom of Espresso","Choc Lovers Choc","Cranberry Choc Chip Nut","Sea Salt Caramel Truffle","I Scream for Cake","Maine Black Bear","Maine Lobster Tracks","Maine Wild Blueberry","Mississippi Mud Pie","Brown Butter Bourbon Truffle","Cappuccino Crunch","PB Caramel Cookie Dough","Graham Central Station","Mocha Almond Fudge","Butter Pecan","Honey Roasted PB","Peanut Butter Pretzel","Salted Caramel","Bananas Foster","Blueberry Parfait"
    ],
    "Dairy-Free Sorbet": ["Lemon","Mango","Raspberry","Blueberry Pomegranate","Strawberry Lemonade"],
    "Frozen Yogurt": ["Coffee Heath Bar","Chocolate Almond","Mint Patty","Cookie Dough","Purple Cow","Oreo","Pistachio","Lemon Wafer Cookie","Milky Way","French Vanilla","Moose Tracks","Chocolate Peanut Butter","Chocolate","Chocolate Chip","Blueberry Oat Crumble","Black Raspberry"],
    "Sherbet": ["Orange","Watermelon","Rainbow"],
    "No Sugar Added": ["Moosetracks","Coffee","Vanilla","Maple Walnut","Caramel Pecan","Black Raspberry"],
    "Soft Serve": ["Vanilla","Twist","Black Raspberry","Marshwood Mix","Chocolate","Coffee"],
    "Flavor Burst": ["Blue Goo","Bubble Gum","Root Beer","Creamsicle","Green Apple","Butter Pecan","Blueberry","Birthday Cake","Maple"]
  };

  // flatten to array of {name,category}
  const flavors = Object.entries(flavorCategories).reduce((arr,[category,list])=>{
    list.forEach(name=>arr.push({name,category}));
    return arr;
  },[]);

  function renderSearchResults(results){
    flavorGrid.innerHTML = '';
    if(!results.length){
      flavorGrid.innerHTML = '<p>No matching flavors found. Try another name.</p>';
      return;
    }
    results.forEach(f=>{
      const card = document.createElement('div');
      card.className = 'flavor-card';
      const title = document.createElement('h4'); title.textContent = f.name;
      const meta = document.createElement('div'); meta.className = 'badges';
      // f.categories is an array of category strings
      meta.innerHTML = (f.categories||[]).map(c=>`<span class="badge">${c}</span>`).join(' ');
      card.appendChild(title);
      card.appendChild(meta);
      card.addEventListener('click',()=>{ navigator.clipboard && navigator.clipboard.writeText(f.name); alert(`${f.name} (${(f.categories||[]).join(', ')}) — copied to clipboard`); });
      flavorGrid.appendChild(card);
    })
  }

  searchInput && searchInput.addEventListener('input',(e)=>{
    const q = e.target.value.trim().toLowerCase();
    if(!q){ flavorGrid.innerHTML = '<p>Type a flavor name to find where it appears on the menu.</p>'; return; }
    const raw = flavors.filter(f=>f.name.toLowerCase().includes(q));
    // aggregate categories for duplicate flavor names
    const map = new Map();
    raw.forEach(item=>{
      const key = item.name;
      if(!map.has(key)) map.set(key,{name: item.name, categories: new Set()});
      map.get(key).categories.add(item.category);
    });
    const deduped = Array.from(map.values()).map(v=>({name: v.name, categories: Array.from(v.categories)}));
    renderSearchResults(deduped);
  });

  // initial instruction
  if(flavorGrid && searchInput && !searchInput.value){
    flavorGrid.innerHTML = '<p>Type a flavor name to find where it appears on the menu.</p>';
  }

  // placeholder reviews: owner should supply approved reviews or use an integration
  const reviewCards = document.getElementById('review-cards');
  if(reviewCards) reviewCards.innerHTML = `<div class="flavor-card">“Huge flavor selection and generous portions — a must when in town.”<br><strong>— Local visitor</strong></div>`;


  // Simple intersection observer to animate sections into view
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in-view');
      }
    })
  },{threshold:0.12});

  document.querySelectorAll('.section').forEach(s=>observer.observe(s));

  // Parallax effect for hero image (lightweight)
  const heroImg = document.querySelector('.hero-media img');
  let latestScroll = 0; let ticking = false;
  function onScroll(){
    latestScroll = window.scrollY;
    if(!ticking){
      window.requestAnimationFrame(()=>{
        if(heroImg){
          const move = Math.min(60, latestScroll * 0.08);
          heroImg.style.transform = `translateY(${move}px) scale(1.02)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll',onScroll,{passive:true});

  // subtle click feedback for CTAs
  document.querySelectorAll('.btn').forEach(b=>{
    b.addEventListener('click',()=>{ b.classList.add('active-press'); setTimeout(()=>b.classList.remove('active-press'),180) })
  })

  const galleryImages = Array.from(document.querySelectorAll('.gallery-image'));
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const closeButton = document.querySelector('.lightbox-close');
  const prevButton = document.querySelector('.lightbox-prev');
  const nextButton = document.querySelector('.lightbox-next');
  let activeGalleryIndex = 0;

  function openLightbox(index){
    if(!galleryImages.length) return;
    activeGalleryIndex = index;
    const img = galleryImages[index];
    if(!img) return;
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  function showNextImage(step){
    if(!galleryImages.length) return;
    activeGalleryIndex = (activeGalleryIndex + step + galleryImages.length) % galleryImages.length;
    openLightbox(activeGalleryIndex);
  }

  galleryImages.forEach((img, index)=>{
    img.addEventListener('click', () => openLightbox(index));
  });

  closeButton.addEventListener('click', closeLightbox);
  prevButton.addEventListener('click', () => showNextImage(-1));
  nextButton.addEventListener('click', () => showNextImage(1));

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showNextImage(-1);
    if (event.key === 'ArrowRight') showNextImage(1);
  });
});

