// app.js - State Management & Cypress Target Payload
function getFormData() {
    return {
        firstName: document.getElementById('firstName').value,
        email: document.getElementById('email').value,
        // ... 30 Fields Data Map
    };
}

function submitRegistration() {
    fetch('/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getFormData())
    });
}