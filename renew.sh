#!/bin/bash

sed -i '$d' ./_worker.js
echo "/* renewed at: $(date '+%Y-%m-%d %H:%M:%S') */" >> ./_worker.js