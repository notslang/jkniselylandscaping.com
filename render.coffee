{ArgumentParser} = require 'argparse'
find = require 'lodash.find'

argparser = new ArgumentParser(
  addHelp: true
)
argparser.addArgument(
  ['pageName']
  nargs: '?'
  defaultValue: ''
  help: ''
  type: 'string'
  metavar: 'PAGE_NAME'
)
argparser.addArgument(
  ['viewName']
  nargs: '?'
  defaultValue: ''
  help: ''
  type: 'string'
  metavar: 'VIEW_NAME'
)

description = 'Property Maintenance & Landscape Construction'

argv = argparser.parseArgs()
pagePath = argv.pageName.replace(
  /^content/, ''
).replace(
  /index\.html$/, ''
)
if pagePath isnt '/' then pagePath = pagePath.replace(/\/$/, '')

view = require "./view/#{argv.viewName}.marko.js"
console.error argv.viewName, pagePath

render = (str) ->
  obj = {}
  obj.pageList = require './page-list.json'
  obj.slideshow = require './slideshow-list.json'
  obj.title = find(obj.pageList, url: pagePath).title
  obj.url = pagePath
  obj.contents = str
  obj.googleAnalyticsId = 'UA-105401279-1'
  obj.phoneNumber = '978-360-8139'
  obj.description = description
  console.warn obj
  view.stream(
    obj
  ).pipe(
    process.stdout
  )

process.stdin.setEncoding 'utf8'
process.stdin.on 'readable', ->
  buffer = ''
  while (chunk = process.stdin.read()) isnt null
    buffer += chunk
  if buffer isnt ''
    render(buffer)
  return
