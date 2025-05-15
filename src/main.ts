import { router } from './router';

document.addEventListener('DOMContentLoaded', ()=>{
  router();
});

window.addEventListener('popstate', router);