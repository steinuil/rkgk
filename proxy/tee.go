package main

import "io"

// Pipes the output of a reader into a WriteCloser,
// and closes both Reader and Writer when done.
type teeReadCloser struct {
	r      io.ReadCloser
	w      io.WriteCloser
	reader io.Reader
}

func makeTeeReadCloser(r io.ReadCloser, w io.WriteCloser) teeReadCloser {
	return teeReadCloser{r, w, io.TeeReader(r, w)}
}

func (c teeReadCloser) Close() error {
	err := c.r.Close()
	if err != nil {
		return err
	}
	err = c.w.Close()
	if err != nil {
		return err
	}
	return nil
}

func (c teeReadCloser) Read(p []byte) (n int, err error) {
	return c.reader.Read(p)
}
