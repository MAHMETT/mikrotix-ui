// Countdown and auto redirect functionality
let countdownTime = 5;
const countdownElement = document.getElementById('countdown');

// Function to redirect to dashboard
function redirectToDashboard() {
    // Ganti URL ini dengan URL dashboard yang sesuai
    window.location.href = '$(link-redirect)'; // atau URL dashboard yang sebenarnya
    console.log('Redirecting to dashboard...');
}

// Countdown timer
const countdownInterval = setInterval(() => {
    countdownTime--;
    countdownElement.textContent = countdownTime;

    if (countdownTime <= 0) {
        clearInterval(countdownInterval);
        redirectToDashboard();
    }
}, 1000);

// Clear countdown if user clicks redirect button
document.getElementById('redirectBtn').addEventListener('click', () => {
    clearInterval(countdownInterval);
});
