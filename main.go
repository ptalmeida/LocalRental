package main

import "pedroAPI/cmd"

// @title           Pedro API
// @version         1.0
// @description     Portuguese accommodations (Alojamentos Locais) data API
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  support@pedroapi.com

// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT

// @host      localhost:8087
// @BasePath  /

// @securityDefinitions.basic  BasicAuth
func main() {
	cmd.Execute()
}
