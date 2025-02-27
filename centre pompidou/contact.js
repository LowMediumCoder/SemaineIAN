
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier les préférences d'accessibilité
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        document.documentElement.classList.add('reduced-motion');
    }

    // Initialiser les animations de la grille Mondrian
    initMondrianGrid();
    
    // Gestion du formulaire multi-étapes
    initFormSteps();
    
    // Animation des champs du formulaire
    initFormFieldAnimations();
    
    // Validation du formulaire
    initFormValidation();
    
    // Menu mobile
    initMobileMenu();
    
    // Bouton de retour en haut
    initBackToTop();
});

/**
 * Initialisation des animations de grille Mondrian
 */
function initMondrianGrid() {
    const mondrianCells = document.querySelectorAll('.contact-hero-bg .mondrian-cell');
    
    mondrianCells.forEach((cell, index) => {
        // Retarder l'apparition pour une animation séquentielle
        setTimeout(() => {
            cell.style.opacity = '0';
            cell.style.transform = 'scale(0.9)';
            
            // Appliquer la transition seulement si la réduction de mouvement n'est pas activée
            if (!document.documentElement.classList.contains('reduced-motion')) {
                cell.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
            }
            
            // Animer l'apparition
            setTimeout(() => {
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
            }, 50);
        }, index * 50);
    });
}

/**
 * Initialisation des étapes du formulaire
 */
function initFormSteps() {
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const stepDots = document.querySelectorAll('.step-dot');
    const announcer = document.getElementById('form-announcer');
    
    // Progression vers l'étape suivante
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.getAttribute('data-step'));
            const currentStepElement = document.getElementById('step' + currentStep);
            const nextStepElement = document.getElementById('step' + (currentStep + 1));
            
            // Valider l'étape actuelle avant de progresser
            if (!validateStep(currentStep)) {
                // Annoncer les erreurs aux lecteurs d'écran
                const errors = currentStepElement.querySelectorAll('.form-field.error');
                if (errors.length > 0) {
                    // Construire un message d'erreur détaillé
                    let errorMessage = `Veuillez corriger les ${errors.length} erreurs suivantes : `;
                    errors.forEach((error, index) => {
                        const fieldName = error.querySelector('label').textContent;
                        const errorText = error.querySelector('.error-message').textContent;
                        errorMessage += `${index + 1}. ${fieldName}: ${errorText} `;
                    });
                    
                    // Annoncer l'erreur
                    announceMessage(errorMessage);
                    
                    // Mettre le focus sur le premier champ en erreur
                    const firstErrorInput = errors[0].querySelector('input, textarea, select');
                    if (firstErrorInput) {
                        firstErrorInput.focus();
                    }
                }
                return;
            }
            
            // Mettre à jour les étapes
            currentStepElement.classList.remove('active');
            currentStepElement.setAttribute('hidden', true);
            nextStepElement.classList.add('active');
            nextStepElement.removeAttribute('hidden');
            
            // Mettre à jour l'indicateur d'étape
            updateStepIndicator(currentStep + 1);
            
            // Si c'est la dernière étape, préparer le résumé
            if (currentStep + 1 === 3) {
                updateSummary();
            }
            
            // Annoncer le changement d'étape pour les lecteurs d'écran
            const stepHeading = nextStepElement.querySelector('h3').textContent;
            announceMessage(`Étape ${currentStep + 1} sur 3 : ${stepHeading}`);
            
            // Mettre le focus sur le premier élément interactif de la nouvelle étape
            const firstInput = nextStepElement.querySelector('input, select, textarea, button');
            if (firstInput) {
                setTimeout(() => {
                    firstInput.focus();
                }, 100);
            }
        });
    });
    
    // Retour à l'étape précédente
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.getAttribute('data-step'));
            const currentStepElement = document.getElementById('step' + currentStep);
            const prevStepElement = document.getElementById('step' + (currentStep - 1));
            
            // Mettre à jour les étapes
            currentStepElement.classList.remove('active');
            currentStepElement.setAttribute('hidden', true);
            prevStepElement.classList.add('active');
            prevStepElement.removeAttribute('hidden');
            
            // Mettre à jour l'indicateur d'étape
            updateStepIndicator(currentStep - 1);
            
            // Annoncer le changement d'étape
            const stepHeading = prevStepElement.querySelector('h3').textContent;
            announceMessage(`Retour à l'étape ${currentStep - 1} sur 3 : ${stepHeading}`);
            
            // Mettre le focus sur le premier élément interactif
            const firstInput = prevStepElement.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => {
                    firstInput.focus();
                }, 100);
            }
        });
    });
    
    // Navigation par les indicateurs d'étape
    stepDots.forEach(dot => {
        dot.addEventListener('click', function() {
            const targetStep = parseInt(this.getAttribute('data-step'));
            const currentStep = getCurrentStep();
            
            // Ne pas permettre de sauter des étapes non validées
            if (targetStep > currentStep && !validateStepsUpTo(currentStep)) {
                // Annoncer l'erreur
                announceMessage("Veuillez compléter l'étape actuelle avant de continuer.");
                return;
            }
            
            // Mettre à jour l'affichage des étapes
            document.querySelectorAll('.mondrian-form-step').forEach(step => {
                step.classList.remove('active');
                step.setAttribute('hidden', true);
            });
            
            const targetStepElement = document.getElementById('step' + targetStep);
            targetStepElement.classList.add('active');
            targetStepElement.removeAttribute('hidden');
            
            // Mettre à jour l'indicateur d'étape
            updateStepIndicator(targetStep);
            
            // Si c'est la dernière étape, préparer le résumé
            if (targetStep === 3) {
                updateSummary();
            }
            
            // Annoncer le changement d'étape
            const stepHeading = targetStepElement.querySelector('h3').textContent;
            announceMessage(`Navigation vers l'étape ${targetStep} sur 3 : ${stepHeading}`);
            
            // Mettre le focus sur le premier élément interactif
            const firstInput = targetStepElement.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => {
                    firstInput.focus();
                }, 100);
            }
        });
    });
    
    // Mise à jour de l'indicateur d'étape
    function updateStepIndicator(step) {
        stepDots.forEach((dot) => {
            const dotStep = parseInt(dot.getAttribute('data-step'));
            const isActive = dotStep === step;
            
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive);
        });
    }
    
    // Obtenir l'étape actuelle
    function getCurrentStep() {
        const activeStep = document.querySelector('.mondrian-form-step.active');
        return parseInt(activeStep.id.replace('step', ''));
    }
    
    // Valider toutes les étapes jusqu'à une étape spécifique
    function validateStepsUpTo(step) {
        let isValid = true;
        for (let i = 1; i <= step; i++) {
            if (!validateStep(i)) {
                isValid = false;
            }
        }
        return isValid;
    }
    
    // Mettre à jour le résumé à l'étape 3
    function updateSummary() {
        const firstName = document.getElementById('firstname').value;
        const lastName = document.getElementById('lastname').value;
        document.getElementById('summary-name').textContent = firstName + ' ' + lastName;
        
        document.getElementById('summary-email').textContent = document.getElementById('email').value;
        
        const phone = document.getElementById('phone').value;
        document.getElementById('summary-phone').textContent = phone ? phone : 'Non renseigné';
        
        const subjectSelect = document.getElementById('subject');
        const subjectText = subjectSelect.options[subjectSelect.selectedIndex].text;
        document.getElementById('summary-subject').textContent = subjectText;
        
        document.getElementById('summary-message').textContent = document.getElementById('message').value;
    }
    
    // Annoncer un message aux lecteurs d'écran
    function announceMessage(message) {
        announcer.textContent = message;
    }
}

