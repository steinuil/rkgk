package main

import (
	"io"
	"net/http"
	"net/url"
	"strings"
)

func proxyImage(url string) {
	http.HandleFunc(url, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		if r.Header.Get("If-Modified-Since") != "" {
			w.WriteHeader(http.StatusNotModified)
			return
		}

		rawURL := "https://i.pximg.net/" + strings.TrimPrefix(r.URL.Path, url)

		req, err := http.NewRequest("GET", rawURL, nil)
		if err != nil {
			panic(err)
		}

		req.Header.Set("Referer", "https://pixiv.net")

		res, err := http.DefaultClient.Do(req)
		if err != nil {
			panic(err)
		}

		defer res.Body.Close()
		io.Copy(w, res.Body)
	})
}

func proxyAPI(proxyPath string, actualURL string) {
	http.HandleFunc(proxyPath, func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet, http.MethodPost:
			rawURL := actualURL + strings.TrimPrefix(r.URL.Path, proxyPath)
			reqURL, err := url.Parse(rawURL)
			if err != nil {
				w.WriteHeader(http.StatusUnprocessableEntity)
				return
			}

			r.ParseForm()

			data := url.Values{}

			for key, v := range r.Form {
				for _, val := range v {
					data.Add(key, val)
				}
			}

			var req *http.Request

			if r.Method == http.MethodGet {
				reqURL.RawQuery = data.Encode()
				println(reqURL.String())
				req, _ = http.NewRequest(r.Method, reqURL.String(), nil)
			} else {
				req, _ = http.NewRequest(r.Method, reqURL.String(), strings.NewReader(data.Encode()))
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

			w.WriteHeader(res.StatusCode)

			defer res.Body.Close()
			io.Copy(w, res.Body)

		case http.MethodOptions:
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Headers", "App-OS, App-OS-Version, App-Version, User-Agent, Authorization, Content-Type")
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})
}
