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

    const box = document.querySelector("#box");
    const filesBox = document.querySelector("#files");
    const languageDropdown = document.querySelector("#language");
    const convertButton = document.querySelector("#convert");
    const textElement = document.querySelector("#text");

    let text = textElement.value;

    // populate languages in dropdown
    (() => {
        languageDropdown.innerHTML = languages
            .map(language => `<option value="${language.code}">${language.name}</option>`)
            .join('');
    })();

    function setLanguage() {
        choice = languages.find(language => language.code === this.value);
    }

    function changeText() {
        text = this.value;
    }

    function testFunc() {
        const xhr = new XMLHttpRequest();

        xhr.responseType = 'blob';

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== XMLHttpRequest.DONE){
                return;
            }

            if (xhr.status !== 200){
                console.log = this.statusText;
            }
            
            let audioTemp = {
                text,
                abvText: text.substring(0, 25),
                blob: `${URL.createObjectURL(this.response)}`,
                language: { name: choice.name, code: choice.code }
            };
            audioFiles.push(audioTemp);
            console.log(audioFiles);

            const newDiv = document.createElement("div");
            newDiv.classList.add("newDiv");
            box.appendChild(newDiv);

            const downloadLink = document.createElement("a");
            downloadLink.href = audioTemp.blob;
            downloadLink.download = `${audioTemp.abvText}.mp3`;
            downloadLink.innerHTML = "<button>Download</button>";
            newDiv.appendChild(downloadLink);
            
            const audioPlay = document.createElement("audio");
            audioPlay.src = audioTemp.blob;
            audioPlay.controls = true;
            newDiv.insertBefore(audioPlay, downloadLink);

            const audioText = document.createElement("p");
            audioText.innerHTML = `${audioTemp.text} [${audioTemp.language.name}]`;
            audioText.classList.add("audioText");
            newDiv.insertBefore(audioText, audioPlay);
            
        }

        xhr.open('GET', `https://cors-anywhere.herokuapp.com/https://code.responsivevoice.org/getvoice.php?t="${encodeURIComponent(text)}"&tl=${choice.code}`);

        xhr.send(null);

        return false;
    }

    convertButton.addEventListener('click', testFunc);
    languageDropdown.addEventListener('change', setLanguage);
    textElement.addEventListener('change', changeText);
