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
let searchQuery = '';
let totalHitsCount;
let currentHits = 0;
let pictureEnds = false;

async function fetchPicture() {
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

function parsData() {
  fetchPicture(searchQuery)
    .then(data => {
      if (data.hits.length === 0) {
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      currentHits += data.hits.length;
      totalHitsCount = data.totalHits;
      createMarkap(data);
      // loadMoreBtn.classList.remove('is-hidden');
    })
    .catch(error => {
      console.log(error);
    });
}

function createMarkap(data) {
  const markup = data.hits.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) =>
      `<div class="photo-card">
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
  if (gallery.textContent.trim() == '' && currentHits > 0) {
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }
  if (currentHits === totalHitsCount) {
    // loadMoreBtn.classList.add('is-hidden');
    pictureEnds = true;
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
  gallery.insertAdjacentHTML('beforeend', markup.join(''));
  observer.observe(guard);
  lightbox.refresh();
  scroll();
  page += 1;
}

function renderPicture(e) {
  e.preventDefault();
  searchQuery = form.elements.searchQuery.value.trim();
  page = 1;
  totalHitsCount = 0;
  currentHits = 0;
  if (searchQuery === '') {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  parsData();
  pictureEnds = false;
  gallery.innerHTML = '';
  observer.unobserve(guard);
}

// function loadMorePiture(e) {
//   e.preventDefault();
//   if (currentHits === totalHitsCount) {
//     loadMoreBtn.classList.add('is-hidden');
//     return Notify.info(
//       "We're sorry, but you've reached the end of search results."
//     );
//   }
//   parsData();
//   createMarkap(data);
// }

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (pictureEnds === false) {
          parsData();
        }
      }
    });
  },
  { rootMargin: '200px' }
);

function scroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

let lightbox = new SimpleLightbox('.gallery a', {
  captions: false,
  captionDelay: 250,
  enableKeyboard: true,
  doubleTapZoom: 5,
});
