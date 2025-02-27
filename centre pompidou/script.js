/**
 * SCRIPT PRINCIPAL DU CENTRE POMPIDOU
 * Animations artistiques, interactions et accessibilité
 * 
 * Ce script gère toutes les animations inspirées par Mondrian
 * tout en respectant les standards d'accessibilité WCAG 2.1
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialisation des fonctionnalités
  initAccessibility();
  initMondrianGridAnimation();
  initLineDrawingAnimation();
  initColorFillAnimation();
  initSectionTransitions();
  initParallaxEffects();
  initNavigationEnhancements();
  initMobileInteractions();
  initButtonAnimations();
  setupBackToTop();
});

/**
 * Initialisation des fonctionnalités d'accessibilité
 * Détecte les préférences utilisateur et adapte l'expérience
 */
function initAccessibility() {
  // Détecter la préférence de réduction de mouvement
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  if (prefersReducedMotion.matches) {
    // Désactiver toutes les animations si l'utilisateur préfère réduire les mouvements
    document.documentElement.classList.add('reduced-motion');
  }
  
  // Surveiller les changements de préférence
  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  });
  
  // Améliorer la navigation au clavier
  const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  
  focusableElements.forEach(element => {
    // Ajouter une classe pour améliorer la visibilité lors de la navigation au clavier
    element.addEventListener('focus', function() {
      this.classList.add('keyboard-focus');
      
      // Ajouter une classe au parent pour les effets contextuels
      const parent = this.closest('.gallery-item, .mondrian-card, .exposition-feature');
      if (parent) {
        parent.classList.add('focus-within');
      }
    });
    
    element.addEventListener('blur', function() {
      this.classList.remove('keyboard-focus');
      
      // Retirer la classe du parent
      const parent = this.closest('.gallery-item, .mondrian-card, .exposition-feature');
      if (parent) {
        parent.classList.remove('focus-within');
      }
    });
  });
  
  // S'assurer que les éléments skip-link fonctionnent correctement
  const skipLinks = document.querySelectorAll('.skip-link');
  
  skipLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        targetElement.focus();
        targetElement.scrollIntoView({behavior: 'smooth'});
      }
    });
  });
  
  // Rendre les descriptions d'images accessibles
  const images = document.querySelectorAll('img:not([aria-hidden="true"])');
  
  images.forEach(img => {
    // Ajouter rôle img si absent
    if (!img.getAttribute('role')) {
      img.setAttribute('role', 'img');
    }
    
    // S'assurer que toutes les images ont un texte alternatif
    if (!img.hasAttribute('alt')) {
      console.warn('Image sans attribut alt détectée:', img);
      img.setAttribute('alt', '');
    }
  });
}

/**
 * Animation des grilles Mondrian au défilement
 * Construit progressivement les éléments de la grille
 */
function initMondrianGridAnimation() {
  // Sélectionne toutes les grilles et cellules Mondrian
  const mondrianGrids = document.querySelectorAll('.hero-mondrian-bg, .mondrian-grid');
  
  if (!mondrianGrids.length) return;

  // Options pour l'Intersection Observer
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  // Créer l'observer pour les grilles
  const gridObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateMondrianGrid(entry.target);
        gridObserver.unobserve(entry.target);
      }
    });
  }, options);

  // Observer chaque grille
  mondrianGrids.forEach(grid => {
    // Préparer chaque cellule pour l'animation
    const cells = grid.querySelectorAll('.mondrian-cell, .logo-grid-cell, [class*="mondrian-cell-"]');
    cells.forEach((cell, index) => {
      // Ajouter des classes et styles pour les animations
      cell.classList.add('mondrian-animated-cell');
      cell.style.opacity = '0';
      // Stocker l'index pour l'animation séquentielle
      cell.dataset.index = index;
    });
    
    // Attribuer des couleurs aléatoires à certaines cellules blanches
    const emptyCells = Array.from(cells).filter(cell => 
      !cell.classList.contains('red') && 
      !cell.classList.contains('blue') && 
      !cell.classList.contains('yellow') &&
      !cell.classList.contains('purple') &&
      !cell.classList.contains('green') &&
      !cell.classList.contains('orange'));
    
    if (emptyCells.length) {
      // Sélectionner aléatoirement quelques cellules pour ajouter des couleurs
      const numCellsToColor = Math.floor(emptyCells.length * 0.2); // 20% des cellules vides
      
      for (let i = 0; i < numCellsToColor; i++) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const cell = emptyCells[randomIndex];
        
        // Attribuer une couleur aléatoire
        const colorOptions = ['red', 'blue', 'yellow', 'purple', 'green', 'orange'];
        const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        
        cell.classList.add(randomColor);
        
        // Retirer la cellule de la liste pour éviter de la sélectionner à nouveau
        emptyCells.splice(randomIndex, 1);
      }
    }
    
    gridObserver.observe(grid);
  });
}

