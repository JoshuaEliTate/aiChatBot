const butlerButton = document.getElementsByClassName("butler");
const daveButton = document.getElementsByClassName("dave");
const brockButton = document.getElementsByClassName("brock");
const brandonButton = document.getElementsByClassName("brandon");
const grumpButton = document.getElementsByClassName("grump");
const mainPage = document.getElementById("mainPage");
const talkToAiPage = document.getElementById("talkToAiPage")
const backToHomePage = document.getElementById("backToHomePage");
const tryChatButton = document.getElementById("tryChat");
const characterPage = document.getElementById("characterPage");
const mainHeader = document.getElementById("mainHeader");
const chatHeader = document.getElementById("chatHeader");
const characterList = document.getElementById("characterList");
const contactFormSubmit = document.getElementById('contact-form')
const sendTextButton = document.getElementById("sendText");
const chatboxOne = document.getElementById('chatboxOne');
const chatboxTwo = document.getElementById('chatboxTwo');
const chatboxThree = document.getElementById('chatboxThree');
const chatboxFour = document.getElementById('chatboxFour');
const chatboxFive = document.getElementById('chatboxFive');
const chatPage = document.getElementById('chatPage');
const textarea = document.querySelector("textarea")
const settingsButton = document.getElementById('settingsButton');
const settings = document.getElementById("settings")
const chatContent = document.getElementById('chatContent');
const userInput = document.getElementById('userInput');
const sendText = document.getElementById('sendText');
const chatRecordButton= document.querySelector('#chatRecordButton');
let dropdownList = document.getElementById('voices');
let chatPrompt = document.getElementById('chatPrompt');
let chosenVoice = 'discovery'
let voiceValue = 1
let mediaRecorder;
let recordedChunks = [];
let promptValue = ''
let nameValue = "AI"
let textCompletionDone = true
const btn = document.querySelector(".aiButton1");
var sendData=document.querySelector("#sendData");
var clearCache=document.querySelector("#clearCache");
var myTokens=document.querySelector(".tokenAmount");

        textarea.addEventListener("keyup", e =>{
    textarea.style.height= `60`
    let scHeight = e.target.scrollHeight/2 +15;
    textarea.style.height= `${scHeight}px`

})

// settingsButton.addEventListener('click', async () => {
//   if(settings.style.display=="flex"){
//     console.log(settings.style.display)
//     settings.style.display="none"
//   }else {
//     settings.style.display="flex"
//   }
//   console.log("settings")
// })

function createMessageDiv(messageText, backgroundColor, messageType) {
const div = document.createElement('div');
div.style.cssText = `margin: 5px; padding: 5px; display: flex; align-items: center; display: block;width: fit-content;max-width: 400px;align-self: end;border-radius:5px;overflow-wrap: anywhere;`;


let divProperties = {}
let storedDivs = JSON.parse(localStorage.getItem(`messagesDivs${voiceValue}`)) || [];

const ptag = document.createElement('p');
if (messageType === 'Server') {
  div.style.cssText = `margin: 5px; padding: 5px; display: flex; align-items: center; display: block;width: fit-content;max-width: 400px;border-radius:5px;overflow-wrap: anywhere;`
const divAI = document.createElement('div')
ptag.innerText = nameValue
ptag.style.cssText = 'margin: auto; padding: 8px;'
divAI.style.cssText = `width: 40px; border-radius: 20px; height: 40px; position: absolute; margin-left: -45px; background-color: rgb(201, 206, 211); display: block; text-align: -webkit-center;`;
divAI.appendChild(ptag)
div.appendChild(divAI)
const span = document.createElement('span');
span.innerText = `${messageText}`;
span.style.cssText = "padding: 10px;background-color: rgb(207 207 207 / 16%);;border-radius: 10px 10px 10px 0px;display:flex; color:white;"
div.appendChild(span);

div.id = `msg-${Date.now()}`;
divProperties = {
  id: div.id,
  style: div.style.cssText,
  messageType: "server"
};
}else{

const span = document.createElement('span');
span.style.cssText = "padding: 10px;background-color: #72727229;border-radius: 10px 10px 0px 10px; black;display:flex; color:white;"
span.innerText = `${messageText}`;
div.appendChild(span);

div.id = `msg-${Date.now()}`;

divProperties = {
  id: div.id,
  innerHTML: messageText,
  style: div.style.cssText,
  messageType: "user"
};
}
storedDivs.push(divProperties);

localStorage.setItem(`messagesDivs${voiceValue}`, JSON.stringify(storedDivs));
return div;
}


