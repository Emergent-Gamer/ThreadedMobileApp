const root = document.querySelector(':root');
const body = document.querySelector('body');
const one = document.querySelector('.one');
const two = document.querySelector('.two');
const three = document.querySelector('.three');
const camView = document.querySelector('.my-recorder');
const camLoading = document.querySelector('.loading-camera');
const camShutter = document.querySelector('.photo-shoot');
const camSwitch = document.querySelector('.switch-camera');
const flashLight = document.querySelector('.flash-light');
const photoView = document.querySelector('.photo-viewer');
const canvasContainer =  document.querySelector('.canvas-container');
const photoViewClose = document.querySelector('.close-photo-viewer');
const dummyImageSelect = document.querySelector('.dummy-image-select')
const imageSelect = document.querySelector('.image-select')
let firstTouch = null;
let lastTouch = null;
let isLoading = false;
let isPlaying = null;
let isTurnedOnFlash = false;
let isFacingFront = false;
let isAutoDark = false;
let photoSettings;

//SWIPE_EVENT_ONE
one.addEventListener('touchstart', function (ev){
    firstTouch = ev.touches[0].clientX;
})

one.addEventListener('touchmove', function (ev) {
    lastTouch = ev.touches[0].clientX;
})

one.addEventListener('touchend', function (ev) {
if(lastTouch === null) return;
if(lastTouch <= firstTouch-100) {
        one.style.marginLeft = '-100%';
        camLoading.style.visibility = 'hidden';
}
        firstTouch = null;
        lastTouch = null;    
})



//SWIPE_EVENT_TWO
two.addEventListener('touchstart', function (ev){
firstTouch = ev.touches[0].clientX;
})

two.addEventListener('touchmove', function (ev) {
lastTouch = ev.touches[0].clientX;
})

two.addEventListener('touchend', function (ev) {
if(lastTouch === null) return;
if(lastTouch >= firstTouch+100){
        one.style.marginLeft = '5px';
setTimeout(function(){
        camLoading.style.visibility = 'visible';
        if(isPlaying == true) return;
        if(isFacingFront == true) loadFrontCameraView();
        if(isFacingFront == false) loadBackCameraView();
}, 500)
} else if(lastTouch <= firstTouch-100)two.style.marginLeft='-100%';
        firstTouch = null;
        lastTouch = null;
})



//SWIPE_EVENT_THREE
three.addEventListener('touchstart', function (ev){
firstTouch = ev.touches[0].clientX;
})

three.addEventListener('touchmove', function (ev) {
lastTouch = ev.touches[0].clientX;
})

three.addEventListener('touchend', function (ev) {
if(lastTouch === null) return;
if(lastTouch >= firstTouch+100) two.style.marginLeft = '5px';
        firstTouch = null;
        lastTouch = null;
})

function loadBackCameraView() {
if(isLoading == true) return;
isLoading = true;
camView.style.visibility = 'hidden';
let currentStream = camView.srcObject;
let currentTrack = currentStream?.getVideoTracks().forEach(track => track.stop())

navigator.mediaDevices.getUserMedia({video:{
facingMode:'environment',
advanced: [{
    exposureMode: 'continuous',
    whiteBalanceMode: 5000,
}]
    }}).then(stream => {
    camView.srcObject = stream;
    track = stream.getVideoTracks()[0];
    
camShutter.addEventListener('click', ()=> {
TakePhoto(track);
})
camView.addEventListener('loadedmetadata', ()=> {
camView.classList.remove('rotation-for-camView');
    camView.play();
    camView.onplaying = ()=> {
        setInterval(AutoFlashChecker, 250)
        camView.style.visibility = 'visible';
        isLoading = false;
        isPlaying = true;
    }
    isFacingFront = false;
})
})}



function loadFrontCameraView() {
if(isLoading == true) return;
isLoading = true;
camView.style.visibility = 'hidden';
let currentStream = camView.srcObject;
let currentTrack = currentStream?.getVideoTracks().forEach(track => track.stop())

navigator.mediaDevices.getUserMedia({video:{
facingMode:'user',
advanced: [{
    exposureMode: 'continuous'
}]
    }}).then(stream => {
    camView.srcObject = stream;
    track = stream.getVideoTracks()[0];
camView.addEventListener('loadedmetadata', ()=> {
    camView.classList.add('rotation-for-camView');
    camView.play();
    camView.onplaying = ()=> {
        camView.style.visibility = 'visible';
        isLoading = false;
        isPlaying = true;
    }
    isFacingFront = true;
})
})
}