/**
 * Animations des champs du formulaire
 */
function initFormFieldAnimations() {
    const formFields = document.querySelectorAll('.form-field input, .form-field textarea, .form-field select');
    
    formFields.forEach(field => {
        // Animation au focus
        field.addEventListener('focus', function() {
            const formField = this.closest('.form-field');
            formField.classList.add('focus');
        });
        
        // Retrait de l'animation au blur
        field.addEventListener('blur', function() {
            const formField = this.closest('.form-field');
            formField.classList.remove('focus');
            
            // Valider le champ lors de la perte de focus
            validateField(this);
        });
        
        // Changement de style quand le champ est rempli
        field.addEventListener('input', function() {
            const formField = this.closest('.form-field');
            if (this.value) {
                formField.classList.add('filled');
                
                // Réinitialiser l'état d'erreur lors de la modification
                formField.classList.remove('error');
                formField.classList.remove('valid');
                
                // Masquer le message d'erreur
                const errorElement = formField.querySelector('.error-message');
                if (errorElement) {
                    errorElement.textContent = '';
                }
                
                // Mettre à jour les attributs ARIA
                field.removeAttribute('aria-invalid');
            } else {
                formField.classList.remove('filled');
            }
        });
        
        // Gestion des touches pour l'accessibilité
        field.addEventListener('keydown', function(e) {
            // Validation à l'appui sur Entrée pour certains champs
            if (e.key === 'Enter' && this.tagName !== 'TEXTAREA') {
                validateField(this);
                
                // Passer au champ suivant si valide
                if (!this.closest('.form-field').classList.contains('error')) {
                    const allFields = Array.from(document.querySelectorAll('input, select, textarea, button'));
                    const currentIndex = allFields.indexOf(this);
                    const nextField = allFields[currentIndex + 1];
                    
                    if (nextField) {
                        e.preventDefault();
                        nextField.focus();
                    }
                }
            }
        });
    });
}

/**
 * Validation du formulaire
 */
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    const announcer = document.getElementById('form-announcer');
    
    // Validation à la soumission du formulaire
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Valider la dernière étape
        if (!validateStep(3)) {
            // Annoncer les erreurs
            const errors = contactForm.querySelectorAll('.form-field.error');
            if (errors.length > 0) {
                let errorMessage = `Veuillez corriger les ${errors.length} erreurs avant d'envoyer le formulaire.`;
                announcer.textContent = errorMessage;
                
                // Mettre le focus sur le premier champ en erreur
                const firstErrorInput = errors[0].querySelector('input, textarea, select');
                if (firstErrorInput) {
                    firstErrorInput.focus();
                }
            }
            return;
        }
        
        // Annoncer que le formulaire est en cours d'envoi
        announcer.textContent = "Envoi du formulaire en cours, veuillez patienter.";
        
        // Simuler l'envoi du formulaire
        simulateFormSubmission();
    });
    
    // Ajouter la validation à l'événement de changement
    const formInputs = contactForm.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('change', function() {
            validateField(this);
        });
    });
}

