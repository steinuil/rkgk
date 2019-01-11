package main

import (
	"flag"
	"log"
	"net/http"
)

func serveLocalFile(url string, path string) {
	http.HandleFunc(url, func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, path)
	})
}

func main() {
	port := flag.String("port", "9292", "port on which the proxy should be running")
	root := flag.String("root", ".", "local path from which to serve the files")
	flag.Parse()

	serveLocalFile("/", *root+"/index.html")
	serveLocalFile("/script.js", *root+"/script.js")

	proxyImage("/pixiv/img/")
	proxyAPI("/pixiv/api/", "https://app-api.pixiv.net/")

	log.Println("serving on port " + *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}