camSwitch.addEventListener('click', ()=> {
   if(isLoading == true) return;
    camSwitch.style.transform = 'rotateZ(-360deg)';
    setInterval(()=> {
    camSwitch.style.transform = 'rotateZ(0deg)'
    }, 650)
    if(isFacingFront == false) loadFrontCameraView();
    else if(isFacingFront == true) loadBackCameraView();
})

async function TakePhoto(track){
let imageCapture = new ImageCapture(track);

if(isTurnedOnFlash == true) {
track.applyConstraints({
    advanced: [{
        torch: true,
    }]
})
} else if (isTurnedOnFlash == 'auto') {
if(isAutoDark == true) {
track.applyConstraints({
    advanced: [{
        torch: true,
    }]
})
}
}

setTimeout(()=> {
imageCapture.takePhoto(photoSettings).then(function(imageBitmaps){

   photoView.height = camView.videoHeight;
   if(isFacingFront == true) photoView.style.transform = 'rotateY(180deg)'
   photoView.src = URL.createObjectURL(imageBitmaps);
   photoView.onload = ()=> {
   canvasContainer.classList.add('canvas-containerOn')
   }
})
}, 1500)
setTimeout(()=> {
       track.applyConstraints({
        advanced: [{
            torch: false,
        }]
    })   
   }, 2000)
}

flashLight.addEventListener('click', ()=> {
    if(isTurnedOnFlash == false) {
    flashLight.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'
    root.style.setProperty('--visibilityForFlashLightAfter', 'hidden')
    isTurnedOnFlash = true;
    } else if(isTurnedOnFlash == true) {
    flashLight.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
    root.style.setProperty('--visibilityForFlashLightAfter', 'visible')
    isTurnedOnFlash = 'auto';
    } else {
    flashLight.style.backgroundColor = 'transparent';
    root.style.setProperty('--visibilityForFlashLightAfter', 'hidden')
    isTurnedOnFlash = false;
   }
})

function AutoFlashChecker(video) {
    let canvas = document.querySelector('.dummy-photo-viewer');
    let ctx = canvas.getContext('2d');
    canvas.width = camView.videoWidth;
    canvas.height = camView.videoHeight;
    ctx.drawImage(camView, 0, 0, canvas.width, canvas.height)
    
    let imageData = ctx.getImageData(50, 50, canvas.width-50, canvas.height-50)
    red = imageData.data[0]
    green = imageData.data[1]
    blue = imageData.data[2]
    
    if(red < 100 && green < 100 && blue < 100 ) {
        isAutoDark = true;
    } else {
        isAutoDark = false;
    }
}

photoViewClose.addEventListener('click', ()=> {
    canvasContainer.classList.remove('canvas-containerOn')
})

imageSelect.addEventListener('click', ()=> {
    dummyImageSelect.click()
})

dummyImageSelect.addEventListener('change', ()=> {
  let selectedFile = dummyImageSelect.files[0];
  let fileName = selectedFile.name;
  let fileSize = selectedFile.size;
  let splittable = fileName.lastIndexOf(".")
  let fileNameLength = fileName.length;
  let splittedFileName = fileName.substring(splittable+1, fileNameLength)

  let imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  let videoExtensions = ['mp4', 'webm', 'mov'];
  let audioExtensions = ['mp3', 'wav'];
  
  if(imageExtensions.includes(splittedFileName)) {
  sizeCheck(5000000);
  
  photoView.style.maxHeight = '99%';
  photoView.src =    
            URL.createObjectURL(selectedFile);
            canvasContainer.classList.add('canvas-containerOn');
  } else if(videoExtensions.includes(splittedFileName)){
  sizeCheck(100000000);  
      console.warn('video')
  } else if(audioExtensions.includes(splittedFileName)){
  sizeCheck(10000000);  
      console.warn('audio')
  } else {
      console.error('Unsupported Format: '+splittedFileName)
  }
  
  function sizeCheck(maxFileSize){
      if(fileSize >= maxFileSize) {
      console.error('File Size Is Too High: '
                    +Math.round(fileSize/1000000)
                    +'MBs\nMaximum File Size: '
                    +Math.round(maxFileSize/1000000)
                    +'MBs.');
                    return;
  }
  }
})

