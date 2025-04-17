package helpers

import (
	"net/http"
	"time"

	"forum/internal/db"
)

func DeleteCookie(w http.ResponseWriter, user string, d *db.Database) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    "",
		Path:     "/",
		Expires:  time.Now().Add(-time.Hour),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
	d.DeleteTokenFromDataBase(user)

}

func AddCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    token,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}

func CheckCookie(r *http.Request, d *db.Database) (string, error) {
	session, err := r.Cookie("session")
	if err != nil {
		return "", err
	}

	userName, err := d.TokenVerification(session.Value)
	if err != nil {
		return "", err
	}
	return userName, nil
}
