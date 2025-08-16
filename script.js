// Mirror Web - Professional Screen Projection Software
// Enhanced JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeLoader();
    initializeSmoothScrolling();
    initializeInteractiveElements();
    initializeDemoFunctionality();
    initializeAnimations();
    initializeNavbarScroll();
    initializeFAQ();
    initializeHeroSection();
    initializeUserAuth();
    
    // Initialize pricing plans with retry mechanism
    initializePricingPlansWithRetry();
});

// Initialize Hero Section
function initializeHeroSection() {
    initializeTypewriter();
    initializeHeroAnimations();
    initializeInteractiveElements();
    initializeParticleEffects();
    initializeVideoPlaceholder();
}

// Initialize Video Placeholder
function initializeVideoPlaceholder() {
    const playButton = document.getElementById('play-button');
    const videoOverlay = document.getElementById('video-overlay');
    const videoThumbnail = document.getElementById('video-thumbnail');
    const youtubeEmbed = document.getElementById('youtube-embed');
    
    if (playButton && videoOverlay && videoThumbnail && youtubeEmbed) {
        // Pre-load YouTube iframe API
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        // Get the iframe
        const iframe = youtubeEmbed.querySelector('iframe');
        let player;
        
        // Function to play video with a single click
        function playVideo() {
            // Hide overlay and thumbnail
            videoOverlay.style.display = 'none';
            videoThumbnail.style.display = 'none';
            
            // Show YouTube embed
            youtubeEmbed.style.display = 'block';
            
            // Add a subtle fade-in effect
            youtubeEmbed.style.opacity = '0';
            youtubeEmbed.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                youtubeEmbed.style.opacity = '1';
                
                // Play the video automatically
                if (window.YT && window.YT.Player) {
                    if (!player) {
                        player = new YT.Player(iframe, {
                            events: {
                                'onReady': function(event) {
                                    event.target.playVideo();
                                }
                            }
                        });
                    } else {
                        player.playVideo();
                    }
                } else {
                    // Fallback if YouTube API isn't loaded yet
                    const videoSrc = iframe.src;
                    if (videoSrc.indexOf('autoplay=1') === -1) {
                        iframe.src = videoSrc + (videoSrc.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';
                    }
                }
            }, 100);
            
            // Add close button to video if it doesn't exist yet
            if (!youtubeEmbed.querySelector('.video-close-btn')) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'video-close-btn';
                closeBtn.innerHTML = '&times;';
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    font-size: 20px;
                    cursor: pointer;
                    z-index: 10;
                    transition: all 0.3s ease;
                `;
                
                closeBtn.addEventListener('mouseenter', function() {
                    this.style.background = 'rgba(0, 0, 0, 0.9)';
                    this.style.transform = 'scale(1.1)';
                });
                
                closeBtn.addEventListener('mouseleave', function() {
                    this.style.background = 'rgba(0, 0, 0, 0.7)';
                    this.style.transform = 'scale(1)';
                });
                
                closeBtn.addEventListener('click', function() {
                    // Show overlay and thumbnail again
                    videoOverlay.style.display = 'flex';
                    videoThumbnail.style.display = 'block';
                    
                    // Hide YouTube embed
                    youtubeEmbed.style.display = 'none';
                    
                    // Pause the video
                    if (player && player.pauseVideo) {
                        player.pauseVideo();
                    } else {
                        // Fallback
                        const videoSrc = iframe.src;
                        iframe.src = videoSrc.replace('autoplay=1', 'autoplay=0');
                    }
                });
                
                youtubeEmbed.appendChild(closeBtn);
            }
        }
        
        // Add click event to play button
        playButton.addEventListener('click', playVideo);
        
        // Also make the entire overlay clickable
        videoOverlay.addEventListener('click', playVideo);
    }
}

// Typewriter Effect
function initializeTypewriter() {
    const typewriterElement = document.getElementById('typewriter');
    if (!typewriterElement) return;

    const words = ['powerful presentation tool', 'gaming experience', 'content creation platform', 'professional workspace'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeWriter() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // Pause before next word
        }

        setTimeout(typeWriter, typingSpeed);
    }

    // Start the typewriter effect after a delay
    setTimeout(typeWriter, 1000);
}

// Hero Animations
function initializeHeroAnimations() {
    // Animate title characters on scroll
    const titleChars = document.querySelectorAll('.title-char');
    titleChars.forEach((char, index) => {
        char.style.animationDelay = `${0.1 + index * 0.1}s`;
    });

    // Animate feature highlights
    const featureHighlights = document.querySelectorAll('.feature-highlight');
    featureHighlights.forEach((feature, index) => {
        feature.style.animationDelay = `${1.2 + index * 0.2}s`;
    });

    // Animate trust stats
    const trustStats = document.querySelectorAll('.trust-stat');
    trustStats.forEach((stat, index) => {
        stat.style.animationDelay = `${2 + index * 0.3}s`;
    });

    // Animate floating UI cards
    const uiCards = document.querySelectorAll('.ui-card');
    uiCards.forEach((card, index) => {
        card.style.animationDelay = `${index}s`;
    });
}

// Interactive Elements
function initializeInteractiveElements() {
    // Title character hover effects
    const titleChars = document.querySelectorAll('.title-char');
    titleChars.forEach(char => {
        char.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.1)';
            this.style.textShadow = '0 0 30px rgba(0, 212, 255, 1)';
            this.style.color = '#00d4ff';
        });

        char.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.textShadow = '0 0 20px rgba(0, 212, 255, 0.8)';
            this.style.color = 'white';
        });
    });

    // Feature highlight interactions
    const featureHighlights = document.querySelectorAll('.feature-highlight');
    featureHighlights.forEach(feature => {
        feature.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
            this.style.borderColor = 'rgba(0, 212, 255, 0.5)';
            this.style.boxShadow = '0 10px 30px rgba(0, 212, 255, 0.3)';
        });

        feature.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.borderColor = 'rgba(0, 212, 255, 0.2)';
            this.style.boxShadow = 'none';
        });
    });

    // Trust stat interactions
    const trustStats = document.querySelectorAll('.trust-stat');
    trustStats.forEach(stat => {
        stat.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
            this.style.borderColor = 'rgba(0, 212, 255, 0.4)';
            this.style.boxShadow = '0 10px 25px rgba(0, 212, 255, 0.2)';
        });

        stat.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.borderColor = 'rgba(0, 212, 255, 0.2)';
            this.style.boxShadow = 'none';
        });
    });

    // UI card interactions
    const uiCards = document.querySelectorAll('.ui-card');
    uiCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(-5px) scale(1.05)';
            this.style.borderColor = 'rgba(0, 212, 255, 0.6)';
            this.style.boxShadow = '0 10px 30px rgba(0, 212, 255, 0.4)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
            this.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            this.style.boxShadow = '0 5px 20px rgba(0, 212, 255, 0.2)';
        });
    });
}

// Particle Effects
function initializeParticleEffects() {
    // Create dynamic particles
    const particleField = document.querySelector('.particle-field');
    if (!particleField) return;

    // Add more particles dynamically
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        particleField.appendChild(particle);
    }

    // CTA button particle effects
    const ctaPrimary = document.querySelector('.cta-primary');
    if (ctaPrimary) {
        ctaPrimary.addEventListener('mouseenter', function() {
            const particles = this.querySelectorAll('.cta-particles .particle');
            particles.forEach((particle, index) => {
                particle.style.setProperty('--x', (Math.random() * 100 - 50) + 'px');
                particle.style.setProperty('--y', (Math.random() * -100 - 50) + 'px');
                particle.style.animationDelay = (index * 0.1) + 's';
            });
        });
    }
}

// Enhanced scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Add staggered animation for child elements
                const children = entry.target.querySelectorAll('.animate-child');
                children.forEach((child, index) => {
                    child.style.animationDelay = `${index * 0.1}s`;
                    child.classList.add('animate-in');
                });
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-features, .hero-actions, .hero-trust, .device-showcase, .floating-ui');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Performance metrics animation
function initializePerformanceMetrics() {
    const metrics = document.querySelectorAll('.metric-value');
    metrics.forEach(metric => {
        const finalValue = metric.textContent;
        const isNumber = !isNaN(parseInt(finalValue));
        
        if (isNumber) {
            const targetValue = parseInt(finalValue);
            let currentValue = 0;
            const increment = targetValue / 30;
            
            const updateMetric = () => {
                if (currentValue < targetValue) {
                    currentValue += increment;
                    metric.textContent = Math.floor(currentValue);
                    requestAnimationFrame(updateMetric);
                } else {
                    metric.textContent = finalValue;
                }
            };
            
            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateMetric();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(metric);
        }
    });
}

// Device showcase interactions
function initializeDeviceShowcase() {
    const phoneDevice = document.querySelector('.phone-device');
    const pcDevice = document.querySelector('.pc-device');
    const connectionBeam = document.querySelector('.connection-beam');

    if (phoneDevice && pcDevice && connectionBeam) {
        // Add click interactions
        phoneDevice.addEventListener('click', function() {
            this.style.transform = 'translateY(-20px) rotate(-5deg) scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'translateY(0) rotate(-2deg) scale(1)';
            }, 300);
        });

        pcDevice.addEventListener('click', function() {
            this.style.transform = 'translateY(-15px) rotate(5deg) scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'translateY(0) rotate(2deg) scale(1)';
            }, 300);
        });

        // Connection beam pulse on interaction
        connectionBeam.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.8)';
            this.style.transform = 'scale(1.1)';
        });

        connectionBeam.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.5)';
            this.style.transform = 'scale(1)';
        });
    }
}

// Enhanced CTA button effects
function initializeCTAEffects() {
    const ctaPrimary = document.querySelector('.cta-primary');
    const ctaSecondary = document.querySelector('.cta-secondary');

    if (ctaPrimary) {
        ctaPrimary.addEventListener('mouseenter', function() {
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.className = 'cta-ripple';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.marginLeft = '-10px';
            ripple.style.marginTop = '-10px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    if (ctaSecondary) {
        ctaSecondary.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0, 212, 255, 0.15)';
            this.style.borderColor = '#00d4ff';
        });

        ctaSecondary.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255, 255, 255, 0.1)';
            this.style.borderColor = 'rgba(0, 212, 255, 0.3)';
        });
    }
}

// Add CSS for new animations
const heroStyles = `
<style>
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.animate-in {
    animation: fadeInUp 0.8s ease-out forwards;
}

.animate-child {
    opacity: 0;
    transform: translateY(20px);
}

.animate-child.animate-in {
    animation: fadeInUp 0.6s ease-out forwards;
}

.cta-ripple {
    pointer-events: none;
}

/* Enhanced hover effects */
.hero-badge:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 15px 40px rgba(0, 212, 255, 0.4);
}

.hero-badge:hover .badge-glow {
    animation: badgeSweep 1s ease-in-out;
}

/* Performance optimization */
.hero-section * {
    will-change: transform, opacity;
}

/* Smooth transitions */
.hero-section * {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', heroStyles);

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initializeScrollAnimations();
    initializePerformanceMetrics();
    initializeDeviceShowcase();
    initializeCTAEffects();
});

