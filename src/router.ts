import Home from './pages/home';
import SmallClub from './pages/small-club';

type Route = {
    path: string;
    view: () => string;
};

const routes: Route[] = [
    { path: '/', view: Home },
    { path: '/small', view: SmallClub}
];

export function router(): void {
    const potentialMatch = routes.find(route => route.path === location.pathname);
    const view = potentialMatch ? potentialMatch.view : () => `<h1>404 Not Found</h1>`;
    const app = document.getElementById('app');
    if (app) app.innerHTML = view();
}

export function navigateTo(url: string): void {
    history.pushState(null, '', url);
    router();
}