async function fetchAudioAfterProcessing(idToSend) {
try {
    let response = await fetch(`/audio/${idToSend}.mp3`);
    if (response.status === 404) {
        // If not found, wait for a bit and try again
        setTimeout(() => fetchAudioAfterProcessing(idToSend), 500);
    } else {
        const audioElement = new Audio(`/audio/${idToSend}.mp3`);
        audioElement.play();
    }
} catch (error) {
    console.error("Error fetching the MP3:", error);
}
}



function sendMessage() {
  // if(textCompletionDone == true){

  
const message = userInput.value.trim();

// Check if the message is not empty
if (message !== "") {
  // Handle the message (you can add your logic here)
  console.log("Message sent:", message);
  scrollToLatestMessageWithDelay();
  sendDataToChatGPT()
  // Clear the textarea
  userInput.value = "";
}
// }
}

if (sendTextButton !== null) {

sendTextButton.addEventListener("click", function (){
  if(textCompletionDone == true){

  sendMessage()
  textCompletionDone =false
  }
} );
}
// Event listener for the "Enter" key press in the textarea
if (userInput !== null) {
userInput.addEventListener("keydown", function (event) {
  if(textCompletionDone == true){
if (event.key === "Enter" && !event.shiftKey) {
  console.log(textCompletionDone)
    textCompletionDone = false

  event.preventDefault(); // Prevent the default behavior of the "Enter" key in a textarea
  sendMessage(); // Call the sendMessage function
  }
}
});
}


function scrollToLatestMessage() {
const desiredScrollTop = document.documentElement.scrollHeight - window.innerHeight + 200;
window.scrollTo(0, desiredScrollTop > 200 ? desiredScrollTop - 200 : 0);
}

function scrollToLatestMessageWithDelay() {
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        scrollToLatestMessage();
    });
});
}


async function sendDataToChatGPT(transcription) {
let message = ''
if(transcription){
message = transcription;
userInput.value = '';
}else {

message = userInput.value;
userInput.value = '';
}
let randomBoolean = true


const userDiv = createMessageDiv(message, '#e6e6e6', 'You');
console.log(voiceValue)
if(voiceValue == 1){
console.log("chat 1")
chatboxOne.appendChild(userDiv);
}else if (voiceValue == 2){
console.log("chat 2")
chatboxTwo.appendChild(userDiv);
} else if(voiceValue == 3){
chatboxThree.appendChild(userDiv);
console.log("chat 3")
} else if(voiceValue == 4){
console.log("chat 4")
chatboxFour.appendChild(userDiv);
} else if(voiceValue == 5){
console.log("chat 5")
chatboxFive.appendChild(userDiv);
}
scrollToLatestMessageWithDelay();

currentResponseDiv = null;  // Reset for the new conversation turn

await fetch('/chat', {
method: 'POST',
headers: {
  'Content-Type': 'application/json',
},
body: JSON.stringify({ userInput: message, voiceValue: chosenVoice }),
});

const eventSource = new EventSource('/events');




eventSource.onmessage = async (event) => {

if (event.data !== 'undefined') {
eventSource.addEventListener('end', async () => {
  let entireResponse= ''
  let idToSend= ''
  if(randomBoolean == true){

    entireResponse = currentResponseDiv.querySelector('span').innerText
    idToSend = currentResponseDiv.id;
    // console.log(entireResponse)
    // console.log(idToSend)
    randomBoolean = false
    createAudioForDiv(currentResponseDiv);
    // console.log(div.id)


    let storedDivs = JSON.parse(localStorage.getItem(`messagesDivs${voiceValue}`)) || [];
    const lastDivObject = storedDivs[storedDivs.length - 1];

    // Check if there's a last JSON object
    if (lastDivObject) {
      // Add two new properties to the last JSON object
      lastDivObject.innerHTML = entireResponse;
    
    localStorage.setItem(`messagesDivs${voiceValue}`, JSON.stringify(storedDivs));
    }


    eventSource.close();
  }else{
    eventSource.close();
  }
});
    if (!currentResponseDiv) {
      console.log(voiceValue)
        currentResponseDiv = createMessageDiv('', '#f2f2f2', 'Server');
        if(voiceValue == 1){
          chatboxOne.appendChild(currentResponseDiv);
        } else if(voiceValue == 2){
          console.log(voiceValue)
          chatboxTwo.appendChild(currentResponseDiv);
        } else if(voiceValue == 3){
          chatboxThree.appendChild(currentResponseDiv);
        } else if(voiceValue == 4){
          chatboxFour.appendChild(currentResponseDiv);
        } else if(voiceValue == 5){
          chatboxFive.appendChild(currentResponseDiv);
        }
      }

    const span = currentResponseDiv.querySelector('span');
    span.innerText += event.data;
    scrollToLatestMessageWithDelay();
}
};

eventSource.onerror = (error) => {
console.error('EventSource failed:', error);
eventSource.close();
};
};

