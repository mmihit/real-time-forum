package handlers

import (
	"fmt"
	"net/http"
)

func (h *Handler) AccessMiddleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			// helpers.JsonResponse(w, http.StatusUnauthorized, "Unauthorized: Please log in to continue.")
			http.Redirect(w, r, "/login", http.StatusFound)
			return
		}

		if _, err := h.DB.TokenVerification(cookie.Value); err != nil {
			http.Redirect(w, r, "/login", http.StatusFound)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) RedirectMiddleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := r.Cookie("session")
		fmt.Println(r.URL.Path)
		if err == nil {

			http.Redirect(w, r, "/", http.StatusPermanentRedirect)
			return

		}

		next.ServeHTTP(w, r)
	})
}
