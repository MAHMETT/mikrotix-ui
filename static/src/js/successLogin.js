let countdownTime = 5;
const countdownElement = document.getElementById('countdown');

const countdownInterval = setInterval(() => {
    countdownTime--;
    countdownElement.textContent = countdownTime;

    if (countdownTime <= 0) {
        clearInterval(countdownInterval);
        redirectToDashboard();
    }
}, 1000);

document.getElementById('redirectBtn').addEventListener('click', () => {
    clearInterval(countdownInterval);
});
