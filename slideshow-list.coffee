fs = require 'fs'
path = require 'path'

getSlideshows = ->
  root = path.join(__dirname, '../content/slideshow')
  output = {}
  for dir in fs.readdirSync(root)
    photos = fs.readdirSync(path.join(root, dir))
    for i, photo of photos
      photos[i] = "/slideshow/#{dir}/#{photo}"
    output[dir] = photos
  return output

console.log JSON.stringify(getSlideshows())
