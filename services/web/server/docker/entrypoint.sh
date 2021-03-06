#!/bin/sh

# This entrypoint script:
#
# - Executes *inside* of the container upon start as --user [default root]
# - Notice that the container *starts* as --user [default root] but
#   *runs* as non-root user [scu]
#
echo "Entrypoint for stage ${SC_BUILD_TARGET} ..."
echo "  User    :`id $(whoami)`"
echo "  Workdir :`pwd`"


if [[ ${SC_BUILD_TARGET} == "development" ]]
then
    # NOTE: expects docker run ... -v $(pwd):/devel/services/web/server
    DEVEL_MOUNT=/devel/services/web/server

    stat $DEVEL_MOUNT &> /dev/null || \
        (echo "ERROR: You must mount '$DEVEL_MOUNT' to deduce user and group ids" && exit 1) # FIXME: exit does not stop script

    USERID=$(stat -c %u $DEVEL_MOUNT)
    GROUPID=$(stat -c %g $DEVEL_MOUNT)
    GROUPNAME=$(getent group ${GROUPID} | cut -d: -f1)

    if [[ $USERID -eq 0 ]]
    then
        addgroup scu root
    else
        # take host's credentials in scu
        if [[ -z "$GROUPNAME" ]]
        then
            GROUPNAME=host_group
            addgroup -g $GROUPID $GROUPNAME
        else
            addgroup scu $GROUPNAME
        fi
        
        deluser scu &> /dev/null
        adduser -u $USERID -G $GROUPNAME -D -s /bin/sh scu
    fi
fi


su-exec scu "$@"
