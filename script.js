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