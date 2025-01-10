package helpers

import (
	"html/template"
	"net/http"
)

type ErrData struct {
	Code int
	Msg  string
}

func WriteError(w http.ResponseWriter, errMsg string, code int) ErrData {
	var Err ErrData
	Err.Code = code
	Err.Msg = errMsg
	return Err
}

func ExecuteTmpl(w http.ResponseWriter, temp string, code int, errMsg string, data any) {
	w.WriteHeader(code)
	tmpl := template.Must(template.ParseGlob("./assets/templates/*.html"))

	if temp == "error.html" {
		data = WriteError(w, errMsg, code)
	}
	err := tmpl.ExecuteTemplate(w, temp, data)

	if err != nil {
		tmpl.ExecuteTemplate(w, "error_page.html", WriteError(w, "Internal Server Error!", http.StatusInternalServerError))
		return
	}
}