/**
 * Valide une étape spécifique du formulaire
 * @param {number} step - Le numéro de l'étape à valider
 * @returns {boolean} - Vrai si l'étape est valide, faux sinon
 */
function validateStep(step) {
    const stepElement = document.getElementById('step' + step);
    const fields = stepElement.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Valide un champ spécifique
 * @param {HTMLElement} field - Le champ à valider
 * @returns {boolean} - Vrai si le champ est valide, faux sinon
 */
function validateField(field) {
    const formField = field.closest('.form-field');
    const errorElement = formField.querySelector('.error-message');
    const labelText = formField.querySelector('label').textContent.replace(' *', '');
    let isValid = true;
    let errorMessage = '';
    
    // Réinitialiser les classes d'erreur
    formField.classList.remove('error');
    formField.classList.remove('valid');
    
    // Réinitialiser l'attribut ARIA
    field.removeAttribute('aria-invalid');
    
    // Validation de base des champs requis
    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        errorMessage = `Le champ ${labelText} est requis.`;
    } 
    // Validation spécifique pour l'email
    else if (field.type === 'email' && field.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(field.value)) {
            isValid = false;
            errorMessage = `Veuillez entrer une adresse email valide pour ${labelText}.`;
        }
    }
    // Validation spécifique pour le téléphone (si rempli)
    else if (field.type === 'tel' && field.value) {
        const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phonePattern.test(field.value)) {
            isValid = false;
            errorMessage = `Veuillez entrer un numéro de téléphone valide pour ${labelText}.`;
        }
    }
    // Validation spécifique pour le consentement
    else if (field.type === 'checkbox' && field.id === 'consent' && !field.checked) {
        isValid = false;
        errorMessage = 'Vous devez accepter la politique de confidentialité pour continuer.';
    }
    
    // Mettre à jour l'interface selon la validité
    if (!isValid) {
        formField.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
        
        // Animation d'erreur si la réduction de mouvement n'est pas activée
        if (!document.documentElement.classList.contains('reduced-motion')) {
            field.classList.add('shake');
            setTimeout(() => {
                field.classList.remove('shake');
            }, 600);
        }
    } else {
        formField.classList.add('valid');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    return isValid;
}

/**
 * Simulation de l'envoi du formulaire avec animation
 */
function simulateFormSubmission() {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.submit-btn');
    const successMessage = form.querySelector('.form-success-message');
    const announcer = document.getElementById('form-announcer');
    
    // Désactiver le bouton et afficher le loader
    submitBtn.disabled = true;
    form.classList.add('loader-active');
    
    // Simuler un délai de traitement
    setTimeout(() => {
        // Masquer le loader et afficher le message de succès
        form.classList.remove('loader-active');
        
        // Cacher les étapes du formulaire
        document.querySelectorAll('.mondrian-form-step').forEach(step => {
            step.classList.remove('active');
            step.setAttribute('hidden', true);
        });
        
        // Afficher le message de succès
        successMessage.classList.add('show');
        
        // Annoncer le succès pour les lecteurs d'écran
        announcer.textContent = "Félicitations ! Votre message a été envoyé avec succès. Nous vous répondrons dans les meilleurs délais.";
        
        // Mettre le focus sur le message de succès
        setTimeout(() => {
            successMessage.setAttribute('tabindex', '-1');
            successMessage.focus();
        }, 100);
        
        // Réinitialiser le formulaire après un certain délai
        setTimeout(() => {
            form.reset();
            document.querySelectorAll('.form-field').forEach(field => {
                field.classList.remove('valid');
                field.classList.remove('filled');
                field.classList.remove('error');
            });
        }, 2000);
    }, 2000);
}

/**
 * Initialisation du menu mobile
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMain = document.getElementById('nav-main');
    
    if (menuToggle && navMain) {
        menuToggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            navMain.classList.toggle('is-open');
            
            // Annoncer l'état du menu pour les lecteurs d'écran
            if (!expanded) {
                this.setAttribute('aria-label', 'Fermer le menu principal');
            } else {
                this.setAttribute('aria-label', 'Ouvrir le menu principal');
            }
        });
    }
}

/**
 * Initialisation du bouton "Retour en haut"
 */
function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('is-visible');
                backToTopButton.setAttribute('aria-hidden', 'false');
            } else {
                backToTopButton.classList.remove('is-visible');
                backToTopButton.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Gestion de l'événement de clic
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Comportement adapté aux préférences de réduction de mouvement
            if (document.documentElement.classList.contains('reduced-motion')) {
                window.scrollTo(0, 0);
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            
            // Mettre le focus sur le titre principal
            setTimeout(() => {
                document.querySelector('h1').focus();
            }, 500);
        });
    }
}
