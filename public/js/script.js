const butlerButton = document.getElementById("butler");
const daveButton = document.getElementById("dave");
const brockButton = document.getElementById("brock");
const brandonButton = document.getElementById("brandon");
const grumpButton = document.getElementById("grump");
const chooseCharacterPage = document.getElementById("chooseCharacter");
const talkToAiPage = document.getElementById("talkToAiPage")
const backToHomePage = document.getElementById("backToHomePage");



let nameValue = "AI"
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
// settings.style.display="none"
let dropdownList = document.getElementById('voices');
let chatPrompt = document.getElementById('chatPrompt');
let chosenVoice = 'discovery'
//   dropdownList.onchange = (ev) =>{
//   console.log("Selected value is: " + dropdownList.value);
// }
// chatPrompt.onchange = (ev) =>{
//   console.log("Selected value is: " + chatPrompt.value);
// }
let voiceValue = 1
let mediaRecorder;
let recordedChunks = [];
const btn = document.querySelector(".aiButton1");
var sendData=document.querySelector("#sendData");
var clearCache=document.querySelector("#clearCache");
var myTokens=document.querySelector(".tokenAmount");
// var chatPrompt=document.querySelector(".chatPrompt");
// var myCity=document.querySelector(".userCity");

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
span.style.cssText = "padding: 10px;background-color: #3d3d3e;;border-radius: 10px 10px 10px 0px;color: white;display:flex;"
div.appendChild(span);

div.id = `msg-${Date.now()}`;

}else{

const span = document.createElement('span');
span.style.cssText = "padding: 10px;background-color: #72727229;border-radius: 10px 10px 0px 10px; black;display:flex;"
span.innerText = `${messageText}`;
div.appendChild(span);

div.id = `msg-${Date.now()}`;
}
return div;
}






async function fetchAudioAfterProcessing(idToSend) {
try {
    let response = await fetch(`/audio/${idToSend}.mp3`);
    if (response.status === 404) {
        // If not found, wait for a bit and try again
        setTimeout(() => fetchAudioAfterProcessing(idToSend), 1000);
    } else {
        const audioElement = new Audio(`/audio/${idToSend}.mp3`);
        audioElement.play();
    }
} catch (error) {
    console.error("Error fetching the MP3:", error);
}
}



function sendMessage() {
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
}

sendTextButton.addEventListener("click", sendMessage);

// Event listener for the "Enter" key press in the textarea
userInput.addEventListener("keydown", function (event) {
if (event.key === "Enter" && !event.shiftKey) {
  event.preventDefault(); // Prevent the default behavior of the "Enter" key in a textarea
  sendMessage(); // Call the sendMessage function
}
});





// chatForm.addEventListener('submit', async()=>{
//   scrollToLatestMessageWithDelay();
//   sendDataToChatGPT()
// })

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
    console.log(entireResponse)
    console.log(idToSend)
    randomBoolean = false
    createAudioForDiv(currentResponseDiv);

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

// sendData.addEventListener("click",()=>{
//   if(dropdownList.value == 'discovery'){
//     console.log('chatbox1')
//     voiceValue = 1
//     chatboxTwo.style.display="none"
//     chatboxThree.style.display="none"
//     chatboxFour.style.display="none"
//     chatboxFive.style.display="none"
//     chatboxOne.style.display="flex"
//   }else if(dropdownList.value == 'dave'){
//     console.log('chatbox2')
//     voiceValue = 2
//     chatboxThree.style.display="none"
//     chatboxFour.style.display="none"
//     chatboxFive.style.display="none"
//     chatboxTwo.style.display="flex"
//     chatboxOne.style.display="none"
//   }else if(dropdownList.value == 'brock'){
//     console.log('chatbox3')
//     voiceValue = 3
//     chatboxThree.style.display="flex"
//     chatboxFour.style.display="none"
//     chatboxFive.style.display="none"
//     chatboxTwo.style.display="none"
//     chatboxOne.style.display="none"
//   }else if(dropdownList.value == 'brandon'){
//     console.log('chatbox4')
//     voiceValue = 4
//     chatboxThree.style.display="none"
//     chatboxFour.style.display="flex"
//     chatboxFive.style.display="none"
//     chatboxTwo.style.display="none"
//     chatboxOne.style.display="none"
//   }else if(dropdownList.value == 'oldMan'){
//     console.log('chatbox5')
//     voiceValue = 5
//     chatboxThree.style.display="none"
//     chatboxFour.style.display="none"
//     chatboxFive.style.display="flex"
//     chatboxTwo.style.display="none"
//     chatboxOne.style.display="none"
//   }
//   chosenVoice = dropdownList.value
//   console.log('does thie even work')
            
