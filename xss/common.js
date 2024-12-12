const flagKey = "FLAG";
const currentPath = window.location.pathname;

function generateRandomFlag(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `FLAG{${result}}`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// if (!sessionStorage.getItem(flagKey)) {
//   const randomFlag = generateRandomFlag(16);
//   sessionStorage.setItem(flagKey, randomFlag);
// }

if (!getCookie(flagKey)) {
  const randomFlag = currentPath + ':' + generateRandomFlag(16);
  document.cookie = `${flagKey}=${randomFlag}; path=${currentPath}`;
}

const _alert = window.alert;
window.alert = function(arg) {
  fetch(`/log?message=${arg}`);
  alert(arg);
};