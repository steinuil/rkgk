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
	dumpDir := flag.String("dump-dir", "", "directory in which the responses should be dumped to")
	flag.Parse()

	if *dumpDir == "" {
		dumpDir = nil
	}

	serveLocalFile("/", *root+"/index.html")
	serveLocalFile("/script.js", *root+"/script.js")
	serveLocalFile("/logo.png", *root+"/logo.png")
	serveLocalFile("/style.css", *root+"/css/style.css")

	proxyImage("/pixiv/img/")
	proxyAPI("/pixiv/api/", "app-api.pixiv.net", "/", dumpDir)
	proxyAPI("/pixiv/auth/", "oauth.secure.pixiv.net", "/auth/", dumpDir)

	log.Println("serving on port " + *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}
