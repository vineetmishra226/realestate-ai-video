/**
 * Agent Preview Schema
 *
 * This defines EVERYTHING an agent can control
 * before rendering a video.
 *
 * UI, CLI, and API must follow this contract.
 */

module.exports = {
  version: 1,

  listing: {
    title: "",
    price: "",
    address: ""
  },

  media: {
    images: [
      /**
       * {
       *   id: "img_1",
       *   source: "uploaded" | "listing",
       *   path: "uploads/front.jpg" | "https://...",
       *   enabled: true,
       *   order: 1
       * }
       */
    ],

    videoProfile: "landscape", // landscape | square | vertical
    qualityPreset: "standard"  // fast | standard | high
  },

  audio: {
    enabled: true,
    voice: "default",          // future: male_au, female_nz, etc
    volume: 1.0
  },

  metadata: {
    createdAt: null,
    updatedAt: null
  }
};