// Loader functionality
function initializeLoader() {
    console.log('Initializing loader...');
    const loaderOverlay = document.getElementById('loader-overlay');
    const mainContent = document.getElementById('main-content');
    const lottieContainer = document.getElementById('lottie-container');
    
    console.log('Loader elements found:', {
        loaderOverlay: !!loaderOverlay,
        mainContent: !!mainContent,
        lottieContainer: !!lottieContainer
    });
    
    if (loaderOverlay && mainContent && lottieContainer) {
        let animation = null;
        let animationLoaded = false;
        
        // Embedded icon.json data to avoid file path issues
        const iconAnimationData = {
            "v": "4.8.0",
            "meta": {"g": "LottieFiles AE 3.1.1", "a": "", "k": "", "d": "", "tc": ""},
            "fr": 20,
            "ip": 0,
            "op": 55,
            "w": 1920,
            "h": 1080,
            "nm": "Comp 1",
            "ddd": 0,
            "assets": [
                {
                    "id": "image_0",
                    "w": 99,
                    "h": 99,
                    "u": "",
                    "p": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAABjCAYAAACPO76VAAAACXBIWXMAAAABAAAAAQBPJcTWAAAAJHpUWHRDcmVhdG9yAAAImXNMyU9KVXBMK0ktUnBNS0tNLikGAEF6Bs5qehXFAAAIsElEQVR4nO2dTWwbxxXH/zNcypQUhVRCSw4CVOrN6cVqjZ58ME++NLXVUxVZQKjClyRAIxdFANeQO3CQAikKiO4hhYACoQDHMVCgdYq6HwYCMAUMpA2EkpfYvVEtApeSEHETi6LE5b4edklRFEnxY3dnl9rfgeDXzjzwz5k3M/veDIPLmRFPJhUok9D1mPEOi7VznQ6kOSgPjjTA87fFyZRtRloEk21APXNiI2b88CxGwBSAsIXFZwhIcU4pBQOppBjNW1h2z0gXIy62Invl0jRjbBqgGKz98Y8iA2LJckC7d1e8kHWw3oZIE2NObMRIpziAaTgrQDMyREjceXssKcsAx8WYXVyPM4YFAGecrrtNVAZKKHwg4XQ35pgYhghMADThVJ29QsCtAR4UToliuxhGd4Skl0SoQ2WgxO2b48LuimwTY0Y8mQzoSgKgS3bV4SxsjXHE7Rwi2yLG5cWNBTAScIdjtpqVIA8u2NF1WSpGXGxFSrqW7J/W0Ay2Rpym74ixtJWlcqsKmhXrUyVdS/e/EABAE0zHvy4vbixYWaolYswurseZjpSHnXR3MFq6fGM9aVlxvRZg+oclK4zxMJkgD8Z69SM9iWH+K17tpYw+omdBuhbDF6IhPQnSlRi+EC3pWpCOHbg5gvCFaM6Zkl5KxcVWpNMLOxJjdnE97jvrtjhjzLc6o20xZsX6FGNIdFrB8YUuzd3IiU6uaMtnmDPr9LGbR1gA4/SD22L8XjvfbatlmEscvhBdQDpLzognk+1890gxDId9HJY4bCOs6IFkO19s2U0Zy+CBNPpz9dVZiF394O2TLX1uy5Zh3I/whbAERuKo4W5TMebERszvniwlXNJL3bUM41apj8W8avzJG9NQjNnF9bg/erIJnUSzjxqKYURx+NgBAeebtY5DYvitwgGatI5DYpgBZj42QsD5RhNBpfaFGXLpmki/iVMK5r//zH9Hhrj+KFsavvO3p9FCkWSbZQkBPSAAxGvfOzDpc9t9iuVrUXU4xKrznJJGxZU/P6XUanFQpl0WoQZ5cLL2vke1mzInJNNSzGpCrRAAEFRY6MrFkcHET57ffGkyKMssqwjvlUsHfu+qGOYHnphtR8M8en0+gus/imyejARkm9M1RhrEPrzZB17gpYlg9Fc/fq4wc2FYHQpJTzXpArpUu0RSM5qimARreiYQwNDL54bCS1efV2NnQzuy7ekUDXuxynMOVNahvNFFNWM4xMJXLo4MvvvGaM5L/oT0/R7JaBnV5EXv8+KYMn59PoKrrzyb80bXtZ8wyuvf6BfOnj4x/t5b0Z2ZC8OqbFtaQxMVv8EBwMwq7TuUAAZfPjcUXr4WVb/7rRMF2fY0Q4M2BQDcnJZ72l8cxXCIhd/84bND774xmps4pRx9gdOYboIrUCblWuIcL44p4++8Noorl0Y23eRPCNxoGf3kvNsl9p1Q9L23ojvfOzdUlG0LADDQvs84jigBDL5yYTi0fC2qyh4KV3w278eRVCcMh1j4+nwEv3htVObSShg4xiyjnW+cUqJLV5+DrFl8XGxFfDHquHJxZFBGt6VBm/LFaMD5b4e+kFEvJ7BJGRW7mVPRgC6jXr9lNGD133vPyKiXM1BWRsVupaRR8eN/7ozKqNuFawPy+M//tM2lD7+SFvTgiwFgu0jqbz/6OvjZ57tRWTZo0LLHWgytjJ2/flrYu/tgW/pC6V3xQlbRgTQDzss2xmlWH+/mlv/w9XihSK4J+1E4KE/y9410jC/WtVzy/tPxR9nSuGxbasgAgAKONKSMqp1lu0jqhw+eDqRWi24SAQDAgDwAKADPA/0RMtmIchmFv3xaKP3x74Wwe0NDKQUA3As7IXfLo7XS5k9//eXQ3QfbLhYC0Illgf2hbQbu3dq0YzZVvXP5919FH2VL0oaqHRFAGjDFICDF+kCMmsBob4hgoFa211MAgHNKkc7elGtTb/zpYUF1t19oBktVninGw0CqhJIsa3qisoSxkS9Ln7h1BSFVecoBwMwRyMiypxu2i6S+834eP/vNVnQjX5ZtTteUA1p1X5H95RBiSS9sX6SVsfO7j7fZ/YcFb7aEg2RqTyeo3s+oVcgtfPZ58cva16uPd3Ov/3Jz8P7DQkiWTZZCLFn7sj6NLA2XjarOnj6B0xPB3IN/7Ix7uTtqRJmXv1nbMg6s2hIhwRjed9yqFqw+3sXq413XLWH0CgM+qT9A5cBt14FA8B4Al0dt9wmcDu0jckCMpBjNMxz+ko/VsLVGu7MdCkhQ+IAvhs0QtblDQlKM5gm4ZbtFxxa21uxcp4ahOgM8KOD7Dlto1iqAJmL4vsM2Mq1OO2saxGacMcTW7LDouMI4a7lJTsuIQsYPbjTi0xMrR93IaymGefGKhQYdV9QgDx65ddSRsbZGIX531QuMU7ydUwOOFCMpRvPEyXP7irgFAm61u/122wFT/nE+XZH54OZY2zn2bacEmLsV+/6jfdQgD8Y6uaDjUEI3LrO7EJU4Yp2e49dxsoyptqdu0ToN46yrAxU7FiMpRvO+IM0hwny3gYFdRzwbB5yUUvC7rCpEmO/lcPeews99QaqojLPpXkNle0qw3O+y2Ee9lONxVOKIWRGzbFlixtyNnCCwn1tVnkew5BjRCpZmycyJ3DTpLIk+378KMGbWd26OWbpVueUpSzPiyaSiB5LUv6lpKuMUb3eJoxNsyx8zl08E+quVrAR5cMGqbqkeW5P5zNFWAi7aX71LMoyzBbsTixzJrJwTGzHoJLzXdbE1IhK9zB06qs2JSip4RxRnRajW6mRlFczz/wSMUwlc41MY8Ak4Jexwzm3WL4+42IrslUvTxqb40o6hy4BYshzQ7tXHvjqNa7Lx42IromEvZuwNzmI2nvukAiwFQsoNAtTiGjHqMcTRpqDrMQKfYqCIuctlJ91axkh4p5ROLIsA0t0sbTuFa8VoRVWoBmjQsm76t3fC/wFFkEu0otlhvQAAAABJRU5ErkJggg==",
                    "e": 1
                }
            ],
            "layers": [
                {
                    "ddd": 0,
                    "ind": 1,
                    "ty": 2,
                    "nm": "Layer 2",
                    "refId": "image_0",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100, "ix": 11},
                        "r": {"a": 0, "k": 0, "ix": 10},
                        "p": {"a": 0, "k": [1033.918, 473.786, 0], "ix": 2},
                        "a": {"a": 0, "k": [49.177, 49.178, 0], "ix": 1},
                        "s": {
                            "a": 1,
                            "k": [
                                {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 0, "s": [0, 0, 100]},
                                {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 8, "s": [100, 100, 100]},
                                {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 47, "s": [100, 100, 100]},
                                {"t": 54, "s": [0, 0, 100]}
                            ],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "ip": 0,
                    "op": 418,
                    "st": 7,
                    "bm": 0
                }
            ],
            "markers": []
        };
        
        // Try to load the embedded animation data first
        try {
            console.log('Loading embedded Lottie animation data');
            animation = lottie.loadAnimation({
                container: lottieContainer,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: iconAnimationData
            });
            
            // Handle animation load
            animation.addEventListener('DOMLoaded', function() {
                console.log('Embedded Lottie animation loaded successfully');
                animationLoaded = true;
            });
            
            // Handle animation errors
            animation.addEventListener('error', function(error) {
                console.error('Embedded animation error:', error);
                tryExternalFile();
            });
            
        } catch (error) {
            console.error('Failed to load embedded animation:', error);
            tryExternalFile();
        }
        
        // Fallback to external file if embedded fails
        function tryExternalFile() {
            try {
                console.log('Trying external icon.json file');
                if (animation) {
                    animation.destroy();
                }
                
                animation = lottie.loadAnimation({
                    container: lottieContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: './icon.json'
                });
                
                animation.addEventListener('DOMLoaded', function() {
                    console.log('External Lottie animation loaded successfully');
                    animationLoaded = true;
                });
                
                animation.addEventListener('error', function(error) {
                    console.error('External animation error:', error);
                    fallbackToCSSAnimation();
                });
                
            } catch (error) {
                console.error('Failed to load external animation:', error);
                fallbackToCSSAnimation();
            }
        }
        
        // Set a timeout to fallback if animation doesn't load
        setTimeout(() => {
            if (!animationLoaded) {
                console.warn('Lottie animation failed to load within 3 seconds, using fallback');
                fallbackToCSSAnimation();
            }
        }, 3000);
        
        // Fallback to CSS animation if Lottie fails
        function fallbackToCSSAnimation() {
            console.log('Using CSS fallback animation');
            if (lottieContainer) {
                lottieContainer.innerHTML = `
                    <div class="fallback-loader">
                        <div class="spinner-ring"></div>
                        <div class="loading-text">Loading...</div>
                    </div>
                `;
            }
        }
        
        // Simulate loading time
        setTimeout(() => {
            console.log('Loader timeout reached, transitioning to main content');
            // Stop the animation if it exists
            if (animation && animationLoaded) {
                animation.stop();
            }
            
            // Fade out loader
            loaderOverlay.style.opacity = '0';
            loaderOverlay.style.transform = 'scale(0.95)';
            
            // Show main content
            mainContent.classList.remove('hidden');
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
            
            // Remove loader after transition
            setTimeout(() => {
                loaderOverlay.style.display = 'none';
                // The global background animation will continue to run in the body
                // while the loader background is hidden
            }, 500);
        }, 4193);
    } else {
        console.error('Required loader elements not found');
    } 
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Interactive elements
function initializeInteractiveElements() {
    // Primary CTA buttons
    const primaryCtaButtons = document.querySelectorAll('.primary-cta');
    primaryCtaButtons.forEach(button => {
        button.addEventListener('click', function() {
            showDownloadModal();
        });
    });
    
    // Secondary CTA buttons (Demo)
    const secondaryCtaButtons = document.querySelectorAll('.secondary-cta');
    secondaryCtaButtons.forEach(button => {
        button.addEventListener('click', function() {
            showDemoModal();
        });
    });
    
    // Legacy download buttons (for compatibility)
    const downloadButtons = document.querySelectorAll('.download-btn.android, .download-btn-main.android');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            showDownloadModal();
        });
    });
    
    // Legacy demo buttons (for compatibility)
    const demoButtons = document.querySelectorAll('.download-btn.ios, .download-btn-main.ios');
    demoButtons.forEach(button => {
        button.addEventListener('click', function() {
            showDemoModal();
        });
    });
    
    // Guide buttons
    const guideButtons = document.querySelectorAll('.download-btn.guide');
    guideButtons.forEach(button => {
        button.addEventListener('click', function() {
            showGuideModal();
        });
    });
}

