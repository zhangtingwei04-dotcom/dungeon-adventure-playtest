# Battle backgrounds

`wreck_base_v1.webp` — approved neutral daylight forest backdrop, 960×540. The image is loaded only during a wreck encounter; the original renderer is retained until it loads. Keep the wagon and debris independent; reuse the existing scene object lifecycle. Day/night tint and airborne weather stay shared. Ground snow/puddle placements and dynamic moon require dedicated calibration before enabling them for this camera. Do not mark the new background deployed before the binary is present and the scene is checked.
