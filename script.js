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
    if (dividedText.length > 55) {
        console.log("too many files");
        return false;
    } else {
    return dividedText;
    }
}

function requestAudio(phrase) {
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
                text: phrase,
                abvText: phrase.substring(0, 25),
                blob: this.response,
                blobURL: `${URL.createObjectURL(this.response)}`,
                language: { name: choice.name, code: choice.code }
            };
            audioFiles.push(audioTemp);
            addAudioUnit(audioTemp);
            resolve(audioTemp);
        }

        xhr.send(null);

        return false;
    });
};

function convertText() {
    if (divideText() === false) {
        return;
        // probs add some HTML in here
    }

    console.log(dividedText);

    let promises = [];

    dividedText.forEach(phrase => {
        promises.push(requestAudio(phrase));
    });


    Promise.all(promises)
        .then(() => zip.generateAsync({type: 'blob'}))
        .then(blob => {
            // add zip download link
            const downloadZip = document.createElement("a");
            downloadZip.href = URL.createObjectURL(blob);
            downloadZip.download = "texttoaudio-files.zip";
            downloadZip.innerHTML = "<button class='mainButton'>Download Zip</button>";
            box.appendChild(downloadZip);
            // remove initial elements
            inputBox.style.display = "none";
         })

}

function addAudioUnit(audioTemp) {
    const newDiv = document.createElement("div");
    newDiv.classList.add("newDiv");

    newDiv.innerHTML = `
    <p class="audioText">${audioTemp.text}</p>
    <p class="audioLang">${audioTemp.language.name}</p>
    <audio src="${audioTemp.blobURL}" controls=""></audio>
    <a href="${audioTemp.blobURL}" download="${audioTemp.abvText}.mp3">
        <button class="download">Download</button>
    </a>
    <hr>
    `;

    const divider = document.createElement("hr");
    newDiv.insertBefore(divider, newDiv.nextSibling);

    // const downloadLink = document.createElement("a");
    // downloadLink.href = audioTemp.blobURL;
    // downloadLink.download = `${audioTemp.abvText}.mp3`;
    // downloadLink.innerHTML = "<button class='download'>Download</button>";
    // newDiv.appendChild(downloadLink);

    // folder.file(`${audioTemp.abvText}.mp3`, audioTemp.blob);
    
    // const audioPlay = document.createElement("audio");
    // audioPlay.src = audioTemp.blobURL;
    // audioPlay.controls = true;
    // newDiv.insertBefore(audioPlay, downloadLink);

    // const audioText = document.createElement("p");
    // audioText.innerHTML = `${audioTemp.text}`;
    // audioText.classList.add("audioText");
    // newDiv.insertBefore(audioText, audioPlay);

    // const audioLang = document.createElement("p");
    // audioLang.innerHTML = `${audioTemp.language.name}`;
    // audioLang.classList.add("audioLang");
    // newDiv.insertBefore(audioLang, audioText.nextSibling);

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