/**
 * Anime une grille Mondrian spécifique
 * @param {HTMLElement} grid - L'élément de grille à animer
 */
function animateMondrianGrid(grid) {
  const cells = grid.querySelectorAll('.mondrian-animated-cell');
  const isHeroGrid = grid.classList.contains('hero-mondrian-bg');
  
  // Durée de base et délai pour l'animation
  const baseDuration = isHeroGrid ? 2000 : 1200; // ms
  const baseDelay = isHeroGrid ? 30 : 50; // ms
  
  cells.forEach(cell => {
    const index = parseInt(cell.dataset.index);
    
    // Calcul du délai (différent selon le type de grille)
    let delay;
    if (isHeroGrid) {
      // Animation semi-aléatoire pour la grille héro
      delay = baseDelay * (index % 12) + Math.random() * 500;
    } else {
      // Animation séquentielle pour les autres grilles
      delay = baseDelay * index;
    }
    
    // Animation d'apparition progressive avec différentes propriétés
    setTimeout(() => {
      // Vérifier si la réduction de mouvement est activée
      if (!document.documentElement.classList.contains('reduced-motion')) {
        // Apparition avec "scale" pour un effet de construction
        cell.style.transition = `opacity 0.7s ease-out, transform 0.7s ease-out, background-color 0.5s ease-in-out`;
        cell.style.opacity = '1';
        
        // Animation différente selon la présence d'une couleur
        if (cell.classList.contains('red') || cell.classList.contains('blue') || 
            cell.classList.contains('yellow') || cell.classList.contains('purple') || 
            cell.classList.contains('green') || cell.classList.contains('orange') || 
            cell.classList.contains('red-block') || cell.classList.contains('blue-block') || 
            cell.classList.contains('yellow-block') || cell.classList.contains('purple-block') || 
            cell.classList.contains('green-block') || cell.classList.contains('orange-block')) {
          // Effet de "remplissage" pour les cellules colorées
          cell.style.transform = 'scale(1)';
        } else {
          // Simple apparition pour les cellules blanches
          cell.style.transform = 'none';
        }
      } else {
        // Version sans animation pour la préférence de réduction de mouvement
        cell.style.opacity = '1';
        cell.style.transform = 'none';
      }
    }, delay);
  });
}

/**
 * Animation de dessin des lignes type Mondrian
 * Dessine progressivement les bordures noires caractéristiques
 */
function initLineDrawingAnimation() {
  // Sélectionne les éléments qui auront des bordures animées
  const elements = document.querySelectorAll('.mondrian-card, .section-title-mondrian, .gallery-item, .artwork-feature');
  
  if (!elements.length) return;
  
  // Ajouter des pseudo-éléments pour dessiner les bordures
  elements.forEach(element => {
    element.classList.add('draw-border-animation');
  });
  
  // Observer quand les éléments entrent dans la vue
  const lineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Vérifier la préférence de réduction de mouvement
        if (!document.documentElement.classList.contains('reduced-motion')) {
          entry.target.classList.add('draw-border-animate');
        } else {
          // Montrer instantanément les bordures
          entry.target.classList.add('draw-border-instant');
        }
        lineObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });
  
  // Observer chaque élément
  elements.forEach(element => {
    lineObserver.observe(element);
  });
}

/**
 * Animation de remplissage des couleurs
 * Fait apparaître progressivement les couleurs primaires de Mondrian
 */
function initColorFillAnimation() {
  // Sélectionne les éléments avec des couleurs à animer
  const colorElements = document.querySelectorAll('.red, .blue, .yellow, .purple, .green, .orange, .red-block, .blue-block, .yellow-block, .purple-block, .green-block, .orange-block');
  
  if (!colorElements.length) return;
  
  colorElements.forEach(element => {
    // Stocker la couleur originale
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    
    // Ne pas animer si la réduction de mouvement est active
    if (!document.documentElement.classList.contains('reduced-motion')) {
      // Préparer pour l'animation
      element.style.backgroundColor = 'white';
      element.classList.add('color-fill-animation');
      element.dataset.targetColor = backgroundColor;
    }
  });
  
  // Observer quand les éléments entrent dans la vue
  const colorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!document.documentElement.classList.contains('reduced-motion')) {
          animateColorFill(entry.target);
        }
        colorObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3
  });
  
  // Observer chaque élément
  colorElements.forEach(element => {
    colorObserver.observe(element);
  });
}

