const { buildRenderPlan } = require("./video-pipeline");

const plan = buildRenderPlan({
  profile: "landscape",
  preset: "high"
});

console.log(JSON.stringify(plan, null, 2));
