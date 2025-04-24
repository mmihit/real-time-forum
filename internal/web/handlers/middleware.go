package handlers

import (
	"net/http"

	"forum/helpers"
)

func (h *Handler) AccessMiddleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			http.Redirect(w, r, "/login", http.StatusFound)
			return
		}

		if _, err := h.DB.TokenVerification(cookie.Value); err != nil {
			helpers.DeleteCookie(w, h.Api.Params.Home.UserName, h.DB)
			http.Redirect(w, r, "/login", http.StatusFound)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (h *Handler) RedirectMiddleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := r.Cookie("session")
		if err == nil {
			http.Redirect(w, r, "/", http.StatusPermanentRedirect)
			return
		}

		next.ServeHTTP(w, r)
	})
}
