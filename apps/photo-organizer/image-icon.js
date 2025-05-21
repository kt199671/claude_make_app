// Inline SVG for image icon (used as fallback if SVG file doesn't load)
document.addEventListener('DOMContentLoaded', function() {
    const imagePreview = document.getElementById('imagePreview');
    
    // Check if the element exists and is an image
    if (imagePreview && imagePreview.tagName.toLowerCase() === 'img') {
        // Set a fallback if the image fails to load
        imagePreview.onerror = function() {
            // Inline SVG as fallback
            const svgContent = `
                <svg width="80px" height="80px" viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <title>Image Upload Icon</title>
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <rect stroke="#CCCCCC" stroke-width="3" x="5" y="5" width="70" height="70" rx="6"></rect>
                        <path d="M30,50 L50,50 L40,35 L30,50 Z" fill="#CCCCCC"></path>
                        <path d="M15,60 L65,60 L55,40 L40,55 L30,45 L15,60 Z" fill="#CCCCCC"></path>
                        <circle fill="#CCCCCC" cx="60" cy="20" r="5"></circle>
                        <path d="M40,25 L40,15 M35,20 L45,20" stroke="#3498DB" stroke-width="3" stroke-linecap="round"></path>
                    </g>
                </svg>
            `;
            
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            imagePreview.src = url;
            
            // Clean up by revoking the object URL when the image loads
            imagePreview.onload = function() {
                URL.revokeObjectURL(url);
            };
        };
        
        // Set the initial source to the SVG file
        // This is also already set in the HTML, but we ensure it's correctly set here too
        if (!imagePreview.src || imagePreview.src.trim() === '') {
            imagePreview.src = 'image-icon.svg';
        }
    }
    
    // Change image preview when files are selected
    const fileInput = document.getElementById('fileInput');
    if (fileInput && imagePreview) {
        fileInput.addEventListener('change', function() {
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                };
                
                reader.readAsDataURL(fileInput.files[0]);
            }
        });
    }
});