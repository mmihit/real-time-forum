package main

import (
	"html/template"
	"net/http"
)

type ErrorData struct {
	ErrMsg     string
	StatusCode int
}

func WriteError(w http.ResponseWriter, errMsg string, code int) ErrorData {
	var Err ErrorData
	Err.StatusCode = code
	Err.ErrMsg = errMsg
	return Err
}

func ExecuteTmpl(w http.ResponseWriter, temp string, code int, errMsg string, data any) {
	w.WriteHeader(code)
	tmpl := template.Must(template.ParseGlob("../assets/templates/*.html"))

	if temp == "error_page.html" {
		data = WriteError(w, errMsg, code)
	}
	err := tmpl.ExecuteTemplate(w, temp, data)
	// fmt.Println("parsfiles err: ", err)
	if err != nil {
		tmpl.ExecuteTemplate(w, "error_page.html", WriteError(w, "Internal Server Error!", http.StatusInternalServerError))
		return
	}
}
