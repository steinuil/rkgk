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
	serveLocalFile("/logo.png", *root+"/logo.png")
	serveLocalFile("/style.css", *root+"/css/style.css")

	proxyImage("/pixiv/img/")
	proxyAPI("/pixiv/api/", "app-api.pixiv.net", "/")
	proxyAPI("/pixiv/auth/", "oauth.secure.pixiv.net", "/auth/")

	log.Println("serving on port " + *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}
