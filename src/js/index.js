import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { getPictureValues } from './func-api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  formSearch: document.querySelector('.search-form'),
  galleryElem: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
  inputName: document.querySelector('input'),
  btnSearch: document.querySelector('.search-btn'),
  perPage: 40,
};
let currentPage;
let lbox = createLbox();
let qPage;

refs.btnLoadMore.classList.add('is-hidden');
refs.inputName.addEventListener('input', omInput);
// refs.btnLoadMore.addEventListener('click', onClickLoadMore);
refs.btnSearch.disabled = true;

function omInput() {
  refs.btnSearch.disabled = false;
  refs.btnSearch.addEventListener('click', onClickSearch);
}
async function onClickSearch(e) {
  e.preventDefault();
  refs.galleryElem.innerHTML = '';
  currentPage = 1;
  const inputNameValue = refs.inputName.value.trim();
  try {
    const picturesResp = await getPictureValues(inputNameValue);

    const { hits, totalHits } = picturesResp;
    // console.log(`totalHits ${totalHits}`);
    if (!hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    if (
      (totalHits < refs.perPage) &
      !refs.btnLoadMore.classList.contains('is-hidden')
    ) {
      refs.btnLoadMore.classList.add('is-hidden');
    }

    qPage = Math.ceil(totalHits / refs.perPage);
    // console.log(`qPage = ${qPage}`);
    if (currentPage < qPage) {
      refs.btnLoadMore.classList.remove('is-hidden');
      refs.btnLoadMore.addEventListener('click', onClickLoadMore);
    }

    Notify.info(`Hooray! We found ${totalHits} images.`);
    refs.galleryElem.insertAdjacentHTML('beforeend', cardsMarkup(hits));
    lbox.refresh();
  } catch (error) {
    Notify.failure(error.message);
    console.log(error);
  }
}

async function onClickLoadMore(e) {
  e.preventDefault();
  currentPage += 1;
  const inputNameValue = refs.inputName.value.trim();
  try {
    const { hits, totalHits } = await getPictureValues(
      inputNameValue,
      currentPage
    );
    if (currentPage === qPage) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      refs.btnLoadMore.classList.add('is-hidden');
    }
    refs.galleryElem.insertAdjacentHTML('beforeend', cardsMarkup(hits));
    lbox.refresh();
    scrollGallery();
  } catch (error) {
    Notify.failure(error.message);
    console.log(error);
  }
}
function createLbox() {
  return new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
  });
}

function scrollGallery() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function cardsMarkup(hits) {
  return hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
        <a href = "${largeImageURL}"> 
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
        <p class="info-item">
         <b>Likes ${likes} </b>
        </p>
        <p class="info-item">
        <b>Views ${views} </b>
        </p>
        <p class="info-item">
        <b>Comments ${comments} </b>
        </p>
        <p class="info-item">
        <b>Downloads ${downloads} </b>
        </p>
        </div>
        </div> `;
      }
    )
    .join('');
}
