function	check_fortytwo() {
	local home_path=${HOME}
	if [[ ${home_path} == /mnt/nfs/homes/* ]]; then
		return 0
	fi
	return 1
}

function	read_42api_secret() {
	echo "You should register a new app on 42 intra (https://profile.intra.42.fr/oauth/applications/new)"
	echo "If this is already done, you must have client UID and Secret (https://profile.intra.42.fr/oauth/applications)"
	read -p "App UID given by 42: " -r
	UID42=${REPLY}; unset REPLY
	read -p "App Secret given by 42: " -r
	SECRET42=${REPLY}; unset REPLY
}

function	build_fortytwo() {
	echo "FortyTwo computer detected."
	read -r -d '' "ENV_VAR" <<- EOM
		# DOCKER
		DOCKER_SOCK=${DOCKER_HOST:7}
		# DB
		PRIVATE_PATH_DB=${HOME}/goinfre/db
		POSTGRES_USER=${USER}
		POSTGRES_PASSWORD=$(openssl rand -hex 20)
		POSTGRES_DB=${USER}
		# PG ADMIN
		PRIVATE_PATH_DEV=${HOME}/goinfre/pgadmin
		PGADMIN_DEFAULT_EMAIL=${USER}@student.42.fr
		PGADMIN_DEFAULT_PASSWORD=password_nul
		GUNICORN_ACCESS_LOGFILE=/dev/null
		# AUTH42
		FORTYTWO_APP_ID=${UID42}
		FORTYTWO_APP_SECRET=${SECRET42}
		REDIRECT_URL=http://localhost:8080/backend/auth/callback
		# JWT
		JWT_SECRET=$(openssl rand -hex 32)
		SIGN_CD=120000s
	EOM

}

function	build_other() {
	echo "Personnal computer detected !"
	read -r -d '' "ENV_VAR" <<- EOM
		# DOCKER
		DOCKER_SOCK=/var/run/docker.sock
		# DB
		PRIVATE_PATH_DB=./secret/db
		POSTGRES_USER=${USER}
		POSTGRES_PASSWORD=$(openssl rand -hex 20)
		POSTGRES_DB=${USER}
		# PG ADMIN
		PRIVATE_PATH_DEV=./secret/pgadmin
		PGADMIN_DEFAULT_EMAIL=${USER}@mail.fr
		PGADMIN_DEFAULT_PASSWORD=password_nul
		GUNICORN_ACCESS_LOGFILE=/dev/null
		# AUTH42
		FORTYTWO_APP_ID=${UID42}
		FORTYTWO_APP_SECRET=${SECRET42}
		REDIRECT_URL=http://localhost:8080/backend/auth/callback
		# JWT
		JWT_SECRET=$(openssl rand -hex 32)
		SIGN_CD=120000s
	EOM

}

read_42api_secret

if check_fortytwo; then
	build_fortytwo
else
	build_other
fi

echo "${ENV_VAR}" > .env