document.addEventListener("DOMContentLoaded", function() {
    const button = document.createElement('button');
    button.textContent = 'Click me';
    document.body.appendChild(button);

    button.addEventListener('click', function() {
        alert('Button was clicked!');
    });
});
