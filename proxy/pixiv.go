package main

import (
	"net/http"
	"net/http/httputil"
	"strings"
)

func proxyImage(proxyPath string) {
	proxy := httputil.ReverseProxy{Director: func(req *http.Request) {
		req.Host = "i.pximg.net"
		req.URL.Scheme = "https"
		req.URL.Host = "i.pximg.net"
		req.URL.Path = "/" + strings.TrimPrefix(req.URL.Path, proxyPath)
		req.Header.Set("Referer", "https://pixiv.net")
		req.Header.Del("Upgrade-Insecure-Requests")
	}}

	http.HandleFunc(proxyPath, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		if r.Header.Get("If-Modified-Since") != "" {
			w.WriteHeader(http.StatusNotModified)
			return
		}

		proxy.ServeHTTP(w, r)
	})
}

func proxyAPI(proxyPath string, actualHost string, pathPrefix string) {
	proxy := httputil.ReverseProxy{Director: func(req *http.Request) {
		req.Host = actualHost
		req.URL.Scheme = "https"
		req.URL.Host = actualHost
		req.URL.Path = pathPrefix + strings.TrimPrefix(req.URL.Path, proxyPath)
		req.Header.Set("Referer", "https://pixiv.net")
		req.Header.Set("App-OS", "android")
		req.Header.Set("App-OS-Version", "6.0.1")
		req.Header.Set("App-Version", "5.0.56")
		req.Header.Set("User-Agent", "PixivAndroidApp/5.0.56 (Android 6.0.1; SM-G850F)")
		req.Header.Del("Upgrade-Insecure-Requests")
	}}

	http.HandleFunc(proxyPath, func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet, http.MethodPost:
			proxy.ServeHTTP(w, r)

		case http.MethodOptions:
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Headers", "App-OS, App-OS-Version, App-Version, User-Agent, Authorization, Content-Type")

		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})
}
