alias ..="cd .."
alias ...="cd ../.."

alias h='cd ~'
alias c='clear'
alias art=artisan

alias phpspec='vendor/bin/phpspec'
alias phpunit='vendor/bin/phpunit'
alias serve=serve-laravel

alias xoff='sudo phpdismod -s cli xdebug'
alias xon='sudo phpenmod -s cli xdebug'

function artisan() {
    php artisan "$@"
}

function dusk() {
    pids=$(pidof /usr/bin/Xvfb)

    if [ ! -n "$pids" ]; then
        Xvfb :0 -screen 0 1280x960x24 &
    fi

    php artisan dusk "$@"
}

function serve-apache() {
    if [[ "$1" && "$2" ]]
    then
        sudo bash /vagrant/scripts/create-certificate.sh "$1"
        sudo dos2unix /vagrant/scripts/serve-apache.sh
        sudo bash /vagrant/scripts/serve-apache.sh "$1" "$2" 80
    else
        echo "Error: missing required parameters."
        echo "Usage: "
        echo "  serve-apache domain path"
    fi
}

function serve-laravel() {
    if [[ "$1" && "$2" ]]
    then
        sudo bash /vagrant/scripts/create-certificate.sh "$1"
        sudo dos2unix /vagrant/scripts/serve-laravel.sh
        sudo bash /vagrant/scripts/serve-laravel.sh "$1" "$2" 80
    else
        echo "Error: missing required parameters."
        echo "Usage: "
        echo "  serve domain path"
    fi
}

function serve-proxy() {
    if [[ "$1" && "$2" ]]
    then
        sudo dos2unix /vagrant/scripts/serve-proxy.sh
        sudo bash /vagrant/scripts/serve-proxy.sh "$1" "$2" 80
    else
        echo "Error: missing required parameters."
        echo "Usage: "
        echo "  serve-proxy domain port"
    fi
}

function serve-silverstripe() {
    if [[ "$1" && "$2" ]]
    then
        sudo bash /vagrant/scripts/create-certificate.sh "$1"
        sudo dos2unix /vagrant/scripts/serve-silverstripe.sh
        sudo bash /vagrant/scripts/serve-silverstripe.sh "$1" "$2" 80
    else
        echo "Error: missing required parameters."
        echo "Usage: "
        echo "  serve-silverstripe domain path"
    fi
}

function serve-spa() {
  if [[ "$1" && "$2" ]]
  then
    sudo bash /vagrant/scripts/create-certificate.sh "$1"
    sudo dos2unix /vagrant/scripts/serve-spa.sh
    sudo bash /vagrant/scripts/serve-spa.sh "$1" "$2" 80
  else
    echo "Error: missing required parameters."
    echo "Usage: "
    echo "  serve-spa domain path"
  fi
}

function serve-statamic() {
    if [[ "$1" && "$2" ]]
    then
        sudo bash /vagrant/scripts/create-certificate.sh "$1"
        sudo dos2unix /vagrant/scripts/serve-statamic.sh
        sudo bash /vagrant/scripts/serve-statamic.sh "$1" "$2" 80
    else
        echo "Error: missing required parameters."
        echo "Usage: "
        echo "  serve-statamic domain path"
    fi
}

function serve-symfony2() {
    if [[ "$1" && "$2" ]]
    then
        sudo bash /vagrant/scripts/create-certificate.sh "$1"
        sudo dos2unix /vagrant/scripts/serve-symfony2.sh
        sudo bash /vagrant/scripts/serve-symfony2.sh "$1" "$2" 80
    else
        echo "Error: missing required parameters."
        echo "Usage: "
        echo "  serve-symfony2 domain path"
    fi
}

function share() {
    if [[ "$1" ]]
    then
        ngrok http ${@:2} -host-header="$1" 80
    else
        echo "Error: missing required parameters."
        echo "Usage: "
        echo "  share domain"
        echo "Invocation with extra params passed directly to ngrok" 
        echo "  share domain -region=eu -subdomain=test1234"
    fi
}

function flip() {
    sudo bash /vagrant/scripts/flip-webserver.sh
}

function __has_pv() {
    $(hash pv 2>/dev/null);
    
    return $?
}

function __pv_install_message() {
    if ! __has_pv; then
        echo $1
        echo "Install pv with \`sudo apt-get install -y pv\` then run this command again."
        echo ""
    fi
}

function dbexport() {
    FILE=${1:-/vagrant/mysqldump.sql.gz}

    # This gives an estimate of the size of the SQL file
    # It appears that 80% is a good approximation of
    # the ratio of estimated size to actual size
    SIZE_QUERY="select ceil(sum(data_length) * 0.8) as size from information_schema.TABLES"

    __pv_install_message "Want to see export progress?"

    echo "Exporting databases to '$FILE'"

    if __has_pv; then
        ADJUSTED_SIZE=$(mysql --vertical -uhomestead -psecret -e "$SIZE_QUERY" 2>/dev/null | grep 'size' | awk '{print $2}')
        HUMAN_READABLE_SIZE=$(numfmt --to=iec-i --suffix=B --format="%.3f" $ADJUSTED_SIZE)

        echo "Estimated uncompressed size: $HUMAN_READABLE_SIZE"
        mysqldump -uhomestead -psecret --all-databases --skip-lock-tables 2>/dev/null | pv  --size=$ADJUSTED_SIZE | gzip > "$FILE"
    else
        mysqldump -uhomestead -psecret --all-databases --skip-lock-tables 2>/dev/null | gzip > "$FILE"
    fi

    echo "Done."
}

function dbimport() {
    FILE=${1:-/vagrant/mysqldump.sql.gz}

    __pv_install_message "Want to see import progress?"

    echo "Importing databases from '$FILE'"

    if __has_pv; then
        pv "$FILE" --progress --eta | zcat | mysql -uhomestead -psecret 2>/dev/null
    else
        cat "$FILE" | zcat | mysql -uhomestead -psecret 2>/dev/null
    fi

    echo "Done."
}

function xphp() {
    (php -m | grep -q xdebug)
    if [[ $? -eq 0 ]]
    then
        XDEBUG_ENABLED=true
    else
        XDEBUG_ENABLED=false
    fi

    if ! $XDEBUG_ENABLED; then xon; fi

    php \
        -dxdebug.remote_host=192.168.10.1 \
        -dxdebug.remote_autostart=1 \
        "$@"

    if ! $XDEBUG_ENABLED; then xoff; fi
}
