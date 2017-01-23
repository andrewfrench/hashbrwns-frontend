var input = document.getElementById("main");
var inputs = document.getElementById("inputs");
var outputs = document.getElementById("outputs");
var ignore = document.getElementById("ignore");

var clearInputButton = document.getElementById("clear-input");
var clearIgnoredButton = document.getElementById("clear-ignored");
var ignoreAllButton = document.getElementById("ignore-all");
var inputError = document.getElementById("input-error");

var inputTags = [];
var outputTags = [];
var ignoreTags = [];

var emptyInputString = "Hashtags will appear here as you type";
var emptyOutputString = "Suggestions will appear here";
var emptyIgnoreString = "Ignored tags will appear here";
var noSuggestionsString = "Hmm... No suggestions yet";

updateInputs();
updateOutputs();
updateIgnore();

clearInputButton.addEventListener("click", function(event) {
    inputError.style.visibility = "hidden";
    inputTags = [];
    updateInputs();
})

clearIgnoredButton.addEventListener("click", function(event) {
    if(ignoreTags.length > 0) {
        ignoreTags = [];
        updateIgnore();
        updateInputs();
    }
})

ignoreAllButton.addEventListener("click", function(event) {
    if(outputTags.length > 0){
        for(var i = 0; i < outputTags.length; i++) {
            ignoreTags.push(outputTags[i]);
        }

        updateIgnore();
        updateInputs();
    }
})

input.addEventListener("keyup", function(event) {
    str = input.value;
    if(event.which == 32 || event.which == 13) {
        input.value = "";
        tag = str.trim().toLowerCase();

        if(tag.length > 0) {
            addInputTag(tag.replace("#", ""));
        }
    }
});

function addInputTag(tag) {
    // Limit to 10 input tags
    if(inputTags.length >= 10) {
        inputError.style.visibility = "visible";
        return;
    } else {
        inputError.style.visibility = "hidden";
    }

    for(var i = 0; i < inputTags.length; i++) {
        // Tag already exists in input set
        if(tag == inputTags[i]) return;
    }

    inputTags.push(tag);
    updateInputs();
}

function removeInputTag(event) {
    tag = event.srcElement.dataset.tag;
    for(var i = 0; i < inputTags.length; i++) {
        if(tag == inputTags[i]) {
            inputTags.splice(i, 1);
            updateInputs();
            return;
        }
    }
}

function addIgnoreTag(tag) {
    for(var i = 0; i < ignoreTags.length; i++) {
        if(tag == ignoreTags[i]) return;
    }

    ignoreTags.push(tag);
    updateIgnore();
    updateInputs();
}

function updateIgnore() {
    ignore.innerHTML = "";

    if(ignoreTags.length == 0) {
        ele = document.createElement("div");
        ele.classList = "empty-msg no-select";
        ele.innerHTML = emptyIgnoreString;
        ignore.appendChild(ele)
    }

    ignore.style.visibility = "visible";
    for(var i = 0; i < ignoreTags.length; i++) {
        createTag(ignore, ignoreTags[i], null, removeIgnoreTag);
    }
}

function removeIgnoreTag(event) {
    tag = event.srcElement.dataset.tag;
    for(var i = 0; i < ignoreTags.length; i++) {
        if(tag == ignoreTags[i]) {
            ignoreTags.splice(i, 1);
            updateIgnore();
            updateInputs();
            return;
        }
    }
}

function updateInputs() {
    inputs.innerHTML = "";

    if(inputTags.length == 0) {
        ele = document.createElement("div");
        ele.classList = "empty-msg no-select";
        ele.innerHTML = emptyInputString;
        inputs.appendChild(ele)
    }

    requestSuggestions();

    for(var i = 0; i < inputTags.length; i++) {
        createTag(inputs, inputTags[i], null, removeInputTag);
    }
}

function updateOutputs() {
    outputs.innerHTML = "";

    if(outputTags.length == 0) {
        ele = document.createElement("div");
        ele.classList = "empty-msg no-select";
        if(inputTags.length == 0) {
            ele.innerHTML = emptyOutputString;
        } else {
            ele.innerHTML = noSuggestionsString;
        }
        outputs.appendChild(ele);
    }

    for(var i = 0; i < outputTags.length; i++) {
        createTag(outputs, outputTags[i], addSuggestionToInputList, addSuggestionToIgnoreList);
    }
}

function addSuggestionToInputList(event) {
    addInputTag(event.srcElement.dataset.tag);
}

function addSuggestionToIgnoreList(event) {
    addIgnoreTag(event.srcElement.dataset.tag);
}

function requestSuggestions() {
    if(inputTags.length == 0) {
        outputTags = [];
        updateOutputs();
        return
    }

    requestURL = "http://localhost:8080/discover?tags=" + inputTags.join(",");
    if(ignoreTags.length > 0) {
        requestURL += "&ignore=" + ignoreTags.join(",");
    }

    var req = new XMLHttpRequest();
    req.open("GET", requestURL, true);
    req.send(null);

    req.addEventListener("readystatechange", function() {
        if(req.readyState == 4) {
            outputTags = JSON.parse(req.response);
            updateOutputs()
        }
    }, false);
}

function createTag(parent, tag, bFunction, xFunction) {
    div = document.createElement("div");
    div.classList = "tag no-select";
    div.dataset.tag = tag;

    tagSpan = createTagSpan(tag, bFunction !== null);
    tagSpan.addEventListener("click", bFunction);
    div.appendChild(tagSpan);

    if(xFunction !== null) {
        xSpan = createXSpan(tag);
        xSpan.addEventListener("click", xFunction);
        div.appendChild(xSpan);
    }

    parent.appendChild(div);
}

function createXSpan(tag) {
    ele = document.createElement("span");

    x = document.createElement("img");
    x.src = "x.png";
    x.width = 16;
    x.height = 16;
    x.dataset.tag = tag;

    ele.appendChild(x);

    ele.classList = "x";
    ele.dataset.tag = tag;

    return ele;
}

function createTagSpan(tag, hasClickFunction) {
    ele = document.createElement("span");
    ele.innerHTML = tag;
    ele.dataset.tag = tag;

    if(hasClickFunction) {
        ele.classList = "tag underline";
    } else {
        ele.ClassList = "tag";
    }

    return ele;
}