// clearCache.addEventListener("click",()=>{
// alert("All previous messages have been deleted from storage")
// fetch("/cacheClear",{
// method:"POST"
// })
                // .then((r)=>r.json()).then((response)=>console.log(response));

// })

if (backToHomePage !== null) {
backToHomePage.addEventListener('click', async () => {
    mainPage.style.display="block"
    talkToAiPage.style.display="none"
})
}
function changePage(voiceValue1, nameValue1, display1, display2, display3, display4, display5, chosenVoice1, promptValue1) {
  console.log(chosenVoice)
  console.log(`chatbox${voiceValue}`)
  voiceValue = voiceValue1
  nameValue = nameValue1
  // mainPage.style.display="none"
  talkToAiPage.style.display="block"
  // mainHeader.style.display="none"
  chatHeader.style.display="block"
  characterList.style.display="block"
  chatboxOne.style.display=display1
  chatboxTwo.style.display=display2
  chatboxThree.style.display=display3
  chatboxFour.style.display=display4
  chatboxFive.style.display=display5
  chosenVoice = chosenVoice1
  promptValue = promptValue1
  console.log(promptValue)
  sendDataToBackendForCharacter()
}

for (let i = 0; i < butlerButton.length; i++) {
  butlerButton[i].addEventListener('click', async () => {
    changePage(1, "B", "flex", "none", "none","none","none","discovery", "Act smart and sophisticated giving clear concise and human responses")
  })
}

for (let i = 0; i < daveButton.length; i++) {
  daveButton[i].addEventListener('click', async () => {
    changePage(2, "D", "none", "flex", "none","none","none","dave", "Act Serious")
  })
}

for (let i = 0; i < brockButton.length; i++) {
  brockButton[i].addEventListener('click', async () => {
    changePage(3, "B", "none", "none", "flex","none","none","brock", "Act as if you are Barack obama")
  })
}

for (let i = 0; i < brandonButton.length; i++) {
  brandonButton[i].addEventListener('click', async () => {
    console.log("brandon")
    changePage(4, "B", "none", "none", "none","flex","none","brandon", "Act as if you are Joe Biden")
  })
}

for (let i = 0; i < grumpButton.length; i++) {
  grumpButton[i].addEventListener('click', async () => {
    changePage(5, "G", "none", "none", "none","none","flex","oldMan", "Act as if you are Donald Trump")
  })
}



function sendDataToBackendForCharacter() {
    var obj={
        voice: chosenVoice,
        voiceValue: voiceValue,
        prompt: promptValue,
        // city:myCity.value
    };
    fetch("/api",{
        method:"POST",
        headers:{
            "Content-type":"application/json"
        },
        body:JSON.stringify(obj)
    })
        // .then((r)=>r.json()).then((response)=>console.log(response));
}



function generateUniqueId() {
return `${Date.now()}`;
}



if (chatRecordButton !== null) {

chatRecordButton.addEventListener('touchstart', async (event) => {
  if(textCompletionDone == false){
    return
  } else {
  textCompletionDone = false
if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices.getUserMedia) {
alert('MediaRecorder or getUserMedia is not supported on this browser. Please use a different browser.');
return;
}

event.preventDefault
recordedChunks = [];
const stream = await navigator.mediaDevices.getUserMedia({ audio: true }) 
mediaRecorder = new MediaRecorder(stream);

mediaRecorder.ondataavailable = (e) => {
mimeTypeText = `${mediaRecorder.mimeType}`
recordedChunks.push(e.data);
};

mediaRecorder.start();
  }
});
}


if (chatRecordButton !== null) {
chatRecordButton.addEventListener('touchend', () => {
if(!mediaRecorder){
console.log("couldnt recieve the user voice")
}else {

// alert(mediaRecorder.mimeType)

mediaRecorder.onstop = async () => {
const audioBlob = new Blob(recordedChunks);
const uniqueId = generateUniqueId();
// console.log(audioBlob)
const formData = new FormData();
formData.append('file', audioBlob, 'recording.mp4');
formData.append('uniqueId', uniqueId);
formData.append('voiceValue', chosenVoice)

try {
  const response = await fetch(`/upload`, { method: 'POST', body: formData });
  const data = await response.json();
  // console.log(data.transcription)
  sendDataToChatGPT(data.transcription)
} catch (error) {
  console.error('There was an error!', error);
}
};

mediaRecorder.stop();}
});
}



