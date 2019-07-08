if forever list | grep -v "grep" | grep "uni_maven"
then
    forever stop "uni_maven"
    echo 'stopped'
fi
forever --killTree --minUptime 5000 --uid "uni_maven" -a start app.js