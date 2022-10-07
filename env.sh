#!/usr/bin/env bash

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

# Add assignment
echo "window._env_ = {" >> ./env-config.js

# Loop on environment variables prefixed with
# io_developer_portal and add them to env-config.js
while IFS='=' read -r -d '' k v; do
    if [[ ${k,,} == io_developer_portal* ]]; then
        echo "  $k: \"$v\"," >> ./env-config.js
    fi
done < <(env -0)

echo "}" >> ./env-config.js