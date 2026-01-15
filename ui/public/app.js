document.getElementById("startBtn").onclick = () => {
  // In Phase 7.6 this will route to the creation flow
  window.location.href = "/#create";
};

document.getElementById("watchExampleBtn").onclick = () => {
  const video = document.querySelector(".hero-video");
  video.muted = false;

  if (video.requestFullscreen) {
    video.requestFullscreen();
  }

  video.play();
};
