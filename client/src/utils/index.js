import { ntc } from "./ntc";

export const prettifyDate = (date) => {
    let prettierDate = date.split('T')[0];
    prettierDate = `${prettierDate.split('-')[1]}/${prettierDate.split('-')[2]}/${prettierDate.split('-')[0]}`
    return prettierDate;
}

export const elementHasParent = (element, selector) => {
    return element.closest(selector);
}

export const shrinkit = (element, destroy = false) => {
    element.classList.add('goodbye');
    if (destroy) setTimeout(() => element.style.display = 'none', 200);
}

export const formatNumber = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export { ntc }