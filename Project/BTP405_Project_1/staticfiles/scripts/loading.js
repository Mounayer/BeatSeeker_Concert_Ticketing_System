const body_wrapper = document.querySelector('#body_cover');
const navbar = document.querySelector('.navbar');

/**
 * This function disables the loading cover for the entire content.
 */
function disableLoadingCoverEntireContent() {
    body_wrapper.style.display = 'none';
}

/**
 * This function creates a loading cover for an element you specify.
 * @param {HTMLElement} elem Element, for which you want to create loading cover.
 */
function createLoadingCoverForElement(elem) {
    const cover = document.createElement('div');
    cover.innerHTML = '<div class="text-center">\n' +
        '        <div class="spinner-border attention_bg_color" role="status"></div>\n' +
        '    </div>';
    cover.classList.add('loading_cover');
    cover.classList.add('background_color');
    cover.style.display = 'none';
    elem.style.position = 'relative';
    elem.appendChild(cover);
    return cover;
}

/**
 * This function covers an element you pass with loading cover. IMPORTANT: (createLoadingCoverForElement) has to be called beforehand.
 * @param {HTMLElement} elem Element, which you want to cover with loading animation.
 */
function activateLoadingCoverForElement(elem) {
    let cover = elem.querySelector('.loading_cover');
    cover = elem.querySelector('.loading_cover');
    if(cover == null) {
        cover = createLoadingCoverForElement(elem);
    }
    cover.style.display = 'block';
}

/**
 * This function removes the cover for an element you pass. IMPORTANT: (activateLoadingCoverForElement) has to be called beforehand.
 * @param {HTMLElement} elem Element, for which you want to remove loading cover.
 */
function disableLoadingCoverForElement(elem) {
    let cover = elem.querySelector('.loading_cover');
    if(cover == null) {
        cover = createLoadingCoverForElement(elem);
    }
    cover.style.display = 'none';
}

/**
 * This function covers the entire content with loading screen.
 */
function addLoadingCoverEntireContent() {
    body_wrapper.classList.add('body_cover');
    body_wrapper.style.display = 'block';
    body_wrapper.classList.add('background_color');
    body_wrapper.innerHTML = '<div class="text-center">\n' +
        '        <div class="spinner-border attention_bg_color" role="status"></div>\n' +
        '    </div>';
    body_wrapper.style.top = getTopOffset() + 'px';
}

function getTopOffset() {
    return navbar.offsetHeight;
}
