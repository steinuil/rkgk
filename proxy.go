package main

import (
	"flag"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

func pixivProxy(proxyPath string, actualUrl string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet, http.MethodPost:
			rawUrl := actualUrl + strings.TrimPrefix(r.URL.Path, "/pixiv/"+proxyPath+"/")
			reqUrl, err := url.Parse(rawUrl)
			if err != nil {
				panic(err)
			}

			data := url.Values{}

			for key, v := range r.URL.Query() {
				for _, val := range v {
					data.Add(key, val)
				}
			}

			var req *http.Request

			if r.Method == http.MethodGet {
				reqUrl.RawQuery = data.Encode()
				req, _ = http.NewRequest(r.Method, reqUrl.String(), nil)
			} else {
				req, _ = http.NewRequest(r.Method, reqUrl.String(), strings.NewReader(data.Encode()))
				req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
			}

			req.Header.Set("Referer", "https://pixiv.net")
			req.Header.Set("App-OS", "android")
			req.Header.Set("App-OS-Version", "6.0.1")
			req.Header.Set("App-Version", "5.0.56")
			req.Header.Set("User-Agent", "PixivAndroidApp/5.0.56 (Android 6.0.1; SM-G850F)")
			if auth := req.Header.Get("Authorization"); auth != "" {
				req.Header.Set("Authorization", auth)
			}

			res, err := http.DefaultClient.Do(req)
			if err != nil {
				panic(err)
			}

			defer res.Body.Close()
			io.Copy(w, res.Body)
		case http.MethodOptions:
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Headers", "App-OS, App-OS-Version, App-Version, User-Agent, Authorization, Content-Type")
		default:
			panic("what why")
		}
	}
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	http.HandleFunc("/pixiv/api/", pixivProxy("api", "https://app-api.pixiv.net/"))
	http.HandleFunc("/pixiv/auth/", pixivProxy("auth", "https://oauth.secure.pixiv.net/auth/"))

	http.HandleFunc("/pixiv/img/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			panic("what")
		}

		if r.Header.Get("If-Modified-Since") != "" {
			w.WriteHeader(http.StatusNotModified)
			return
		}

		rawUrl := "https://i.pximg.net/" + strings.TrimPrefix(r.URL.Path, "/pixiv/img/")

		req, err := http.NewRequest("GET", rawUrl, nil)
		if err != nil {
			panic(err)
		}
		req.Header.Set("Referer", "https://pixiv.net")

		res, err := http.DefaultClient.Do(req)
		if err != nil {
			panic(err)
		}

		w.Header().Set("Last-Modified", time.Now().Format(time.RFC1123))

		defer res.Body.Close()
		io.Copy(w, res.Body)
	})

	port := flag.String("port", "9292", "port on which the proxy should be running")
	flag.Parse()

	log.Println("serving on port " + *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}
