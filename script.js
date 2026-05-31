// MUSIC

function playMusic(){
    const music = document.getElementById("birthdayMusic");
    music.play().catch(error => {
        console.log("Play failed: ", error);
    });
}

function pauseMusic(){
    const music = document.getElementById("birthdayMusic");
    music.pause();
}

// BALLOON RELEASE SYSTEM

function releaseBalloons() {
    const container = document.createElement("div");
    container.className = "balloon-container";
    document.body.appendChild(container);

    const colors = [
        "rgba(255, 99, 132, 0.85)",   // Coral Pink
        "rgba(255, 159, 64, 0.85)",   // Tangerine
        "rgba(255, 205, 86, 0.85)",   // Sunshine Yellow
        "rgba(75, 192, 192, 0.85)",   // Mint Teal
        "rgba(54, 162, 235, 0.85)",   // Sky Blue
        "rgba(153, 102, 255, 0.85)",  // Lavender Purple
        "rgba(243, 166, 187, 0.85)"   // Rose Pink
    ];

    const balloonCount = 30;

    for (let i = 0; i < balloonCount; i++) {
        const balloon = document.createElement("div");
        balloon.className = "balloon";
        
        // Randomize sizes, positions, delays, and float speed
        const sizeWidth = Math.floor(Math.random() * 20) + 45; // 45px to 65px
        const sizeHeight = sizeWidth * 1.25;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100; // 0% to 100% of viewport width
        const delay = Math.random() * 5; // 0s to 5s stagger delay
        const duration = Math.random() * 4 + 7; // 7s to 11s duration

        balloon.style.width = `${sizeWidth}px`;
        balloon.style.height = `${sizeHeight}px`;
        balloon.style.background = color;
        balloon.style.color = color; // For the knot triangle currentColor border
        balloon.style.left = `${left}%`;
        balloon.style.animationDelay = `${delay}s`;
        balloon.style.animationDuration = `${duration}s`;

        // Create string element
        const string = document.createElement("div");
        string.className = "balloon-string";
        balloon.appendChild(string);

        container.appendChild(balloon);

        // Delete individual balloon from DOM after float duration completes
        setTimeout(() => {
            balloon.remove();
        }, (delay + duration) * 1000);
    }

    // Cleanup container element from DOM after all balloons finished floating
    setTimeout(() => {
        container.remove();
    }, 16000);
}

// ON LOAD SYSTEMS
window.addEventListener("DOMContentLoaded", () => {
    // 1. Release Balloons
    releaseBalloons();

    // 2. Initial Confetti Celebration
    confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
    });

    // 3. Staggered Side Confetti Cannons
    setTimeout(() => {
        confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.85 }
        });
        confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.85 }
        });
    }, 600);

    // 4. Autoplay music with interaction fallback
    const music = document.getElementById("birthdayMusic");
    music.play().catch(() => {
        console.log("Autoplay blocked by browser. Music will start on first user interaction.");
        
        const playOnInteraction = () => {
            music.play().then(() => {
                removeListeners();
            }).catch(err => console.log("Interaction play failed: ", err));
        };
        
        const removeListeners = () => {
            document.removeEventListener("click", playOnInteraction);
            document.removeEventListener("touchstart", playOnInteraction);
            document.removeEventListener("keydown", playOnInteraction);
        };
        
        document.addEventListener("click", playOnInteraction);
        document.addEventListener("touchstart", playOnInteraction);
        document.addEventListener("keydown", playOnInteraction);
    });
});

// CONFETTI SURPRISE

function showSurprise(){
    // LEFT CANNON
    confetti({
        particleCount: 130,
        spread: 80,
        angle: 60,
        origin: { x: 0, y: 0.85 }
    });
    // RIGHT CANNON
    confetti({
        particleCount: 130,
        spread: 80,
        angle: 120,
        origin: { x: 1, y: 0.85 }
    });

    // Secondary delayed central burst
    setTimeout(() => {
        confetti({
            particleCount: 80,
            spread: 100,
            origin: { x: 0.5, y: 0.4 }
        });
    }, 300);

    // Staggered secondary cannon shots
    setTimeout(() => {
        confetti({
            particleCount: 70,
            angle: 65,
            spread: 60,
            origin: { x: 0, y: 0.85 }
        });
        confetti({
            particleCount: 70,
            angle: 115,
            spread: 60,
            origin: { x: 1, y: 0.85 }
        });
    }, 600);

    const modal = document.getElementById("surpriseModal");
    modal.classList.add("active");

    // Also trigger playing the music if they haven't manually clicked play yet
    playMusic();
}

function closeSurprise(){
    const modal = document.getElementById("surpriseModal");
    modal.classList.remove("active");
}

// TYPING EFFECT

const text =
`suhaniiiii wish you a very happiest birthday🎂🫶
I'm truly blessed that i have friend like you in my
life you are always my family and i know i have my 
aditi by my side i want this bond forever🧿and thank 
you being in my life🤝♾️ once again happy happy birthday 
masticheeeeeeeeeeeeeeee.............................!!!`;

let i = 0;
let typingStarted = false;

function typing(){

    if(i < text.length){

        document.getElementById("typingText").innerHTML += text.charAt(i);

        i++;

        setTimeout(typing,40);
    }
}

// SCROLL REVEAL OBSERVER
window.addEventListener("DOMContentLoaded", () => {
    const revealElements = document.querySelectorAll(".reveal-element, .gallery");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                
                // Trigger typing animation when the letter container is revealed
                if (entry.target.querySelector("#typingText") && !typingStarted) {
                    typingStarted = true;
                    setTimeout(typing, 500); // Wait for the transition to finish
                }
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => observer.observe(el));
});