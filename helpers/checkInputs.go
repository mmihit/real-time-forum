package helpers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"unicode"

	"forum/internal/db"
)

func IsValidInput(user db.User) string {
	/*********** User Name *************/
	nameRegex := `^[A-Za-z0-9._-]{2,15}$`
	NameR := regexp.MustCompile(nameRegex)
	if !NameR.MatchString(user.UserName) {
		return "invalid name !"
	} else if len(user.UserName) > 15 {
		return "too long name 🥲"
	}

	/*********** Age *************/
	if (user.Age < 16 || user.Age > 120) {
		return "Invalid Age !"
	} 

	/*********** Gender *************/
	if (user.Gender != "male" && user.Gender != "female") {
		return "Invalid Gender !"
	}

	/*********** First Name *************/
	firstNameRegex := `^[A-Za-z-\s]{2,30}$`
	firstNameR := regexp.MustCompile(firstNameRegex)
	if !firstNameR.MatchString(user.FirstName) {
		return "Invalid First Name !"
	} else if len(user.UserName) > 30 {
		return "too long first name 🥲"
	}

	/*********** Last Name *************/
	lastNameRegex := `^[A-Za-z-\s]{2,30}$`
	lastNameR := regexp.MustCompile(lastNameRegex)
	if !lastNameR.MatchString(user.LastName) {
		return "Invalid Last Name !"
	} else if len(user.UserName) > 30 {
		return "too long Last name 🥲"
	}

	/*********** Email *************/
	emailRegex := `^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$`
	EmailR := regexp.MustCompile(emailRegex)
	if !EmailR.MatchString(user.Email) {
		return "invalid email !!!!"
	} else if len(user.Email) > 30 {
		return "too long email 🥲"
	}

	/*********** Password *************/

	if !isValidPassword(user.Password) || len(user.Password) < 8 {
		return "Your password needs to have a minimum of 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character 😅"
	} else if len(user.Password) > 15 {
		return "too long password 🥲"
	}
	return ""
}

func isValidPassword(password string) bool {
	Upper := false
	Lower := false
	Number := false
	SpecialCar := false
	carSpe := "@*-_+.;:,$#~&^£!?|%/\\{}()"

	for _, char := range password {
		if unicode.IsUpper(char) {
			Upper = true
		}
		if unicode.IsLower(char) {
			Lower = true
		}
		if unicode.IsDigit(char) {
			Number = true
		}
		if strings.Contains(carSpe, string(char)) {
			SpecialCar = true
		}
	}

	if Upper && Lower && Number && SpecialCar {
		return true
	}
	return false
}

func IsValidPost(title, content string) error {
	switch {
	case title == "":
		return fmt.Errorf("please enter a title")
	case content == "":
		return fmt.Errorf("please enter a content")
	}

	return nil
}

/********************** JsonResponse Function ***********************/
func JsonResponse(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"message": message,})
}
