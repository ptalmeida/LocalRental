package main

import "localRental/cmd"

// @title           LocalRental API
// @version         1.0
// @description     Portuguese accommodations (Alojamentos Locais) data API
// @termsOfService  http://swagger.io/terms/

// @host      localhost:8087
// @BasePath  /

// @securityDefinitions.basic  BasicAuth
func main() {
	cmd.Execute()
}
