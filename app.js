// 1. Initialize Map
const map = L.map('map', { zoomControl: false }).setView([51.4545, -2.5879], 14);
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Add high-contrast light map base
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CARTO',
    maxZoom: 20
}).addTo(map);

// 2. Global State Variables
let venuesData = [];
let mapMarkers = [];

// 3. Fetch Data from our JSON file
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        venuesData = data;
        renderVenues(venuesData); // Draw sidebar list
        renderMarkers(venuesData); // Draw map pins
    })
    .catch(error => console.error("Error loading venue data:", error));

// 4. Render Markers on the Map
function renderMarkers(venues) {
    // Clear existing markers first
    mapMarkers.forEach(marker => map.removeLayer(marker));
    mapMarkers = [];

    venues.forEach(venue => {
        // Create a custom CSS icon based on the TfL aesthetic
        const tflIcon = L.divIcon({
            className: 'custom-pin',
            html: `<div style=\"width: 20px; height: 20px; background: #FFF; border: 5px solid ${venue.color}; border-radius: 50%; box-shadow: 2px 2px 0px #000;\"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const marker = L.marker([venue.lat, venue.lng], { icon: tflIcon }).addTo(map);
        marker.bindPopup(`<strong>${venue.name.toUpperCase()}</strong><br>${venue.category}`);
        mapMarkers.push(marker);
    });
}

// 5. Render Sidebar Directory
function renderVenues(venues) {
    const venueList = document.getElementById('venueList');
    venueList.innerHTML = ''; // Clear list

    venues.forEach(venue => {
        const card = document.createElement('div');
        card.className = 'venue-card';
        card.style.setProperty('--card-color', venue.color);
        card.innerHTML = `
            <h4>${venue.name}</h4>
            <p>${venue.category} // Zone: ${venue.zone.toUpperCase()}</p>
        `;
        
        // Fly to location when clicked
        card.addEventListener('click', () => {
            map.flyTo([venue.lat, venue.lng], 16, { duration: 1.5 });
        });
        
        venueList.appendChild(card);
    });
}

// 6. UI Logic: Zone Filtering
document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Manage active button state
        document.querySelector('.zone-btn.active').classList.remove('active');
        e.target.classList.add('active');

        const selectedZone = e.target.getAttribute('data-zone');
        
        // Filter the data
        const filteredData = selectedZone === 'all' 
            ? venuesData 
            : venuesData.filter(v => v.zone === selectedZone);
            
        renderVenues(filteredData);
        renderMarkers(filteredData);
    });
});

// 7. UI Logic: Search Bar
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const searchedData = venuesData.filter(v => 
        v.name.toLowerCase().includes(searchTerm) || 
        v.category.toLowerCase().includes(searchTerm)
    );
    
    renderVenues(searchedData);
    renderMarkers(searchedData);
};