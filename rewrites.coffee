redirects = {
  '/': []
  '/services': []
  '/about': []
  '/contact': []
}

for canonicalUrl, redirectList of redirects
  if canonicalUrl[-1...] is '/'
    console.log "rewrite ^#{canonicalUrl}index.html?$ #{canonicalUrl} permanent;"
  else
    console.log "rewrite ^#{canonicalUrl}(?:/index.html?|.html?|/)$ #{canonicalUrl} permanent;"

  for url in redirectList
    fixedUrl = url.replace(/\s/g, '\\s')
    if url[-1...] is '/'
      console.log "rewrite ^#{fixedUrl}(?:index.html?)?$ #{canonicalUrl} permanent;"
    else
      console.log "rewrite ^#{fixedUrl}(?:/index.html?|.html?|/)?$ #{canonicalUrl} permanent;"
