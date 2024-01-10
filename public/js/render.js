function renderResponses() {
    if (chatboxOne !== null) {
    // Render a new li for each todo
    for (var i = 1; i < 6; i++) {
        var messagesDivs = JSON.parse(localStorage.getItem(`messagesDivs${i}`));
        console.log(messagesDivs)
        if(messagesDivs !== null){
            for (var x = 0; x < messagesDivs.length; x++) {
                // console.log(messagesDivs[x.innerHTML])
                currentResponseDiv = createMessageDivRendering(messagesDivs[x].innerHTML, '#f2f2f2', messagesDivs[x].messageType, messagesDivs[x].waveformImageSrc, messagesDivs[x].id);
                if(i == 1){
                    chatboxOne.appendChild(currentResponseDiv);
                } else if(i == 2){
                    chatboxTwo.appendChild(currentResponseDiv);
                } else if(i == 3){
                    chatboxThree.appendChild(currentResponseDiv);
                } else if(i == 4){
                    chatboxFour.appendChild(currentResponseDiv);
                } else if(i == 5){
                    chatboxFive.appendChild(currentResponseDiv);
                }
            }
        }  
    }
}
}

function createMessageDivRendering(messageText, backgroundColor, messageType, waveformSrc, divID) {
    const div = document.createElement('div');
    div.style.cssText = `margin: 5px; padding: 5px; display: flex; align-items: center; display: block;width: fit-content;max-width: 400px;align-self: end;border-radius:5px;overflow-wrap: anywhere;`;
    console.log(messageType)
    const ptag = document.createElement('p');
    if (messageType === 'server') {
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
        createAudioForDivRendering(div, waveformSrc, divID)
    }else{
    
        const span = document.createElement('span');
        span.style.cssText = "padding: 10px;background-color:rgb(207 207 207 / 16%);border-radius: 10px 10px 0px 10px; color: white;display:flex;"
        span.innerText = `${messageText}`;
        div.appendChild(span);
    }
    return div;
}


function createAudioForDivRendering(div, waveformSrc, divID) {  
    let div2 = document.createElement('div')
    div2.style.cssText = "display: flex;flex-wrap: nowrap;align-items: center;margin-top: 4px;width: fit-content;background-color: #7272724f;border-radius: 10px 10px 10px 0px;height:64px; width: -webkit-fill-available;"
    const playPauseBtn = document.createElement('button');
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
  
    const canvas = document.createElement('canvas');
    canvas.style.cssText = "padding: 10px;;border-radius: 10px 10px 10px 0px;color: white;"
    div2.appendChild(playPauseBtn);
    playPauseBtn.classList.add("playPauseBtn");
    playPauseBtn.classList.add("playPauseBtn--loading");
    div.appendChild(div2)
    scrollToLatestMessageWithDelay();
    
    
        
    const audio = document.createElement('audio');
    const audioSrc = `/audio/${divID}.mp3`;
    audio.src = audioSrc;
    div2.appendChild(audio);
    
    let progressOverlay;
  
  
    const containerDiv = document.createElement('div');
    containerDiv.style.position = 'relative'; // Required for correct overlay positioning
    containerDiv.style.width = '-webkit-fill-available'
    containerDiv.style.paddingRight = '5px'
    // Convert the canvas drawing to an image
    const waveformImage = document.createElement('img');
    waveformImage.src = waveformSrc ///still needs to be updated
    
    
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
        updatePlaybackProgressForMessage(progressOverlay, audio);
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

renderResponses()