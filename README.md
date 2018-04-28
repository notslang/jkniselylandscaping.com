# jkniselylandscaping.com

## How to compile

1. Clone the repo
2. Run `make all`. this will install all the required dependancies, build the project, and place the compiled static site in `./public`
3. Run an HTTP server to serve the site. I usually use the one that's bundled with Python 3 by doing:

    ```bash
    cd ./public
    python -m http.server
    ```

4. Run `make all` again each time files have been changed. This will only recompile the parts of the site that depend upon files that were updated.
