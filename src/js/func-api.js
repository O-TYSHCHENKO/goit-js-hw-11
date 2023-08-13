import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';

const params = {
  key: '38718705-12eac50af4093d95969df3182',
  orientation: 'horizontal',
  image_type: 'photo',
  safesearch: 'true',
  per_page: 40,
};

async function getPictureValues(value, page) {
  params.q = value;
  params.page = page;
  const { data } = await axios.get(BASE_URL, { params });
  //   console.log(`page: ${page}`);
  return data;
}

export { getPictureValues };