/**
 * Anime le remplissage de couleur d'un élément
 * @param {HTMLElement} element - L'élément à animer
 */
function animateColorFill(element) {
  // Animation de la transition de blanc vers la couleur cible
  setTimeout(() => {
    element.style.transition = 'background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    element.style.backgroundColor = element.dataset.targetColor;
  }, 150);
}

/**
 * Transitions animées entre les sections
 * Effets visuels au défilement entre les sections
 */
function initSectionTransitions() {
  const sections = document.querySelectorAll('section');
  
  if (!sections.length) return;
  
  // Ne pas ajouter d'effets de transition si la réduction de mouvement est active
  if (document.documentElement.classList.contains('reduced-motion')) return;
  
  // Ajouter des effets de transition entre les sections
  sections.forEach((section, index) => {
    if (index === 0) return; // Ignorer la première section (héro)
    
    // Créer un élément de transition entre les sections
    const transitionElement = document.createElement('div');
    transitionElement.classList.add('section-transition');
    transitionElement.setAttribute('aria-hidden', 'true');
    
    // Style différent selon la parité de l'index pour varier les animations
    if (index % 2 === 0) {
      transitionElement.classList.add('transition-horizontal');
    } else {
      transitionElement.classList.add('transition-diagonal');
    }
    
    // Insérer l'élément de transition
    section.parentNode.insertBefore(transitionElement, section);
    
    // Animation de la transition au scroll
    const transitionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('transition-animate');
        }
      });
    }, {
      threshold: 0.5
    });
    
    transitionObserver.observe(transitionElement);
  });
  
  // Ajouter des animations d'entrée pour les contenus des sections
  sections.forEach(section => {
    // Sélectionner les éléments à animer dans la section
    const elementsToAnimate = section.querySelectorAll('h2, h3, p, .btn-primary, .btn-secondary, .btn-outline, .btn-yellow, .btn-green, .btn-purple, .btn-orange, .mondrian-card, .gallery-item');
    
    // Ajouter les classes pour l'animation
    elementsToAnimate.forEach((element, index) => {
      element.classList.add('section-content-animation');
      element.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Observer la section pour déclencher les animations
    const contentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const animElements = entry.target.querySelectorAll('.section-content-animation');
          animElements.forEach(el => {
            el.classList.add('animate-in');
          });
          contentObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    contentObserver.observe(section);
  });
}

/**
 * Effet parallaxe sur les images et éléments
 * Mouvement subtil au défilement pour un effet de profondeur
 */
function initParallaxEffects() {
  // Ne pas initialiser si la réduction de mouvement est active
  if (document.documentElement.classList.contains('reduced-motion')) return;
  
  // Sélectionner les images et éléments pour l'effet parallaxe
  const parallaxElements = document.querySelectorAll('.main-image, .exposition-feature img, .artwork-feature img');
  
  if (!parallaxElements.length) return;
  
  // Ajouter les classes pour le parallaxe
  parallaxElements.forEach(element => {
    element.classList.add('parallax-element');
    
    // Wrapper l'élément pour l'effet de parallaxe
    const wrapper = document.createElement('div');
    wrapper.classList.add('parallax-wrapper');
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
  });
  
  // Gérer l'effet de parallaxe au scroll
  window.addEventListener('scroll', () => {
    // Ne pas exécuter si la réduction de mouvement est activée
    if (document.documentElement.classList.contains('reduced-motion')) return;
    
    const scrollPosition = window.pageYOffset;
    
    document.querySelectorAll('.parallax-element').forEach(element => {
      const elementPosition = element.getBoundingClientRect().top + scrollPosition;
      const offset = scrollPosition - elementPosition;
      const parallaxFactor = 0.15; // Intensité de l'effet
      
      if (window.innerHeight + scrollPosition > elementPosition && 
          scrollPosition < elementPosition + element.offsetHeight) {
        element.style.transform = `translateY(${offset * parallaxFactor}px)`;
      }
    });
  }, { passive: true });
}

/**
 * Amélioration de la navigation et des interactions
 * Gestion du menu mobile, des boutons, etc.
 */
function initNavigationEnhancements() {
  // Menu mobile
  const menuToggle = document.getElementById('menu-toggle');
  const navMain = document.getElementById('nav-main');
  
  if (menuToggle && navMain) {
    menuToggle.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      navMain.classList.toggle('is-open');
      
      // Gérer le focus pour l'accessibilité
      if (!expanded) {
        // Menu vient d'être ouvert, mettre le focus sur le premier élément
        const firstItem = navMain.querySelector('a');
        if (firstItem) {
          firstItem.focus();
        }
      }
    });
    
    // Fermer le menu en cliquant en dehors
    document.addEventListener('click', function(e) {
      if (navMain.classList.contains('is-open') && 
          !navMain.contains(e.target) && 
          e.target !== menuToggle && 
          !menuToggle.contains(e.target)) {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMain.classList.remove('is-open');
      }
    });
    
    // Fermer le menu avec la touche Échap
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navMain.classList.contains('is-open')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMain.classList.remove('is-open');
        menuToggle.focus();
      }
    });
  }
  
  // Smooth scroll pour les ancres
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').substring(1);
      
      // Ne rien faire si c'est juste un lien "#"
      if (targetId === '') return;
      
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Fermer le menu mobile si ouvert
        if (navMain && navMain.classList.contains('is-open')) {
          menuToggle.setAttribute('aria-expanded', 'false');
          navMain.classList.remove('is-open');
        }
        
        // Lisse pour les utilisateurs qui n'ont pas activé la réduction de mouvement
        const behavior = document.documentElement.classList.contains('reduced-motion') ? 'auto' : 'smooth';
        
        // Scroll doux vers la cible
        window.scrollTo({
          top: targetElement.offsetTop - 100, // Offset pour la barre de navigation fixe
          behavior: behavior
        });
        
        // Mettre le focus sur l'élément pour l'accessibilité
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus();
        
        // Mettre à jour l'URL (optionnel)
        if (history.pushState) {
          history.pushState(null, null, `#${targetId}`);
        }
      }
    });
  });
  
  // Navigation active au scroll
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (window.pageYOffset >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });
    
    if (current) {
      // Mettre à jour les liens actifs dans la navigation
      document.querySelectorAll('#nav-main a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }
  }, { passive: true });
}