// Demo functionality
function initializeDemoFunctionality() {
    // Demo modal will be created when needed
}

// Feature demo functionality
function showFeatureDemo(featureType) {
    const demoContent = getFeatureDemoContent(featureType);
    const featureModal = createModal('feature-demo-modal', `Mirror Web - ${getFeatureTitle(featureType)}`, demoContent);
    
    document.body.appendChild(featureModal);
}

function getFeatureTitle(featureType) {
    const titles = {
        'latency': 'Ultra-Low Latency Demo',
        'quality': 'HD Quality Demo',
        'connection': 'Easy Connection Demo',
        'gaming': 'Gaming Optimization Demo',
        'recording': 'Recording & Streaming Demo',
        'security': 'Security & Privacy Demo'
    };
    return titles[featureType] || 'Feature Demo';
}

function getFeatureDemoContent(featureType) {
    const demos = {
        'latency': `
            <div class="feature-demo-content">
                <div class="demo-visual">
                    <div class="latency-demo">
                        <div class="phone-screen">📱</div>
                        <div class="latency-indicator">
                            <div class="latency-bar"></div>
                            <div class="latency-text">&lt;10ms</div>
                        </div>
                        <div class="pc-screen">🖥️</div>
                    </div>
                </div>
                <div class="demo-info">
                    <h3>Real-Time Performance</h3>
                    <p>Experience lightning-fast screen mirroring with sub-10ms latency. Perfect for gaming and presentations where every millisecond counts.</p>
                    <div class="demo-stats">
                        <div class="demo-stat">
                            <span class="stat-number">&lt;10ms</span>
                            <span class="stat-desc">Latency</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">60fps</span>
                            <span class="stat-desc">Frame Rate</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">0ms</span>
                            <span class="stat-desc">Input Lag</span>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'quality': `
            <div class="feature-demo-content">
                <div class="demo-visual">
                    <div class="quality-demo">
                        <div class="quality-comparison">
                            <div class="quality-before">
                                <h4>Standard</h4>
                                <div class="quality-preview blur"></div>
                            </div>
                            <div class="quality-arrow">→</div>
                            <div class="quality-after">
                                <h4>Mirror Web</h4>
                                <div class="quality-preview sharp"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="demo-info">
                    <h3>Crystal Clear Quality</h3>
                    <p>Enjoy stunning 1080p resolution with HDR support. Every detail is preserved with our advanced compression technology.</p>
                    <div class="demo-stats">
                        <div class="demo-stat">
                            <span class="stat-number">1080p</span>
                            <span class="stat-desc">Resolution</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">HDR</span>
                            <span class="stat-desc">Support</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">4K</span>
                            <span class="stat-desc">Recording</span>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'connection': `
            <div class="feature-demo-content">
                <div class="demo-visual">
                    <div class="connection-demo">
                        <div class="connection-steps">
                            <div class="step">
                                <div class="step-icon">📱</div>
                                <div class="step-text">Connect Device</div>
                            </div>
                            <div class="step-arrow">→</div>
                            <div class="step">
                                <div class="step-icon">⚡</div>
                                <div class="step-text">Auto-Detect</div>
                            </div>
                            <div class="step-arrow">→</div>
                            <div class="step">
                                <div class="step-icon">🎯</div>
                                <div class="step-text">Start Mirroring</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="demo-info">
                    <h3>One-Click Setup</h3>
                    <p>Connect your Android device to PC with just one click. No complex setup, no drivers needed - just plug and play.</p>
                    <div class="demo-stats">
                        <div class="demo-stat">
                            <span class="stat-number">1-Click</span>
                            <span class="stat-desc">Setup</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">USB/WiFi</span>
                            <span class="stat-desc">Options</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">Auto</span>
                            <span class="stat-desc">Detection</span>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'gaming': `
            <div class="feature-demo-content">
                <div class="demo-visual">
                    <div class="gaming-demo">
                        <div class="game-screen">
                            <div class="game-ui">
                                <div class="game-controller">🎮</div>
                                <div class="performance-metrics">
                                    <div class="metric">FPS: 60</div>
                                    <div class="metric">Latency: 0ms</div>
                                    <div class="metric">Mode: Pro</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="demo-info">
                    <h3>Gaming Optimized</h3>
                    <p>Perfect for mobile gaming with zero input lag and optimized performance. Experience console-quality gaming on your PC.</p>
                    <div class="demo-stats">
                        <div class="demo-stat">
                            <span class="stat-number">0ms</span>
                            <span class="stat-desc">Input Lag</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">Pro</span>
                            <span class="stat-desc">Mode</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">60fps</span>
                            <span class="stat-desc">Gaming</span>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'recording': `
            <div class="feature-demo-content">
                <div class="demo-visual">
                    <div class="recording-demo">
                        <div class="recording-controls">
                            <div class="record-btn">
                                <div class="record-dot"></div>
                            </div>
                            <div class="recording-status">Recording...</div>
                        </div>
                        <div class="audio-visualizer">
                            <div class="audio-bar"></div>
                            <div class="audio-bar"></div>
                            <div class="audio-bar"></div>
                            <div class="audio-bar"></div>
                            <div class="audio-bar"></div>
                        </div>
                    </div>
                </div>
                <div class="demo-info">
                    <h3>Professional Recording</h3>
                    <p>Record your screen in 4K quality with built-in audio capture. Perfect for content creators and streamers.</p>
                    <div class="demo-stats">
                        <div class="demo-stat">
                            <span class="stat-number">4K</span>
                            <span class="stat-desc">Recording</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">Live</span>
                            <span class="stat-desc">Stream</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">HD</span>
                            <span class="stat-desc">Audio</span>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'security': `
            <div class="feature-demo-content">
                <div class="demo-visual">
                    <div class="security-demo">
                        <div class="security-shield">
                            <div class="shield-icon">🛡️</div>
                            <div class="security-layers">
                                <div class="layer">256-bit Encryption</div>
                                <div class="layer">Local Processing</div>
                                <div class="layer">No Cloud Storage</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="demo-info">
                    <h3>Secure & Private</h3>
                    <p>Your data stays completely private with military-grade encryption and local processing. No data is ever sent to external servers.</p>
                    <div class="demo-stats">
                        <div class="demo-stat">
                            <span class="stat-number">256-bit</span>
                            <span class="stat-desc">Encryption</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">Local</span>
                            <span class="stat-desc">Processing</span>
                        </div>
                        <div class="demo-stat">
                            <span class="stat-number">100%</span>
                            <span class="stat-desc">Private</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
    
    return demos[featureType] || '<div class="demo-content"><p>Demo content not available.</p></div>';
}

// Demo modal
function showDemoModal() {
    const demoModal = createModal('demo-modal', 'Mirror Web Demo', `
        <div class="demo-content">
            <div class="demo-video-placeholder">
                <div class="demo-video">
                    <div class="video-screen">
                        <div class="video-content">
                            <div class="play-button" onclick="playDemo()">▶</div>
                            <p>Screen Mirroring Demo</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="demo-features">
                <h3>See Mirror Web in Action</h3>
                <ul>
                    <li>Ultra-low latency screen mirroring</li>
                    <li>HD quality projection</li>
                    <li>One-click connection</li>
                    <li>Gaming optimization</li>
                </ul>
            </div>
            <div class="demo-description">
                <p>Experience the power of Mirror Web with our interactive demo. See how easy it is to mirror your Android screen to PC with professional quality and minimal latency.</p>
            </div>
        </div>
    `);
    
    document.body.appendChild(demoModal);
}

// Play demo function
function playDemo() {
    const playButton = document.querySelector('.play-button');
    const videoScreen = document.querySelector('.video-screen');
    
    if (playButton.textContent === '▶') {
        // Start demo
        playButton.textContent = '⏸';
        videoScreen.innerHTML = `
            <div class="demo-animation">
                <div class="phone-demo">📱</div>
                <div class="connection-demo">🔗</div>
                <div class="pc-demo">🖥️</div>
                <div class="mirror-effect">✨</div>
            </div>
        `;
        
        // Add demo animation styles
        const demoStyles = `
            <style>
            .demo-animation {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                animation: demoPulse 2s ease-in-out infinite;
            }
            
            .phone-demo, .pc-demo {
                font-size: 2rem;
                animation: float 2s ease-in-out infinite;
            }
            
            .connection-demo {
                font-size: 1.5rem;
                animation: pulse 1s ease-in-out infinite;
            }
            
            .mirror-effect {
                position: absolute;
                font-size: 1rem;
                color: #00ff88;
                animation: sparkle 1.5s ease-in-out infinite;
            }
            
            @keyframes demoPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes sparkle {
                0%, 100% { opacity: 0; transform: scale(0.5); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            </style>
        `;
        
        if (!document.querySelector('#demo-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'demo-styles';
            styleElement.innerHTML = demoStyles;
            document.head.appendChild(styleElement);
        }
        
    } else {
        // Pause demo
        playButton.textContent = '▶';
        videoScreen.innerHTML = `
            <div class="video-content">
                <div class="play-button" onclick="playDemo()">▶</div>
                <p>Screen Mirroring Demo</p>
            </div>
        `;
    }
}

// Download modal
function showDownloadModal() {
    const downloadModal = createModal('download-modal', 'Download Mirror Web', `
        <div class="download-content">
            <div class="download-options">
                <div class="download-option">
                    <h3>Free Trial</h3>
                    <p>Try Mirror Web for 7 days</p>
                    <button class="download-btn-modal" onclick="downloadSoftware('trial')">Download Trial</button>
                </div>
                <div class="download-option">
                    <h3>Professional</h3>
                    <p>Full features unlocked</p>
                    <button class="download-btn-modal" onclick="downloadSoftware('pro')">Download Pro</button>
                </div>
            </div>
            <div class="system-requirements">
                <h4>System Requirements</h4>
                <ul>
                    <li>Windows 10/11 or macOS 10.15+</li>
                    <li>Android 7.0+ device</li>
                    <li>USB connection or WiFi</li>
                    <li>4GB RAM minimum</li>
                </ul>
            </div>
        </div>
    `);
    
    document.body.appendChild(downloadModal);
}

// Guide modal
function showGuideModal() {
    const guideModal = createModal('guide-modal', 'Setup Guide', `
        <div class="guide-content">
            <div class="guide-steps">
                <div class="guide-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Download & Install</h4>
                        <p>Download Mirror Web on your PC and install it</p>
                    </div>
                </div>
                <div class="guide-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Enable USB Debugging</h4>
                        <p>On your Android device, enable USB debugging in Developer Options</p>
                    </div>
                </div>
                <div class="guide-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Connect Devices</h4>
                        <p>Connect your Android device to PC via USB cable</p>
                    </div>
                </div>
                <div class="guide-step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Start Mirroring</h4>
                        <p>Click "Start Mirroring" in Mirror Web and enjoy!</p>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(guideModal);
}

// Create modal function
function createModal(id, title, content) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="closeModal('${id}')">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(id);
        }
    });
    
    return modal;
}

// Close modal function
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Download software function
function downloadSoftware(type) {
    const downloadUrl = type === 'pro' ? '#pro-download' : '#trial-download';
    
    // Simulate download
    const downloadBtn = event.target;
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'Downloading...';
    downloadBtn.disabled = true;
    
    setTimeout(() => {
        downloadBtn.textContent = 'Download Complete!';
        setTimeout(() => {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
            closeModal('download-modal');
        }, 1500);
    }, 2000);
}



// Initialize animations
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .download-btn-main');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Add CSS for modals and animations
const additionalStyles = `
<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
}

.modal {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border: 2px solid #00d4ff;
    border-radius: 20px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 0 50px rgba(0, 212, 255, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.modal-header h2 {
    color: #00d4ff;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    color: #00d4ff;
    font-size: 2rem;
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: rgba(0, 212, 255, 0.1);
    transform: scale(1.1);
}

.modal-body {
    padding: 1.5rem;
}

.download-content, .guide-content, .demo-content {
    color: white;
}

.download-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
}

.download-option {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
}

.download-option h3 {
    color: #00d4ff;
    margin-bottom: 0.5rem;
}

.download-btn-modal {
    background: linear-gradient(45deg, #00d4ff, #0099cc);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin-top: 1rem;
    transition: all 0.3s ease;
}

.download-btn-modal:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
}

.system-requirements {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 1rem;
}

.system-requirements h4 {
    color: #00d4ff;
    margin-bottom: 0.5rem;
}

.system-requirements ul {
    list-style: none;
    padding: 0;
}

.system-requirements li {
    padding: 0.3rem 0;
    color: #ccc;
}

.system-requirements li:before {
    content: "✓";
    color: #00ff88;
    margin-right: 0.5rem;
}

.guide-steps {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.guide-step {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.step-number {
    background: linear-gradient(45deg, #00d4ff, #0099cc);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
}

.step-content h4 {
    color: #00d4ff;
    margin-bottom: 0.5rem;
}

.step-content p {
    color: #ccc;
    margin: 0;
}

.demo-video-placeholder {
    text-align: center;
    margin-bottom: 2rem;
}

.demo-video {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    padding: 2rem;
    border: 2px solid rgba(0, 212, 255, 0.3);
}

.video-screen {
    width: 100%;
    height: 200px;
    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.video-content {
    text-align: center;
    color: #00d4ff;
}

.play-button {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.play-button:hover {
    transform: scale(1.2);
    color: #ffffff;
}

.demo-features h3 {
    color: #00d4ff;
    margin-bottom: 1rem;
}

.demo-features ul {
    list-style: none;
    padding: 0;
}

.demo-features li {
    padding: 0.5rem 0;
    color: #ccc;
}

.demo-features li:before {
    content: "▶";
    color: #00d4ff;
    margin-right: 0.5rem;
}

.demo-description {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 1rem;
    margin-top: 1rem;
    border: 1px solid rgba(0, 212, 255, 0.2);
}

.demo-description p {
    color: #ccc;
    margin: 0;
    line-height: 1.6;
    text-align: center;
}

.animate-in {
    animation: slideInUp 0.6s ease-out forwards;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .modal {
        width: 95%;
        margin: 1rem;
    }
    
    .download-options {
        grid-template-columns: 1fr;
    }
    
    .guide-step {
        flex-direction: column;
        text-align: center;
    }
}
</style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Navigation functionality
function initializeNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow and background opacity when scrolling
        if (scrollTop > 50) {
            navbar.style.background = 'rgba(26, 26, 46, 0.98)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.2)';
        } else {
            navbar.style.background = 'rgba(26, 26, 46, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
        
        // Hide/show navbar on scroll (optional - uncomment if you want this effect)
        // if (scrollTop > lastScrollTop && scrollTop > 100) {
        //     navbar.style.transform = 'translateY(-100%)';
        // } else {
        //     navbar.style.transform = 'translateY(0)';
        // }
        
        lastScrollTop = scrollTop;
    });
}

// FAQ functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
    
    // Add smooth scroll for FAQ CTA button
    const faqCtaBtn = document.querySelector('.faq-cta-btn');
    if (faqCtaBtn) {
        faqCtaBtn.addEventListener('click', function() {
            // You can add contact functionality here
            showContactModal();
        });
    }
}

// Contact modal for FAQ CTA
function showContactModal() {
    const contactModal = createModal('contact-modal', 'Contact Support', `
        <div class="contact-content">
            <div class="contact-info">
                <h3>Get in Touch</h3>
                <p>Our support team is here to help you with any questions about Mirror Web.</p>
                <div class="contact-methods">
                    <div class="contact-method">
                        <div class="contact-icon">📧</div>
                        <div class="contact-details">
                            <h4>Email Support</h4>
                            <p>support@mirrorweb.com</p>
                        </div>
                    </div>
                    <div class="contact-method">
                        <div class="contact-icon">💬</div>
                        <div class="contact-details">
                            <h4>Live Chat</h4>
                            <p>Available 24/7</p>
                        </div>
                    </div>
                    <div class="contact-method">
                        <div class="contact-icon">📖</div>
                        <div class="contact-details">
                            <h4>Documentation</h4>
                            <p>Complete setup guides</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(contactModal);
}

// Retry loading pricing plans
function retryPricingPlans() {
    console.log('Manual retry of pricing plans requested');
    const container = document.getElementById('pricing-cards-container');
    if (container) {
        // Remove any existing content
        container.innerHTML = '';
        // Remove any loaded markers
        container.classList.remove('fallback-plans-loaded');
        // Reinitialize
        initializePricingPlans();
    }
}

// Modern Footer Functionality
function initializeModernFooter() {
    // Newsletter subscription
    const newsletterBtn = document.querySelector('.newsletter-btn');
    const newsletterInput = document.querySelector('.newsletter-input');
    
    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', function() {
            const email = newsletterInput.value.trim();
            if (email && isValidEmail(email)) {
                // Simulate subscription
                const originalText = this.querySelector('.btn-text').textContent;
                this.querySelector('.btn-text').textContent = 'Subscribed!';
                this.style.background = 'linear-gradient(45deg, #00ff88, #00d4ff)';
                this.disabled = true;
                
                // Reset after 3 seconds
                setTimeout(() => {
                    this.querySelector('.btn-text').textContent = originalText;
                    this.style.background = 'linear-gradient(45deg, #00d4ff, #00ff88)';
                    this.disabled = false;
                    newsletterInput.value = '';
                }, 3000);
            } else {
                // Show error
                newsletterInput.style.borderColor = '#ff4444';
                setTimeout(() => {
                    newsletterInput.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                }, 2000);
            }
        });
        
        // Enter key support
        newsletterInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                newsletterBtn.click();
            }
        });
    }
    
    // Footer action buttons
    const feedbackBtn = document.querySelector('.action-btn.feedback');
    const statusBtn = document.querySelector('.action-btn.status');
    
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', function() {
            showFeedbackModal();
        });
    }
    
    if (statusBtn) {
        statusBtn.addEventListener('click', function() {
            showStatusModal();
        });
    }
    
    // Social links hover effects
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px) scale(1.05)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
        });
    });
    
    // Footer badges hover effects
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Feedback modal
function showFeedbackModal() {
    const feedbackModal = createModal('feedback-modal', 'Send Feedback', `
        <div class="feedback-content">
            <div class="feedback-form">
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" placeholder="Enter your name" class="feedback-input">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="Enter your email" class="feedback-input">
                </div>
                <div class="form-group">
                    <label>Feedback Type</label>
                    <select class="feedback-select">
                        <option>General Feedback</option>
                        <option>Bug Report</option>
                        <option>Feature Request</option>
                        <option>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea placeholder="Tell us what you think..." class="feedback-textarea" rows="4"></textarea>
                </div>
                <button class="feedback-submit-btn">Send Feedback</button>
            </div>
        </div>
    `);
    
    document.body.appendChild(feedbackModal);
    
    // Add feedback form functionality
    const submitBtn = feedbackModal.querySelector('.feedback-submit-btn');
    submitBtn.addEventListener('click', function() {
        this.textContent = 'Sending...';
        this.disabled = true;
        
        setTimeout(() => {
            this.textContent = 'Sent Successfully!';
            this.style.background = 'linear-gradient(45deg, #00ff88, #00d4ff)';
            
            setTimeout(() => {
                closeModal('feedback-modal');
            }, 1500);
        }, 2000);
    });
}

// System status modal
function showStatusModal() {
    const statusModal = createModal('status-modal', 'System Status', `
        <div class="status-content">
            <div class="status-overview">
                <h3>All Systems Operational</h3>
                <div class="status-indicator online">
                    <span class="status-dot"></span>
                    <span class="status-text">Online</span>
                </div>
            </div>
            <div class="status-services">
                <div class="service-status">
                    <div class="service-name">Web Application</div>
                    <div class="service-indicator online">Operational</div>
                </div>
                <div class="service-status">
                    <div class="service-name">Download Server</div>
                    <div class="service-indicator online">Operational</div>
                </div>
                <div class="service-status">
                    <div class="service-name">API Services</div>
                    <div class="service-indicator online">Operational</div>
                </div>
                <div class="service-status">
                    <div class="service-name">Support System</div>
                    <div class="service-indicator online">Operational</div>
                </div>
            </div>
            <div class="status-footer">
                <p>Last updated: ${new Date().toLocaleString()}</p>
            </div>
        </div>
    `);
    
    document.body.appendChild(statusModal);
}

// Initialize footer functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeModernFooter();
    initializeModernHero();
});

// User Authentication and Profile Management
function initializeUserAuth() {
    const navAuthButtons = document.getElementById('nav-auth-buttons');
    const navProfile = document.getElementById('nav-profile');
    const profileBtn = navProfile ? navProfile.querySelector('.profile-btn') : null;
    const profileDropdown = navProfile ? navProfile.querySelector('.profile-dropdown') : null;
    const logoutBtn = document.getElementById('logout-btn');
    
    // Initialize dropdown functionality
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function() {
            profileDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }
    
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                // Sign out from Supabase
                const { error } = await signOut();
                
                if (error) {
                    throw error;
                }
                
                // Show auth buttons, hide profile
                if (navAuthButtons) navAuthButtons.style.display = 'flex';
                if (navProfile) navProfile.style.display = 'none';
                
                // Close dropdown
                if (profileDropdown) profileDropdown.classList.remove('active');
                
                // Optional: Show logout message
                alert('You have been logged out successfully.');
                
                // Reload page to refresh state
                window.location.reload();
            } catch (error) {
                console.error('Error signing out:', error.message);
                alert('Error signing out: ' + error.message);
            }
        });
    }
    
    // Check auth status on page load
    if (typeof checkAuthStatus === 'function') {
        checkAuthStatus();
    }
}

// Modern Hero Section functionality
function initializeModernHero() {
    // Hero action buttons
    const primaryBtn = document.querySelector('.action-btn.primary-modern');
    const secondaryBtn = document.querySelector('.action-btn.secondary-modern');
    
    if (primaryBtn) {
        primaryBtn.addEventListener('click', function() {
            showDownloadModal();
        });
    }
    
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', function() {
            showDemoModal();
        });
    }
    
    // Initialize metric animations
    initializeMetrics();
    
    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);
    
    // Observe hero elements for animation triggers
    const heroElements = document.querySelectorAll('.title-word, .desc-text, .highlight, .metric-item, .action-btn, .device, .ui-card');
    heroElements.forEach(el => {
        observer.observe(el);
    });
    
    // Scroll indicator functionality
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const featuresSection = document.querySelector('.features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// Initialize metric animations
function initializeMetrics() {
    const metricProgresses = document.querySelectorAll('.metric-progress');
    
    metricProgresses.forEach((progress, index) => {
        const delay = 2.5 + (index * 0.5);
        setTimeout(() => {
            progress.style.animation = `metricProgress 2s ease-out forwards`;
        }, delay * 1000);
    });
}

// Initialize Pricing Plans with retry mechanism
async function initializePricingPlansWithRetry() {
    console.log('Starting pricing plans initialization with retry...');
    
    // Try to initialize immediately
    await initializePricingPlans();
    
    // If Supabase wasn't ready, retry after a delay
    setTimeout(async () => {
        console.log('Retrying pricing plans initialization...');
        await initializePricingPlans();
    }, 2000);
    
    // Final retry after 5 seconds
    setTimeout(async () => {
        console.log('Final retry for pricing plans initialization...');
        await initializePricingPlans();
    }, 5000);
}

// Initialize Pricing Plans
async function initializePricingPlans() {
    const container = document.getElementById('pricing-cards-container');
    if (!container) return;

    // Check if plans are already loaded
    if (container.querySelector('.pricing-card') || container.querySelector('.fallback-plans-loaded')) {
        console.log('Plans already loaded, skipping initialization');
        return;
    }

    try {
        console.log('Initializing pricing plans...');
        
        // Show loading state
        showPricingLoading(container);
        
        // Check if Supabase is available and ready
        if (typeof isSupabaseReady === 'function' && !isSupabaseReady()) {
            console.warn('Supabase not ready, showing fallback plans');
            showFallbackPlans(container);
            return;
        }

        // Check if supabase object exists
        if (typeof supabase === 'undefined' || !supabase) {
            console.warn('Supabase object not available, showing fallback plans');
            showFallbackPlans(container);
            return;
        }

        console.log('Attempting to fetch plans from Supabase...');
        
        // Fetch plans from Supabase
        const { data: plans, error } = await supabase
            .from('subscription_packages')
            .select('*')
            .order('price', { ascending: true });

        if (error) {
            console.error('Error fetching plans from Supabase:', error);
            console.log('Showing fallback plans due to Supabase error');
            showFallbackPlans(container);
            return;
        }

        if (!plans || plans.length === 0) {
            console.log('No plans found in Supabase, showing fallback plans');
            showFallbackPlans(container);
            return;
        }

        console.log('Successfully fetched plans from Supabase:', plans);
        // Render plans
        renderPricingPlans(container, plans);

    } catch (error) {
        console.error('Error initializing pricing plans:', error);
        console.log('Showing fallback plans due to error');
        showFallbackPlans(container);
    }
}

// Show loading state for pricing plans
function showPricingLoading(container) {
    container.innerHTML = `
        <div class="pricing-loading">
            <div class="loading-spinner"></div>
            <p>Loading pricing plans...</p>
        </div>
    `;
}

// Show fallback plans (when Supabase is not available)
function showFallbackPlans(container) {
    console.log('Showing fallback plans');
    
    const fallbackPlans = [
        {
            id: 'free-trial',
            name: 'Free Trial',
            price: 0,
            duration: '7 Days',
            billing_cycle: 'trial',
            features: ['Full feature access', 'HD quality mirroring', 'Basic recording', 'Email support']
        },
        {
            id: 'professional',
            name: 'Professional',
            price: 29.99,
            duration: 'Lifetime',
            billing_cycle: 'one-time',
            features: ['All trial features', '4K recording', 'Live streaming', 'Priority support', 'Advanced settings', 'Lifetime updates']
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 199,
            duration: 'Custom',
            billing_cycle: 'year',
            features: ['All professional features', 'Multi-device support', 'Team management', 'Custom integrations', 'Dedicated support', 'SLA guarantee']
        }
    ];
    
    renderPricingPlans(container, fallbackPlans);
    
    // Mark as fallback plans loaded
    container.classList.add('fallback-plans-loaded');
}

// Show no plans message
function showNoPlansMessage(container) {
    container.innerHTML = `
        <div class="no-plans-message">
            <h3>No Plans Available</h3>
            <p>Currently, there are no subscription plans available. Please check back later or contact our support team for more information.</p>
            <div class="no-plans-actions">
                <button class="cta-btn" onclick="retryPricingPlans()">Retry Loading Plans</button>
                <a href="#contact" class="cta-btn secondary">Contact Support</a>
            </div>
        </div>
    `;
}

// Render pricing plans
function renderPricingPlans(container, plans) {
    container.innerHTML = '';

    plans.forEach((plan, index) => {
        const planCard = createPlanCard(plan, index);
        container.appendChild(planCard);
    });
}

// Create individual plan card
function createPlanCard(plan, index) {
    const card = document.createElement('div');
    card.className = `pricing-card ${plan.name?.toLowerCase() || 'plan'}`;
    
    // Add popular badge if it's the second plan (usually professional)
    const popularBadge = index === 1 ? '<div class="popular-badge">Most Popular</div>' : '';
    
    // Parse features from plan description or use default
    const features = plan.features ? JSON.parse(plan.features) : getDefaultFeatures(plan.name);
    
    card.innerHTML = `
        ${popularBadge}
        <div class="card-header">
            <div class="plan-icon">${getPlanIcon(plan.name)}</div>
            <h3 class="plan-name">${plan.name || 'Plan'}</h3>
            <div class="plan-badge">${plan.duration || 'Custom'}</div>
        </div>
        <div class="plan-price">
            <span class="currency">$</span>
            <span class="amount">${plan.price || '0'}</span>
            <span class="period">/${plan.billing_cycle || 'month'}</span>
        </div>
        <div class="plan-features">
            ${features.map(feature => `
                <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span class="feature-text">${feature}</span>
                </div>
            `).join('')}
        </div>
        <button class="pricing-btn ${plan.name?.toLowerCase()}-btn" onclick="handlePlanAction('${plan.name}', ${plan.price})">
            <span class="btn-text">${getPlanButtonText(plan.name)}</span>
            <span class="btn-arrow">→</span>
        </button>
    `;

    // Add entrance animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.animation = `slideInUp 0.8s ease-out ${0.5 + (index * 0.2)}s forwards`;

    return card;
}

// Get plan icon based on name
function getPlanIcon(planName) {
    const icons = {
        'Free Trial': '🚀',
        'Professional': '⭐',
        'Enterprise': '🏢',
        'Basic': '📱',
        'Premium': '💎',
        'Ultimate': '🚀'
    };
    return icons[planName] || '📋';
}

// Get default features based on plan name
function getDefaultFeatures(planName) {
    const defaultFeatures = {
        'Free Trial': [
            'Full feature access',
            'HD quality mirroring',
            'Basic recording',
            'Email support'
        ],
        'Professional': [
            'All trial features',
            '4K recording',
            'Live streaming',
            'Priority support',
            'Advanced settings',
            'Lifetime updates'
        ],
        'Enterprise': [
            'All professional features',
            'Multi-device support',
            'Team management',
            'Custom integrations',
            'Dedicated support',
            'SLA guarantee'
        ]
    };
    return defaultFeatures[planName] || ['Feature 1', 'Feature 2', 'Feature 3'];
}

// Get plan button text
function getPlanButtonText(planName) {
    const buttonTexts = {
        'Free Trial': 'Start Free Trial',
        'Professional': 'Get Professional',
        'Enterprise': 'Contact Sales',
        'Basic': 'Get Started',
        'Premium': 'Get Premium',
        'Ultimate': 'Get Ultimate'
    };
    return buttonTexts[planName] || 'Get Plan';
}

// Handle plan action
function handlePlanAction(planName, price) {
    if (planName === 'Free Trial') {
        showDownloadModal();
    } else if (planName === 'Enterprise') {
        showContactModal();
    } else {
        showDownloadModal();
    }
}

// Contact modal for plan actions
function showContactModal() {
    const contactModal = createModal('contact-modal', 'Contact Sales', `
        <div class="contact-content">
            <div class="contact-info">
                <h3>Get in Touch</h3>
                <p>Our sales team is here to help you with enterprise solutions and custom pricing.</p>
                <div class="contact-methods">
                    <div class="contact-method">
                        <div class="contact-icon">📧</div>
                        <div class="contact-details">
                            <h4>Email Sales</h4>
                            <p>sales@mirrorweb.com</p>
                        </div>
                    </div>
                    <div class="contact-method">
                        <div class="contact-icon">💬</div>
                        <div class="contact-details">
                            <h4>Live Chat</h4>
                            <p>Available 24/7</p>
                        </div>
                    </div>
                    <div class="contact-method">
                        <div class="contact-icon">📞</div>
                        <div class="contact-details">
                            <h4>Phone Support</h4>
                            <p>+1 (555) 123-4567</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(contactModal);
}