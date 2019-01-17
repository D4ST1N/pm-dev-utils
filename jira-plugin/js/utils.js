const request = (method, url) => {
  return new Promise(  (resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      }
    };

    xhr.onerror = function () {
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };

    xhr.send();
  });
};

const get = (url) => request('get', url);
const post = (url) => request('post', url);

const processParams = (params) => {
  return Object.entries(params).map(
    ([key, value]) => `${key}=${encodeURIComponent(value)}`
  ).join('&');
};