/**
 * Interactions spécifiques aux appareils mobiles
 * Optimisations pour l'expérience tactile
 */
function initMobileInteractions() {
  // Détecter si c'est un appareil tactile
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouchDevice) {
    document.documentElement.classList.add('touch-device');
    
    // Ajuster les interactions pour les galeries
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
      item.addEventListener('touchstart', function() {
        // Retirer la classe des autres éléments
        galleryItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('touch-focus');
          }
        });
        
        // Ajouter la classe à cet élément
        this.classList.add('touch-focus');
      });
      
      // Permettre le toucher en dehors pour fermer
      document.addEventListener('touchstart', function(e) {
        if (!item.contains(e.target)) {
          item.classList.remove('touch-focus');
        }
      });
    });
    
    // Améliorer l'interaction tactile pour les cards
    const cards = document.querySelectorAll('.mondrian-card');
    cards.forEach(card => {
      card.addEventListener('touchstart', function() {
        this.classList.add('touch-active');
      });
      
      card.addEventListener('touchend', function() {
        setTimeout(() => {
          this.classList.remove('touch-active');
        }, 300);
      });
    });
  }
}

/**
 * Animations spéciales pour les boutons
 * Effets visuels pour les interactions utilisateur
 */
function initButtonAnimations() {
  // Ne pas animer si la réduction de mouvement est active
  if (document.documentElement.classList.contains('reduced-motion')) return;
  
  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline, .btn-yellow, .btn-green, .btn-purple, .btn-orange');
  
  buttons.forEach(button => {
    // Effet d'ondulation au clic
    button.addEventListener('click', function(e) {
      // Créer un élément pour l'effet d'ondulation
      const ripple = document.createElement('span');
      ripple.classList.add('btn-ripple-effect');
      
      this.appendChild(ripple);
      
      // Positionner l'effet là où le clic a eu lieu
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      // Supprimer l'élément après l'animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
    
    // Effet de survol amélioré
    button.addEventListener('mouseenter', function() {
      this.classList.add('btn-hover');
    });
    
    button.addEventListener('mouseleave', function() {
      this.classList.remove('btn-hover');
    });
  });
}

/**
 * Configuration du bouton "Retour en haut"
 * Apparaît au défilement et permet de remonter en haut de la page
 */
function setupBackToTop() {
  const backToTopButton = document.querySelector('.back-to-top');
  
  if (!backToTopButton) return;
  
  // Afficher/masquer le bouton en fonction du défilement
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('is-visible');
    } else {
      backToTopButton.classList.remove('is-visible');
    }
  }, { passive: true });
  
  // Ajouter l'action de défilement au clic
  backToTopButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Lisse pour les utilisateurs qui n'ont pas activé la réduction de mouvement
    const behavior = document.documentElement.classList.contains('reduced-motion') ? 'auto' : 'smooth';
    
    window.scrollTo({
      top: 0,
      behavior: behavior
    });
    
    // Mettre le focus sur le premier élément important
    const mainHeading = document.querySelector('h1');
    if (mainHeading) {
      mainHeading.focus();
    }
  });
}

