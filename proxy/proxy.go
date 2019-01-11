package main

import (
	"flag"
	"log"
	"net/http"
)

func serveFile(url string, path string) {
	http.HandleFunc(url, func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, path)
	})
}

func main() {
	port := flag.String("port", "9292", "port on which the proxy should be running")
	root := flag.String("root", ".", "local path from which to serve the files")
	flag.Parse()

	serveFile("/", *root+"/index.html")
	serveFile("/script.js", *root+"dist/script.js")

	log.Println("serving on port " + *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}
