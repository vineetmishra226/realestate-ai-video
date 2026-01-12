class Listing {
  constructor({ title, price, address, images, script }) {
    this.title = title;
    this.price = price;
    this.address = address;
    this.images = images;
    this.script = script;
  }

  isValid() {
    return (
      typeof this.title === "string" &&
      Array.isArray(this.images) &&
      this.images.length > 0
    );
  }
}

module.exports = Listing;
