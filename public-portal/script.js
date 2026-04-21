const API_BASE_URL = 'http://localhost:5000/api';

const state = {
  events: [],
  filteredEvents: []
};

const elements = {
  searchInput: document.getElementById('searchInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  dateFilter: document.getElementById('dateFilter'),
  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  emptyState: document.getElementById('emptyState'),
  upcomingSection: document.getElementById('upcoming-section'),
  pastSection: document.getElementById('past-section'),
  upcomingEvents: document.getElementById('upcomingEvents'),
  pastEvents: document.getElementById('pastEvents')
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const formatTime = (timeStr) =>
  new Date(`1970-01-01T${timeStr}`).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

const isRegistrationClosed = (deadline) => {
  if (!deadline) return true;
  return new Date(deadline) < new Date();
};

const toStartOfDay = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
};

const truncate = (text, max = 130) => {
  if (!text) return 'No description provided.';
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const buildCard = (event) => {
  const cardCol = document.createElement('div');
  cardCol.className = 'col-12 col-md-6 col-lg-4';

  const closed = isRegistrationClosed(event.registration_deadline);
  const posterMarkup = event.poster_url
    ? `<img src="${event.poster_url}" class="card-img-top event-poster" alt="${event.title} poster">`
    : '<div class="event-poster d-flex align-items-center justify-content-center bg-light text-muted">No Poster</div>';

  cardCol.innerHTML = `
    <div class="card h-100 shadow-sm border-0 event-card">
      ${posterMarkup}
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <h3 class="card-title h5 mb-0">${event.title}</h3>
          <span class="badge text-bg-secondary">${event.category || 'General'}</span>
        </div>
        <p class="meta-line mb-1"><strong>Date:</strong> ${formatDate(event.date)} at ${formatTime(event.time)}</p>
        <p class="meta-line mb-3"><strong>Venue:</strong> ${event.venue}</p>
        <p class="card-text text-muted">${truncate(event.description)}</p>
        <div class="mt-auto">
          <button class="btn btn-primary w-100" ${closed ? 'disabled' : ''}>
            ${closed ? 'Registration Closed' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  `;

  const button = cardCol.querySelector('button');
  if (!closed) {
    button.addEventListener('click', () => {
      window.open(event.registration_link, '_blank', 'noopener,noreferrer');
    });
  }

  return cardCol;
};

const populateCategoryFilter = (events) => {
  const categories = [...new Set(events.map((event) => event.category).filter(Boolean))].sort();
  elements.categoryFilter.innerHTML = '<option value="">All categories</option>';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.appendChild(option);
  });
};

const renderEvents = () => {
  const today = toStartOfDay(new Date());
  const upcoming = state.filteredEvents.filter((event) => toStartOfDay(event.date) >= today);
  const past = state.filteredEvents.filter((event) => toStartOfDay(event.date) < today);

  elements.upcomingEvents.innerHTML = '';
  elements.pastEvents.innerHTML = '';

  upcoming.forEach((event) => elements.upcomingEvents.appendChild(buildCard(event)));
  past.forEach((event) => elements.pastEvents.appendChild(buildCard(event)));

  const hasAnyEvents = state.filteredEvents.length > 0;
  elements.emptyState.classList.toggle('d-none', hasAnyEvents);

  elements.upcomingSection.classList.toggle('d-none', upcoming.length === 0);
  elements.pastSection.classList.toggle('d-none', past.length === 0);
};

const applyFilters = () => {
  const searchTerm = elements.searchInput.value.trim().toLowerCase();
  const category = elements.categoryFilter.value;
  const date = elements.dateFilter.value;

  state.filteredEvents = state.events.filter((event) => {
    const titleMatch = event.title.toLowerCase().includes(searchTerm);
    const categoryMatch = !category || event.category === category;
    const dateMatch = !date || event.date === date;
    return titleMatch && categoryMatch && dateMatch;
  });

  renderEvents();
};

const showError = (message) => {
  elements.errorState.textContent = message;
  elements.errorState.classList.remove('d-none');
};

const fetchPublicEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/public`);
    if (!response.ok) {
      throw new Error('Failed to load public events from server.');
    }

    const result = await response.json();
    state.events = result.data || [];
    state.filteredEvents = [...state.events];

    populateCategoryFilter(state.events);
    renderEvents();
  } catch (error) {
    showError(error.message);
  } finally {
    elements.loadingState.classList.add('d-none');
  }
};

elements.searchInput.addEventListener('input', applyFilters);
elements.categoryFilter.addEventListener('change', applyFilters);
elements.dateFilter.addEventListener('change', applyFilters);

fetchPublicEvents();
