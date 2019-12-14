"use strict";
const { log } = console;
const targetNode = document.getElementsByTagName('html')[0];
const config = JSON.parse("{ \"childList\": true, \"subtree\": true }");

let current_location = "Nepal";
let cur_year = new Date().getFullYear();
let age = cur_year - 2004;
let grade = "11th"

const observer = new MutationObserver(function (mutationsList, observer) {
    mutationsList.forEach(mutation => {
        if (mutation.type === 'childList') {
            let scNode = mutation.addedNodes[0];
            if (scNode.innerHTML && scNode.classList.contains('exec')) {
                scNode.innerHTML = parseTemplate(scNode.innerHTML);
            }
        }
    });
});
observer.observe(targetNode, config);

function parseTemplate(text) {
    try {
        return eval('\`' + text + '\`');
    } catch (err) {
        return err.message;
    }
}