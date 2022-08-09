const questions = [];

questions.push({
    type: "confirm",
    name: "hasCover",
    message: "Does it has a cover?",
    default: true,
});

questions.push({
    type: "input",
    name: "removePages",
    message: "Input pages to remove as a string. You can use (,) and (-) to specify individual pages and ranges respectively. Use PDF page numeration.",
    default: "",
});

// Crop
questions.push({
    type: "number",
    name: "cropTop",
    message: "Crop top (inches): ",
    default: 0,
}, {
    type: "number",
    name: "cropRight",
    message: "Crop right (inches): ",
    default: 0,
}, {
    type: "number",
    name: "cropBottom",
    message: "Crop bottom (inches): ",
    default: 0,
}, {
    type: "number",
    name: "cropLeft",
    message: "Crop left (inches): ",
    default: 0,
});

// Margins
questions.push({
    type: "number",
    name: "marginTop",
    message: "Margin top (inches): ",
    default: 0.2,
}, {
    type: "number",
    name: "marginBottom",
    message: "Margin bottom (inches): ",
    default: 0.2,
}, {
    type: "number",
    name: "marginOutside",
    message: "Margin outside (inches): ",
    default: 0.2,
}, {
    type: "number",
    name: "marginInside",
    message: "Margin inside (inches): ",
    default: 0.3,
}
);

module.exports = questions;