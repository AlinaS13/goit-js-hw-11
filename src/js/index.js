import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const pictureInstance = axios.create({
  baseURL: 'https://pixabay.com/api',
});

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.guard');
// const loadMoreBtn = document.querySelector('.load-more');

form.addEventListener('submit', renderPicture);
// loadMoreBtn.addEventListener('click', loadMorePiture);

let page = 1;
let searchQuery;
let totalHits = 0;
let currentHits = 0;

// function loadMorePiture(e) {
//   e.preventDefault();
//   fetchPicture(searchQuery);
//   if (currentHits === totalHits) {
// loadMoreBtn.classList.add('is-hidden');
//     return Notify.info(
//       "We're sorry, but you've reached the end of search results."
//     );
//   }
// }

function renderPicture(e) {
  e.preventDefault();
  searchQuery = form.elements.searchQuery.value.trim();
  if (searchQuery === '') {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  gallery.innerHTML = '';
  createMarkap(searchQuery);
}

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        createMarkap(searchQuery);
      }
    });
  },
  { rootMargin: '200px' }
);

async function fetchPicture(searchQuery) {
  const { data } = await pictureInstance.get('/', {
    params: {
      key: '33606619-e92c95447caff2b5a446312ae',
      q: searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: page,
    },
  });
  return data;
}

function createMarkap(searchQuery) {
  fetchPicture(searchQuery)
    .then(data => {
      if (data.hits.length === 0 && totalHits == 0) {
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      currentHits += data.hits.length;
      totalHits = data.totalHits;
      // loadMoreBtn.classList.remove('is-hidden');
      const markup = data.hits.map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => `<div class="photo-card">
        <a href="${largeImageURL}" loading="lazy" width="400px" height="244px" style="object-fit:cover;">
  <img src="${webformatURL}" alt="${tags}" class="gallery-image" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b> Likes: ${likes} </b>
    </p>
    <p class="info-item">
      <b> Views: ${views} </b>
    </p>
    <p class="info-item">
      <b> Comments: ${comments} </b>
    </p>
    <p class="info-item">
      <b> Downloads: ${downloads} </b>
    </p>
  </div>
</div>`
      );
      if (gallery.textContent.trim() == '') {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
      if (currentHits === totalHits) {
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
      gallery.insertAdjacentHTML('beforeend', markup.join(''));
      simpleLightbox();
      scroll();
      page += 1;
      observer.observe(guard);
    })
    .catch(error => {
      console.log(error);
    });
}

function scroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function simpleLightbox() {
  let lightbox = new SimpleLightbox('.gallery a', {
    captions: false,
    captionDelay: 250,
    enableKeyboard: true,
    doubleTapZoom: 5,
  });
  lightbox.refresh();
}
