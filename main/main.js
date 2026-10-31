// Smooth counter animation using requestAnimationFrame
function count_start(item, target, duration = 1600) {
    if (!item) return;
    const startTime = performance.now();
    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);
        item.textContent = current;
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            item.textContent = target;
        }
    }
    requestAnimationFrame(update);
}

// Trigger counters reliably using IntersectionObserver
const countingSection = document.querySelector("#counting");
const countSpans = document.querySelectorAll(".counting h1 span");

if (countingSection && countSpans.length >= 3) {
    let countTriggered = false;
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !countTriggered) {
                countTriggered = true;
                count_start(countSpans[0], 10, 1400);
                count_start(countSpans[1], 200, 1800);
                count_start(countSpans[2], 150, 1800);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });
    counterObserver.observe(countingSection);
}

// Portfolio tab slider with dynamic container height
function updatePortfolioHeight(activeIndex) {
    const secondBox = document.querySelector("#img-section .second-box");
    const boxes = document.querySelectorAll("#img-section .photograph-box");
    if (secondBox && boxes[activeIndex]) {
        const height = boxes[activeIndex].offsetHeight;
        if (height > 0) {
            secondBox.style.height = height + 'px';
        }
    }
}

function img_slider(i) {
    const finalposition = -i * 100 + '%';
    const container = document.querySelector("#img-section .photograph-container");
    if (container) {
        container.style.transform = 'translateX(' + finalposition + ')';
    }
    updatePortfolioHeight(i);
}

const img_section = document.querySelectorAll("#img-section .btn-section button");
const img_section_img = document.querySelectorAll("#img-section .photograph-container .photograph-box");
let utemp = 0;

function updatePortfolioTabs(activeIndex) {
    img_section.forEach((item, idx) => {
        if (idx === activeIndex) {
            item.classList.add("active-portfolio-btn");
            item.style.backgroundColor = "var(--third)";
            item.style.color = "var(--fourth)";
            item.style.borderColor = "var(--third)";
        } else {
            item.classList.remove("active-portfolio-btn");
            item.style.backgroundColor = "transparent";
            item.style.color = "var(--secondary)";
            item.style.borderColor = "rgba(255, 255, 255, 0.4)";
        }
    });
}

if (img_section.length > 0) {
    updatePortfolioTabs(0);
}

img_section.forEach((item, i) => {
    if (img_section_img[i]) {
        img_section_img[i].style.transform = `translateX(${i * 100}%)`;
    }

    item.addEventListener('click', () => {
        img_slider(i);
        utemp = i;
        updatePortfolioTabs(i);
    });
});

// Automatically calculate height on initial load and window resize
window.addEventListener('load', () => updatePortfolioHeight(0));
window.addEventListener('resize', () => updatePortfolioHeight(utemp));
setTimeout(() => updatePortfolioHeight(0), 150);
setTimeout(() => updatePortfolioHeight(0), 600);

// Testimonials vertical slider
const comment_section = document.querySelector(".comment-moving-box");
const comments = document.querySelectorAll(".comment-moving-box .comment-box");
const comment_btn = document.querySelectorAll(".comment-slider-btn");
let ctemp = 0;

function comment_slider(direction) {
    if (!comment_section || comments.length === 0) return;
    if (direction === 'prev') {
        ctemp--;
        if (ctemp < 0) ctemp = comments.length - 1;
    } else {
        ctemp++;
        if (ctemp >= comments.length) ctemp = 0;
    }

    const finalposition = -ctemp * 100 + '%';
    comment_section.style.transform = 'translateY(' + finalposition + ')';
}

if (comment_btn.length >= 2) {
    comment_btn[0].style.cursor = 'pointer';
    comment_btn[1].style.cursor = 'pointer';
    comment_btn[0].addEventListener('click', () => comment_slider('prev'));
    comment_btn[1].addEventListener('click', () => comment_slider('next'));
}

// "Trusted by Leading Businesses" 3-Line Logo Slider
// Populate 3 distinct rows across all 28 brand logos
const logoRows = document.querySelectorAll(".companies-logo .logos");

const row1Logos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const row2Logos = [11, 12, 13, 14, 15, 16, 17, 18, 19];
const row3Logos = [20, 21, 22, 23, 24, 25, 26, 27, 28];
const rowGroups = [row1Logos, row2Logos, row3Logos];

logoRows.forEach((row, rowIndex) => {
    const slides = row.querySelectorAll(".logos-slide");
    const logos = rowGroups[rowIndex] || row1Logos;
    // Repeat the sequence in each slide to guarantee full coverage without gaps on wide screens
    const slideLogos = [...logos, ...logos];

    slides.forEach((slide) => {
        slide.innerHTML = '';
        slideLogos.forEach((num) => {
            slide.innerHTML += `<div><img class="mx-2 md:mx-4" src="./assest/l${num}.png" alt="Client Partner ${num}" loading="lazy"></div>`;
        });
    });
});

// Accordion for "How it really works"
const processItems = document.querySelectorAll(".process-item");

if (processItems.length > 0) {
    processItems.forEach((item) => {
        const header = item.querySelector(".process-header");
        const content = item.querySelector(".process-content");
        const icon = item.querySelector(".process-icon");

        if (!header || !content) return;

        header.addEventListener("click", () => {
            const isOpen = content.classList.contains("open");

            // Collapse ALL items (accordion auto-collapse)
            processItems.forEach((other) => {
                const otherContent = other.querySelector(".process-content");
                const otherIcon = other.querySelector(".process-icon");
                if (otherContent) otherContent.classList.remove("open");
                if (otherIcon) otherIcon.style.transform = "rotate(0deg)";
                other.classList.remove("active-item");
                other.classList.remove("border-third/50");
                other.classList.add("border-white/10");
            });

            // If the clicked item was not open, expand it!
            if (!isOpen) {
                content.classList.add("open");
                if (icon) icon.style.transform = "rotate(180deg)";
                item.classList.add("active-item");
                item.classList.remove("border-white/10");
                item.classList.add("border-third/50");
            }
        });
    });
}

// WhatsApp Quick Contact
function sendmessage() {
    const number = "+919625419480";
    const message = encodeURIComponent("Hey, I'm looking for photography services from LushLens Studio.");
    const url = "https://wa.me/" + number + "?text=" + message;
    window.open(url, '_blank').focus();
}

// EmailJS Initialization
(function () {
    if (typeof emailjs !== 'undefined') {
        emailjs.init("345KajufdsDWWtYlj");
    }
})();

// Contact Form Handler with proper event.preventDefault() and redirection
const emailForm = document.getElementById('emailForm');
if (emailForm) {
    emailForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent instant navigation before email is sent

        const form = this;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending Message...';
        }

        const toName = form['user_name'] ? form['user_name'].value : '';
        const toEmail = form['user_email'] ? form['user_email'].value : '';
        const toPhone = form['user_phone'] ? form['user_phone'].value : '';

        if (typeof emailjs !== 'undefined') {
            emailjs.send("service_5by6eil", "template_cub46ry", {
                user_name: toName,
                user_email: toEmail,
                user_phone: toPhone
            })
            .then(function (response) {
                form.reset();
                window.location.href = "./ThankYou.html";
            })
            .catch(function (error) {
                console.warn("Email service response:", error);
                // Graceful fallback to thank you page
                window.location.href = "./ThankYou.html";
            });
        } else {
            window.location.href = "./ThankYou.html";
        }
    });
}

// 3D DSLR Camera Model Showcase is initialized in ./main/camera3d.js