if (chatRecordButton !== null) {

chatRecordButton.addEventListener('mousedown', async (event) => {
  if(textCompletionDone == true){
  textCompletionDone = false
  if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices.getUserMedia) {
  alert('MediaRecorder or getUserMedia is not supported on this browser. Please use a different browser.');
  return;
  }

  // Start recording logic
  event.preventDefault
  recordedChunks = [];
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, {mimeType: 'audio/webm;codecs=opus'});

  mediaRecorder.ondataavailable = (e) => {
  recordedChunks.push(e.data);
  console.log(e.data.type)
  };

  mediaRecorder.start();
}
  });
}
if (chatRecordButton !== null) {
  chatRecordButton.addEventListener('mouseup', () => {
  if(!mediaRecorder){
  console.log("couldnt recieve the user voice")
  }else {

  console.log(mediaRecorder)

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(recordedChunks, { 'type' : 'audio/webm;codecs=opus' });
    const uniqueId = generateUniqueId();

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('uniqueId', uniqueId);
    formData.append('voiceValue', chosenVoice)
    try {
      const response = await fetch(`/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      console.log(data.transcription)
      sendDataToChatGPT(data.transcription)
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  mediaRecorder.stop();}
  });
}
  function createAudioForDiv(div) {
  const entireResponse = div.querySelector('span').innerText;
  const idToSend = div.id;

  let div2 = document.createElement('div')
  div2.style.cssText = "display: flex;flex-wrap: nowrap;align-items: center;margin-top: 4px;width: fit-content;background-color: #7272724f;border-radius: 10px 10px 10px 0px;height:64px; width: -webkit-fill-available;"
  const playPauseBtn = document.createElement('button');

  // playPauseBtn.style.cssText = "    margin-left: 5px;border-radius: 20px;width: 40px;height: 40px;-webkit-text-stroke-width: medium;"
  const canvas = document.createElement('canvas');
  canvas.style.cssText = "padding: 10px;;border-radius: 10px 10px 10px 0px;color: white;"
  div2.appendChild(playPauseBtn);
  playPauseBtn.classList.add("playPauseBtn");
  playPauseBtn.classList.add("playPauseBtn--loading");
  div.appendChild(div2)
  scrollToLatestMessageWithDelay();
  textCompletionDone = true

  fetch('/send-data', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
          entireResponse: entireResponse,
          divID: idToSend 
      }),
  })
  .then(response => response.json())
  .then(data => {
    console.log(data.status)
    if (data.status == 'Audio created successfully.') {
    setTimeout(() => {
      const audio = document.createElement('audio');
      const audioSrc = `/audio/${div.id}.mp3`;
      audio.src = audioSrc;
      div2.appendChild(audio);
    }, 750);
  const audio = document.createElement('audio');
  const audioSrc = `/audio/${div.id}.mp3`;
  audio.src = audioSrc;
  div2.appendChild(audio);

  let progressOverlay;

  const ctx = canvas.getContext('2d');

  let audioBuffer;
  let audioData;
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  fetch(audioSrc)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(buffer => {
          audioBuffer = buffer;
          audioData = buffer.getChannelData(0);
          drawWaveform();
      });


      // const numOfBars = 40;
      const numOfBars = 100;

      function drawWaveform() {
        const numOfBars = 100;  // set number of bars you'd like to display
        const spacing = 2;  // width of spacing in px
        const samplesPerBar = Math.ceil(audioData.length / numOfBars);

        const totalSpacing = (numOfBars - 1) * spacing;  // total width of all spacings
        const availableWidth = canvas.width - totalSpacing;  // remaining width after all spacings
        const barWidth = availableWidth / numOfBars;  // width of each bar
        const ampScale = canvas.height / 2;

        for (let i = 0; i < numOfBars; i++) {
            let min = 1.0;
            let max = -1.0;

            for (let j = 0; j < samplesPerBar; j++) {
                const datum = audioData[(i * samplesPerBar) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }

            ctx.fillStyle = '#4a4a4a';  // Color for waveform
            // The position is adjusted by adding the spacing (i * spacing) to it.
            ctx.fillRect((i * barWidth) + (i * spacing), (1 + min) * ampScale, barWidth, Math.max(1, (max - min) * ampScale));
        }
  const containerDiv = document.createElement('div');
  containerDiv.style.position = 'relative'; // Required for correct overlay positioning
  containerDiv.style.width = '-webkit-fill-available'
  containerDiv.style.paddingRight = '5px'
  // Convert the canvas drawing to an image
  const waveformImage = document.createElement('img');
  waveformImage.src = canvas.toDataURL("image/png");


  let storedDivs = JSON.parse(localStorage.getItem(`messagesDivs${voiceValue}`)) || [];
  const lastDivObject = storedDivs[storedDivs.length - 1];
  // console.log(waveformImage.src)
  // Check if there's a last JSON object
  if (lastDivObject) {
    // Add two new properties to the last JSON object
    lastDivObject.waveformImageSrc = waveformImage.src;

  localStorage.setItem(`messagesDivs${voiceValue}`, JSON.stringify(storedDivs));
  }


  // waveformImage.style.width = '240px'; 
  waveformImage.style.height = '60px';
  waveformImage.classList.add('waveformImage'); // Use class instead of ID for multiple elements

  // Create a progress overlay div
  progressOverlay = document.createElement('div');
  progressOverlay.style.position = 'absolute';
  progressOverlay.style.top = '0';
  progressOverlay.style.left = '0';
  progressOverlay.style.height = '100%';
  progressOverlay.style.width = '0%';
  progressOverlay.style.backgroundColor = 'rgb(47, 48, 49)';
  progressOverlay.style.pointerEvents = 'none';
  progressOverlay.style.borderRadius = '10px';
  progressOverlay.style.opacity = '0.7'

  progressOverlay.classList.add('progressOverlay');
  playPauseBtn.innerText = '▶';

  // Append the waveform and progress overlay to the container
  playPauseBtn.classList.remove("playPauseBtn--loading")
  setTimeout(function(){
    audio.play();
    playPauseBtn.innerText = '||';
    updatePlaybackProgressForMessage(progressOverlay, audio);
  },500)



  containerDiv.appendChild(waveformImage); // if you want to go back //above js and change the appendchild to canvas
  containerDiv.appendChild(progressOverlay);
  div2.appendChild(containerDiv);

  waveformImage.addEventListener('click', function(event) {
      const rect = waveformImage.getBoundingClientRect();
      const scaleX = waveformImage.width / rect.width;

      // Calculate the exact position of the click relative to the image
      const clickPosition = (event.clientX - rect.left) * scaleX; 

      const clickPercentage = clickPosition / waveformImage.width;
      audio.currentTime = clickPercentage * audio.duration;
      // console.log("Click Position:", clickPosition);
      // console.log("Click Percentage:", clickPercentage);
      // console.log("Audio Current Time:", audio.currentTime);

      updatePlaybackProgressForMessage(progressOverlay, audio);
  });
      }



  playPauseBtn.addEventListener('click', function() {
      if (audio.paused) {
          audio.play();
          playPauseBtn.innerText = '||';
          updatePlaybackProgressForMessage(progressOverlay, audio);
      } else {
          audio.pause();
          playPauseBtn.innerText = '▶';
      }
  });


  audio.addEventListener('ended', function() {
  playPauseBtn.innerText = '▶';
  });

  function updatePlaybackProgressForMessage(progressOverlay, audio) {
  console.log(!audio.paused)
  if (audio.currentTime < audio.duration) {
      const percentage = (audio.currentTime / audio.duration) * 100;

      // Update the width of the specific progress overlay
      progressOverlay.style.width = percentage + '%';
    if(!audio.paused){
      requestAnimationFrame(() => updatePlaybackProgressForMessage(progressOverlay, audio))
    }


  }
  }
  }

  })
  .catch(error => {
      console.error('There was an error posting the message:', error);
  });
}




if(contactFormSubmit !== null){
contactFormSubmit.addEventListener('submit', function (event) {
    event.preventDefault();

    emailjs.sendForm('service_t0jbs5g', "template_jgpy0nf", this, 'V1Akz0TnxKs8w1187')
        .then(function (response) {
            alert('Email sent successfully!');
            document.getElementById('contact-form').reset();
        }, function (error) {
            alert('Email failed to send. Please try again later.');
            console.error('EmailJS error:', error);
        });
});
}
// if(tryChatButton !== null){
// tryChatButton.addEventListener('click', function() {
//   // mainPage.style.display="block"
//   // mainPage.style.display="none"
// });
// }
