// State Management
let currentScore = 0;
const SCORE_THRESHOLD = 80;

// DOM Elements
const scoreDisplay = document.getElementById('score-display');
const publishBtn = document.getElementById('publish-btn');
const listingStatus = document.getElementById('listing-status');
const errorMsg = document.getElementById('error-msg');
const modal = document.getElementById('loadingModal');
const listingCard = document.getElementById('listing-card');

/**
 * Simulates a backend verification request (e.g., API call to Stripe Identity)
 * @param {HTMLElement} btnElement - The button clicked
 * @param {number} points - How much this task contributes to Trust Score
 */
function startVerification(btnElement, points) {
    showModal();
    
    // Simulate network delay
    setTimeout(() => {
        hideModal();
        markAsVerified(btnElement, points);
    }, 2000);
}

/**
 * Simulates a file upload process (e.g., uploading Deed to S3)
 * @param {HTMLElement} btnElement 
 * @param {number} points 
 */
function simulateUpload(btnElement, points) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    
    input.onchange = (e) => {
        if (e.target.files.length > 0) {
            showModal();
            // Simulate processing time
            setTimeout(() => {
                hideModal();
                markAsVerified(btnElement, points);
            }, 1500);
        }
    };
    
    input.click();
}

/**
 * Updates UI and Trust Score when a task is completed
 */
function markAsVerified(btnElement, points) {
    if (btnElement.classList.contains('btn-verified')) return;

    // Update Button State
    btnElement.textContent = "✓ Verified";
    btnElement.className = "btn btn-verified";
    btnElement.onclick = null; // Disable further clicks

    // Update Trust Score
    currentScore += points;
    updateScoreUI();
    
    // Check if ready to publish
    checkCompletion();
}

function updateScoreUI() {
    scoreDisplay.textContent = currentScore + "%";
    
    // Dynamic color coding
    if (currentScore >= 50 && currentScore < 80) {
        scoreDisplay.style.color = "#f59e0b"; // Orange/Yellow
    } else if (currentScore >= 80) {
        scoreDisplay.style.color = "#10b981"; // Green
    }
}

function checkCompletion() {
    if (currentScore >= SCORE_THRESHOLD) {
        enablePublishing();
    }
}