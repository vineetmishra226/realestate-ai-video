const rawImages = Array.from(document.querySelectorAll("img")).map(img => ({
  src: img.src,
  dataSrc: img.getAttribute("data-src"),
  srcSet: img.getAttribute("srcset")
}));

return {
  title,
  price,
  address,
  rawImages
};
