
const questions = [];

// Has cover
questions.push({
    type: "confirm",
    name: "hasCover",
    message: "Does it has a cover?",
    initial: true,
});
// Remove pages
questions.push({
    type: "input",
    name: "removePages",
    message: "Input pages to remove as a string. You can use (,) and (-) to specify individual pages and ranges respectively. Use PDF page numeration.",
    initial: "",
});
// Crop
questions.push({
    type: "input",
    name: "cropTop",
    message: "Crop top (inches): ",
    initial: 0,
}, {
    type: "input",
    name: "cropRight",
    message: "Crop right (inches): ",
    initial: 0,
}, {
    type: "input",
    name: "cropBottom",
    message: "Crop bottom (inches): ",
    initial: 0,
}, {
    type: "input",
    name: "cropLeft",
    message: "Crop left (inches): ",
    initial: 0,
});
// Margins
questions.push({
    type: "input",
    name: "marginTop",
    message: "Margin top (inches): ",
    initial: 0.2,
}, {
    type: "input",
    name: "marginBottom",
    message: "Margin bottom (inches): ",
    initial: 0.2,
}, {
    type: "input",
    name: "marginOutside",
    message: "Margin outside (inches): ",
    initial: 0.2,
}, {
    type: "input",
    name: "marginInside",
    message: "Margin inside (inches): ",
    initial: 0.3,
});

module.exports = questions;