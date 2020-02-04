const languages = [
    {name: "English (British)", code: "en-GB"},
    {name: "English (American)", code: "en-US"},
    {name: "French (France)", code: "fr-FR"},
    {name: "French (Canada)", code: "fr-CA"},
    {name: "Spanish (Spain)", code: "es-ES"},
    {name: "Spanish (Mexico)",code: "es-MX"},
    {name: "Italian (Italy)", code: "it-IT"},
    {name: "German (Germany)", code: "de-DE"}
    ];
let choice = languages[0];
const audioFiles = [];
const maxFiles = 15;
const zip = new JSZip();
const folder = zip.folder('texttoaudio-files');

const box = document.querySelector(".box");
const inputBox = document.querySelector("#inputBox");
const filesBox = document.querySelector("#filesBox");
const languageDropdown = document.querySelector("#language");
const convertButton = document.querySelector("#convert");
const textElement = document.querySelector("#text");

let text = textElement.value;
let dividedText = [];
console.log(dividedText.length);

// populate languages in dropdown
(() => {
    languageDropdown.innerHTML = languages
        .map(language => `<option value="${language.code}">${language.name}</option>`)
        .join('');
})();

function divideText() {
    // split array by semi colons and remove empty items
    console.log(text);
    dividedText = text.split(";");
    dividedText = dividedText.map(item => item.trim());
    dividedText = dividedText.filter(item => item != '');
    console.log(dividedText);
    // returns false if too long
    if (dividedText.length > maxFiles) {
        alert(`The maximum number of audio files you can generate is ${maxFiles}`);
        return false;
    } else if (dividedText.length == 0) {
        alert(`Enter the text you would like to convert`);
        return false;
    } else {
        return dividedText;
    }
}

function convertText() {
    // returns if too many phrases
    if (divideText() === false) {
        return;
    }

    inputBox.innerHTML = "<p>Loading...</p>";

    let promises = [];

    dividedText.forEach((phrase, index) => {
        promises.push(requestAudio(phrase, index));
    });


    Promise.all(promises)
        .then(() => {
            // sorts files back in order
            audioFiles.sort((a, b) => a.order - b.order);
            // adds file to document
            audioFiles.forEach((file, index) => {
                addAudioUnit(file);
                // adds hr inbetween audio files
                if (index < audioFiles.length - 1){
                    const hrTag = document.createElement("hr");
                    filesBox.appendChild(hrTag);
                }
            })
        })
        .then(() => zip.generateAsync({type: 'blob'}))
        .then(blob => {
            // add zip download link
            const downloadZip = document.createElement("a");
            downloadZip.href = URL.createObjectURL(blob);
            downloadZip.download = "texttoaudio-files.zip";
            downloadZip.innerHTML = "<button class='mainButton' id='downloadZipButton'>Download Zip</button>";
            box.appendChild(downloadZip);
            // remove initial elements
            inputBox.style.display = "none";
        })
        
}

function requestAudio(phrase, index) {
    return new Promise((resolve, reject) => {    
        const xhr = new XMLHttpRequest();

        xhr.responseType = 'blob';

        xhr.open('GET', `https://cors-anywhere.herokuapp.com/https://code.responsivevoice.org/getvoice.php?t="${encodeURIComponent(phrase)}"&tl=${choice.code}`);

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== XMLHttpRequest.DONE){
                return;
            }

            if (xhr.status !== 200){
                console.log = this.statusText;
                reject();
            }

            let audioTemp = {
                order: index,
                text: phrase,
                abvText: phrase.substring(0, 25),
                blob: this.response,
                blobURL: `${URL.createObjectURL(this.response)}`,
                language: { name: choice.name, code: choice.code }
            };
            audioFiles.push(audioTemp);
            resolve();
        }

        xhr.send(null);

        return false;
    });
};

function addAudioUnit(file) {
    // pack audio into folder
    folder.file(`${file.abvText}.mp3`, file.blob);

    const newDiv = document.createElement("div");
    newDiv.classList.add("newDiv");

    newDiv.innerHTML = `
    <p class="audioText">${file.text}</p>
    <p class="audioLang">${file.language.name}</p>
    <audio src="${file.blobURL}" controls=""></audio>
    <a href="${file.blobURL}" download="${file.abvText}.mp3">
        <button class="download">Download</button>
    </a>
    `;
    filesBox.appendChild(newDiv);

}

function setLanguage() {
    choice = languages.find(language => language.code === this.value);
}

function changeText() {
    text = this.value;
}

convertButton.addEventListener('click', convertText);
languageDropdown.addEventListener('change', setLanguage);
textElement.addEventListener('change', changeText);
