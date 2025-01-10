package handlers

import "net/http"

func (h *Handler) AccessMiddleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			http.Redirect(w, r, "/login", http.StatusFound)
			return
		}

		if _, err := h.DB.TokenVerification(cookie.Value); err != nil {
			http.Redirect(w, r, "/logout", http.StatusFound)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) RedirectMiddleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := r.Cookie("session")
		if err == nil {
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		next.ServeHTTP(w, r)
	})
}
