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
let searchQuery = 0;
let totalHits;
let currentHits = 0;
let pictureEnds = false;

// function loadMorePiture(e) {
//   e.preventDefault();
//   createMarkap(searchQuery);
//   if (currentHits === totalHits) {
//     loadMoreBtn.classList.add('is-hidden');
//     return Notify.info(
//       "We're sorry, but you've reached the end of search results."
//     );
//   }
// }

function renderPicture(e) {
  e.preventDefault();
  searchQuery = form.elements.searchQuery.value.trim();
  // loadMoreBtn.classList.add('is-hidden');
  if (searchQuery === '') {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  pictureEnds = false;
  gallery.innerHTML = '';
  createMarkap();
}

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (pictureEnds === false) {
          createMarkap();
        }
      }
    });
  },
  { rootMargin: '200px' }
);

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

function createMarkap() {
  fetchPicture(searchQuery)
    .then(({ hits, totalHits }) => {
      if (hits.length === 0) {
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      currentHits += hits.length;
      totalHits = totalHits;

      // loadMoreBtn.classList.remove('is-hidden');
      const markup = hits.map(
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
      if (gallery.textContent.trim() == '' && currentHits > 0) {
        Notify.success(`Hooray! We found ${totalHits} images.`);
      }
      if (currentHits === totalHits) {
        // loadMoreBtn.classList.add('is-hidden');
        pictureEnds = true;
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
      gallery.insertAdjacentHTML('beforeend', markup.join(''));
      observer.observe(guard);
      simpleLightbox();
      scroll();
      page += 1;
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
