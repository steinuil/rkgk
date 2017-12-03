package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"strings"
	//"time"
	"net/http"
)

func corsHandler(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Headers", "App-OS, App-OS-Version, App-Version, User-Agent, Authorization, Content-Type")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "*")

			io.WriteString(w, "")
		} else {
			h.ServeHTTP(w, r)
		}
	}
}

/*
func pixivProxy(proxyPath string, actualUrl string) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Headers", "App-OS, App-OS-Version, App-Version, User-Agent, Authorization, Content-Type")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "*")

			io.WriteString(w, "")
		} else {
		}
  }
}
*/

func main() {
	http.HandleFunc("/", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	}))

	http.HandleFunc("/pixiv/api/", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		url := "https://app-api.pixiv.net/" + strings.TrimPrefix(r.URL.Path, "/pixiv/api/")
		io.WriteString(w, url)
	}))

	http.HandleFunc("/pixiv/auth/", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		url := "https://oauth.secure.pixiv.net/auth/" + strings.TrimPrefix(r.URL.Path, "/pixiv/auth/")
		io.WriteString(w, url)
	}))

	http.HandleFunc("/pixiv/img/", func(w http.ResponseWriter, r *http.Request) {
		url := "https://i.pximg.net/" + strings.TrimPrefix(r.URL.Path, "/pixiv/img")
		io.WriteString(w, url)
	})

	port := flag.String("port", "9292", "port on which the proxy should be running")
	flag.Parse()

	fmt.Println("serving on port " + *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}