/**
 * Amélioration des titres de section style Mondrian
 * Effet d'écriture et de construction
 */
function initSectionTitles() {
  // Ne pas animer si la réduction de mouvement est active
  if (document.documentElement.classList.contains('reduced-motion')) return;
  
  const sectionTitles = document.querySelectorAll('.section-title-mondrian');
  
  if (!sectionTitles.length) return;
  
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animation du titre
        entry.target.classList.add('title-animate');
        
        // Animation de la ligne sous le titre
        setTimeout(() => {
          entry.target.classList.add('line-animate');
        }, 500);
        
        titleObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });
  
  sectionTitles.forEach(title => {
    titleObserver.observe(title);
  });
}

/**
 * Détection de contraste insuffisant et ajustement automatique
 * Améliore l'accessibilité des textes sur les fonds colorés
 */
function enhanceTextContrast() {
  // Éléments avec texte qui pourraient avoir des problèmes de contraste
  const elementsToCheck = document.querySelectorAll('.mondrian-card, [class*="-block"], .gallery-item-info');
  
  elementsToCheck.forEach(element => {
    const bgColor = window.getComputedStyle(element).backgroundColor;
    
    // Extraire les composantes RVB (simplifié pour cet exemple)
    const rgbValues = bgColor.match(/\d+/g);
    
    if (rgbValues && rgbValues.length >= 3) {
      const r = parseInt(rgbValues[0]);
      const g = parseInt(rgbValues[1]);
      const b = parseInt(rgbValues[2]);
      
      // Calculer la luminosité (formule simplifiée)
      // Une formule plus précise tiendrait compte de la perception humaine
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      // Si la luminosité est faible (fond sombre), utiliser du texte clair
      if (brightness < 128) {
        element.classList.add('light-text');
      } else {
        element.classList.add('dark-text');
      }
    }
  });
}

/**
 * Initialise toutes les animations artistiques
 * Appel des fonctions d'initialisation au chargement du document
 */
document.addEventListener('DOMContentLoaded', function() {
  // Vérifier les préférences d'accessibilité en premier
  initAccessibility();
  
  // Initialiser les autres fonctionnalités en fonction des préférences
  initMondrianGridAnimation();
  initLineDrawingAnimation();
  initColorFillAnimation();
  initSectionTransitions();
  initParallaxEffects();
  initSectionTitles();
  enhanceTextContrast();
  
  // Fonctionnalités interactives
  initNavigationEnhancements();
  initMobileInteractions();
  initButtonAnimations();
  setupBackToTop();
  
  // Classe d'animation globale
  document.body.classList.add('animations-ready');
  
  // Événement personnalisé quand tout est initialisé
  document.dispatchEvent(new CustomEvent('mondrian-animations-ready'));
});

/**
 * Surveillance des changements de préférence utilisateur
 * Ajuste l'expérience en temps réel
 */
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
  enhanceTextContrast();
});

/**
 * Surveillance du redimensionnement de la fenêtre
 * Adapte les animations et les interactions
 */
let resizeTimer;
window.addEventListener('resize', function() {
  // Limiter la fréquence des appels lors du redimensionnement
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    // Réajuster les éléments si nécessaire
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    parallaxElements.forEach(element => {
      element.style.transform = 'none';
    });
  }, 250);
}, { passive: true });