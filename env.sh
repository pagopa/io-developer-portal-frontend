#!/usr/bin/env bash

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

# Add assignment
echo "window._env_ = {" >> ./env-config.js

# Loop on environment variables prefixed with
# io_onboarding_pa and add them to env-config.js
for io_developer_portal_var in $(env | grep -i io_developer_portal); do
    varname=$(printf '%s\n' "$io_developer_portal_var" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$io_developer_portal_var" | sed -e 's/^[^=]*=//')
    debug=$(echo"$io_developer_portal_var")

    echo "  $varname: \"$varvalue\"," >> ./env-config.js
    echo "DEBUG: $io_developer_portal_var, $varname: \"$varvalue\" - \"$debug\""
done

echo "}" >> ./env-config.js

while IFS='=' read -r -d '' k v; do
    if [[ ${k,,} == io_developer_portal* ]]; then
        printf "'%s'='%s'\n" "$k" "$v"
    fi
done < <(env -0)