//             var obj={
//                     voice: dropdownList.value,
//                     voiceValue: voiceValue,
//                     prompt:chatPrompt.value,
//                     // city:myCity.value
//                 };
//                 fetch("/api",{
//                 method:"POST",
//                 headers:{
//                     "Content-type":"application/json"
//                 },
//                 body:JSON.stringify(obj)
//                 })
//                 // .then((r)=>r.json()).then((response)=>console.log(response));

//             })


backToHomePage.addEventListener('click', async () => {
    chooseCharacterPage.style.display="block"
    talkToAiPage.style.display="none"
})

butlerButton.addEventListener('click', async () => {
    console.log("butler")
    console.log('chatbox1')
    voiceValue = 1
    nameValue = "B"
    chooseCharacterPage.style.display="none"
    talkToAiPage.style.display="block"
    chatboxOne.style.display="flex"
    chatboxTwo.style.display="none"
    chatboxThree.style.display="none"
    chatboxFour.style.display="none"
    chatboxFive.style.display="none"
    chosenVoice = "discovery"
    promptValue = "Act smart and sophisticated giving clear concise and human responses"
    sendDataToBackendForCharacter()
})

daveButton.addEventListener('click', async () => {
    console.log("dave")
    console.log('chatbox2')
    voiceValue = 2
    nameValue = "D"
    chooseCharacterPage.style.display="none"
    talkToAiPage.style.display="block"
    chatboxTwo.style.display="flex"
    chatboxOne.style.display="none"
    chatboxTwo.style.display="flex"
    chatboxThree.style.display="none"
    chatboxFour.style.display="none"
    chatboxFive.style.display="none"
    chosenVoice = "dave"
    promptValue = "act Serious"
    sendDataToBackendForCharacter()
})

brockButton.addEventListener('click', async () => {
    console.log("brock")
    console.log('chatbox3')
    voiceValue = 3
    nameValue = "H"
    chooseCharacterPage.style.display="none"
    talkToAiPage.style.display="block"
    chatboxThree.style.display="flex"
    chatboxOne.style.display="none"
    chatboxTwo.style.display="none"
    chatboxThree.style.display="flex"
    chatboxFour.style.display="none"
    chatboxFive.style.display="none"
    chosenVoice = "brock"
    promptValue = "Act sarcastic personable and human in your responses"
    sendDataToBackendForCharacter()
})

brandonButton.addEventListener('click', async () => {
    console.log("brandon")
    console.log('chatbox4')
    voiceValue = 4
    nameValue = "S"
    chooseCharacterPage.style.display="none"
    talkToAiPage.style.display="block"
    chatboxFour.style.display="flex"
    chatboxOne.style.display="none"
    chatboxTwo.style.display="none"
    chatboxThree.style.display="none"
    chatboxFour.style.display="flex"
    chatboxFive.style.display="none"
    chosenVoice = "brandon"
    promptValue = "act nerdy"
    sendDataToBackendForCharacter()
})

grumpButton.addEventListener('click', async () => {
    console.log("grump")
    console.log('chatbox5')
    voiceValue = 5
    nameValue = "G"
    chooseCharacterPage.style.display="none"
    talkToAiPage.style.display="block"
    chatboxFive.style.display="flex"
    chatboxOne.style.display="none"
    chatboxTwo.style.display="none"
    chatboxThree.style.display="none"
    chatboxFour.style.display="none"
    chatboxFive.style.display="flex"
    chosenVoice = "oldMan"
    promptValue = "act as donald trump"
    sendDataToBackendForCharacter()
})

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




chatRecordButton.addEventListener('touchstart', async (event) => {
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
});

chatRecordButton.addEventListener('touchend', () => {
if(!mediaRecorder){
console.log("couldnt recieve the user voice")
}else {

// alert(mediaRecorder.mimeType)

mediaRecorder.onstop = async () => {
const audioBlob = new Blob(recordedChunks);
const uniqueId = generateUniqueId();
console.log(audioBlob)
const formData = new FormData();
formData.append('file', audioBlob, 'recording.mp4');
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





chatRecordButton.addEventListener('mousedown', async (event) => {
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
});

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
  if (data.status === 'Audio created successfully.') {
    
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
progressOverlay.style.backgroundColor = '#c9ced3c4';
progressOverlay.style.pointerEvents = 'none';
progressOverlay.style.borderRadius = '10px';
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
    console.log("Click Position:", clickPosition);
    console.log("Click Percentage:", clickPercentage);
    console.log("Audio Current Time:", audio.currentTime);

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


// function togglePlayPause() {
// if (audio.paused) {
//     audio.play();
//     playPauseBtn.innerText = '||';
//     updatePlaybackProgress();
// } else {
//     audio.pause();
//     playPauseBtn.innerText = '▶';
//     // updatePlaybackProgress();
// }
// }

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