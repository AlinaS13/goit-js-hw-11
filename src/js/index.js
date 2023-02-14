import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const pictureInstance = axios.create({
  baseURL: 'https://pixabay.com/api',
});

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

form.addEventListener('submit', featchPicture);

loadMoreBtn.addEventListener('click', loadMorePiture);

let page = 1;
let totalHits = 0;
let currentHits = 0;

function loadMorePiture(e) {
  e.preventDefault();
  createMarcap(searchQuery);
  console.log(currentHits);
  console.log(totalHits);
  if (currentHits === totalHits) {
    loadMoreBtn.classList.add('is-hidden');
    return Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function featchPicture(e) {
  e.preventDefault();
  searchQuery = form.elements.searchQuery.value.trim();
  if (searchQuery === '') {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  gallery.innerHTML = '';
  createMarcap(searchQuery);
}

function createMarcap(searchQuery) {
  const pictureRequest = pictureInstance.get('/', {
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

  pictureRequest
    .then(({ data }) => {
      if (data.hits.length === 0) {
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      currentHits += data.hits.length;
      totalHits = data.totalHits;
      page += 1;
      loadMoreBtn.classList.remove('is-hidden');
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
  <img src="${webformatURL}" alt="${tags}" class="gallery-image" loading="lazy" />
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
      gallery.insertAdjacentHTML('beforeend', markup.join(''));
      return Notify.success(`Hooray! We found ${data.totalHits} images.`);
    })
    .catch(error => {
      console.log(error);
    });
}
