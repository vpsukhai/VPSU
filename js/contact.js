// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Simple validation
            if (!name || !phone || !message) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Here you would typically send the data to a server
            // For now, we'll just show a success message
            alert(`Thank you, ${name}! Your message has been sent. We'll contact you shortly at ${phone}.`);
            
            // Reset the form
            contactForm.reset();
            
            // In a real implementation, you would:
            // 1. Send data to your backend (PHP, Node.js, etc.)
            // 2. Handle the response
            // 3. Show appropriate messages to the user
        });
    }
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});